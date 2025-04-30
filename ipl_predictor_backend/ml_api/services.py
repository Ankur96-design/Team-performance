from django.core.cache import cache
import pandas as pd
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed
import joblib
import os
from pathlib import Path
from typing import Dict, List, Optional, Union
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MLService:
    def __init__(self):
        self.model_cache = {}
        self.data_cache = {}
        self.executor = ThreadPoolExecutor(max_workers=4)  # Increased workers for better parallel processing
        self.project_root = Path(__file__).resolve().parent.parent.parent
        self.cache_timeout = 3600  # 1 hour cache timeout
        
        # Initialize team mapping
        self.team_map = {
            'Gujarat Titans': 'gt',
            'Kolkata Knight Riders': 'kkr',
            'Chennai Super Kings': 'csk',
            'Mumbai Indians': 'mi',
            'Delhi Capitals': 'dc',
            'Punjab Kings': 'pbks',
            'Rajasthan Royals': 'rr',
            'Royal Challengers Bangalore': 'rcb',
            'Sunrisers Hyderabad': 'srh',
            'Lucknow Super Giants': 'lsg'
        }

    def _load_team_data(self, team_name: str) -> Optional[pd.DataFrame]:
        """Load team data with error handling and caching"""
        cache_key = f'team_data_{team_name}'
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            return cached_data

        try:
            team_code = self.team_map.get(team_name, '').lower()
            if not team_code:
                logger.error(f"Invalid team name: {team_name}")
                return None

            file_path = self.project_root / f'{team_code}.xlsx'
            if not file_path.exists():
                logger.error(f"Team data file not found: {file_path}")
                return None

            df = pd.read_excel(file_path, usecols=['player_name'])
            cache.set(cache_key, df, timeout=self.cache_timeout)
            return df

        except Exception as e:
            logger.error(f"Error loading team data for {team_name}: {str(e)}")
            return None

    def load_data(self) -> Optional[pd.DataFrame]:
        """Load and cache performance data with optimized parallel processing"""
        cache_key = 'player_performance_data'
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            return cached_data

        try:
            # Load and combine all ball-by-ball data files
            bbb_files = ['bbb.csv', 'bbb1.csv', 'bbb2.csv']
            chunks = []
            
            for file in bbb_files:
                file_path = self.project_root / file
                if file_path.exists():
                    try:
                        for chunk in pd.read_csv(file_path, 
                                               usecols=['Date', 'Batter', 'Batter Runs', 'Ball', 
                                                       'Bowler', 'Bowler Runs Conceded', 'Valid Ball'],
                                               chunksize=100000):
                            chunks.append(chunk)
                    except Exception as e:
                        logger.warning(f"Error reading {file}: {str(e)}")
                        continue
            
            if not chunks:
                logger.error("No valid ball-by-ball data files found")
                return None
            
            bbb_df = pd.concat(chunks, ignore_index=True)

            # Process batting and bowling stats in parallel
            futures = []
            with ThreadPoolExecutor() as executor:
                futures.append(executor.submit(self._calculate_batting_stats, bbb_df))
                futures.append(executor.submit(self._calculate_bowling_stats, bbb_df))

            player_stats, bowler_stats = [f.result() for f in as_completed(futures)]

            # Calculate final performance metrics
            player_performance = self._calculate_performance_metrics(player_stats, bowler_stats)
            
            cache.set(cache_key, player_performance, timeout=self.cache_timeout)
            return player_performance

        except Exception as e:
            logger.error(f"Error loading performance data: {str(e)}")
            return None

    def _calculate_batting_stats(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate batting statistics"""
        return df.groupby('Batter').agg({
            'Batter Runs': ['sum', 'mean'],
            'Ball': 'count'
        }).pipe(lambda x: pd.DataFrame({
            'Total Runs': x[('Batter Runs', 'sum')],
            'Avg Runs': x[('Batter Runs', 'mean')],
            'Balls Faced': x[('Ball', 'count')]
        }))

    def _calculate_bowling_stats(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate bowling statistics"""
        return df.groupby('Bowler').agg({
            'Bowler Runs Conceded': ['sum', 'mean'],
            'Valid Ball': 'count'
        }).pipe(lambda x: pd.DataFrame({
            'Total Runs Conceded': x[('Bowler Runs Conceded', 'sum')],
            'Avg Runs Conceded': x[('Bowler Runs Conceded', 'mean')],
            'Balls Bowled': x[('Valid Ball', 'count')]
        }))

    def _calculate_performance_metrics(self, batting_stats: pd.DataFrame, 
                                    bowling_stats: pd.DataFrame) -> pd.DataFrame:
        """Calculate final performance metrics"""
        # Calculate strike rate and economy rate
        batting_stats['Strike Rate'] = (batting_stats['Total Runs'] / 
                                      batting_stats['Balls Faced']) * 100
        bowling_stats['Economy Rate'] = (bowling_stats['Total Runs Conceded'] / 
                                       bowling_stats['Balls Bowled']) * 6

        # Merge batting and bowling stats
        performance = pd.merge(
            batting_stats.reset_index(), 
            bowling_stats.reset_index(),
            left_on='Batter',
            right_on='Bowler',
            how='outer'
        ).fillna(0)

        # Calculate weighted performance score
        performance['Performance Score'] = (
            performance['Avg Runs'] * 0.4 +
            performance['Strike Rate'] * 0.3 -
            performance['Economy Rate'] * 0.2 +
            (performance['Total Runs'] / 100) * 0.1
        )

        return performance

    def predict_best_11(self, team1: str, team2: str, venue: str) -> Dict:
        """Predict best 11 players with enhanced error handling and response structure"""
        cache_key = f'prediction_{team1}_{team2}_{venue}'
        cached_prediction = cache.get(cache_key)
        
        if cached_prediction is not None:
            return cached_prediction

        try:
            # Load team data
            team1_data = self._load_team_data(team1)
            team2_data = self._load_team_data(team2)

            if team1_data is None or team2_data is None:
                return {
                    'status': 'error',
                    'error': 'Failed to load team data',
                    'details': 'One or both teams not found'
                }

            # Load performance data
            player_performance = self.load_data()
            if player_performance is None:
                return {
                    'status': 'error',
                    'error': 'Failed to load performance data',
                    'details': 'Error processing player statistics'
                }

            # Get players from both teams
            team1_players = team1_data['player_name'].tolist()
            team2_players = team2_data['player_name'].tolist()

            # Filter and sort player statistics
            team1_stats = player_performance[player_performance['Batter'].isin(team1_players)]
            team2_stats = player_performance[player_performance['Batter'].isin(team2_players)]

            if team1_stats.empty or team2_stats.empty:
                return {
                    'status': 'error',
                    'error': 'No player statistics found',
                    'details': 'Statistics not available for selected teams'
                }

            # Select best players based on performance score
            best_11_team1 = team1_stats.nlargest(6, 'Performance Score')[
                ['Batter', 'Performance Score', 'Strike Rate', 'Economy Rate']
            ].to_dict('records')
            
            best_11_team2 = team2_stats.nlargest(5, 'Performance Score')[
                ['Batter', 'Performance Score', 'Strike Rate', 'Economy Rate']
            ].to_dict('records')

            result = {
                'status': 'success',
                'team1_name': team1,
                'team2_name': team2,
                'venue': venue,
                'team1_players': best_11_team1,
                'team2_players': best_11_team2,
                'prediction_timestamp': pd.Timestamp.now().isoformat()
            }

            # Cache the prediction
            cache.set(cache_key, result, timeout=900)  # 15 minutes cache
            return result

        except Exception as e:
            logger.error(f"Error in predict_best_11: {str(e)}")
            return {
                'status': 'error',
                'error': 'Prediction failed',
                'details': str(e)
            } 