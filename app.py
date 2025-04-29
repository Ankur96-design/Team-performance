from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

app = Flask(__name__)

# Load and prepare data
def load_data():
    bbb_df = pd.read_csv('bbb.csv')
    teams = ['csk', 'dc', 'gt', 'kkr', 'lsg', 'mi', 'pbks', 'rcb', 'rr', 'srh']
    team_data = {}
    for team in teams:
        file_name = f'{team}.xlsx'
        team_data[team] = pd.read_excel(file_name)
    return bbb_df, team_data

def prepare_model():
    bbb_df, team_data = load_data()
    
    # Preprocess data
    bbb_df['Date'] = pd.to_datetime(bbb_df['Date'])
    bbb_df.fillna(0, inplace=True)

    # Feature Engineering
    player_stats = bbb_df.groupby(['Batter']).agg({
        'Batter Runs': ['sum', 'mean'],
        'Ball': 'count'
    }).reset_index()
    player_stats.columns = ['Batter', 'Total Runs', 'Avg Runs', 'Balls Faced']
    player_stats['Strike Rate'] = (player_stats['Total Runs'] / player_stats['Balls Faced']) * 100

    bowler_stats = bbb_df.groupby(['Bowler']).agg({
        'Bowler Runs Conceded': ['sum', 'mean'],
        'Valid Ball': 'count'
    }).reset_index()
    bowler_stats.columns = ['Bowler', 'Total Runs Conceded', 'Avg Runs Conceded', 'Balls Bowled']
    bowler_stats['Economy Rate'] = (bowler_stats['Total Runs Conceded'] / bowler_stats['Balls Bowled']) * 6

    # Merge stats
    player_performance = pd.merge(player_stats, bowler_stats, left_on='Batter', right_on='Bowler', how='outer').fillna(0)
    player_performance.drop(columns=['Bowler'], inplace=True)
    
    # Load additional player stats for fantasy points calculation
    try:
        ipl_player_stats = pd.read_csv('IPL_Player_Stats.csv')
        # Rename the first column to 'batsman' if it doesn't have a header
        if 'batsman' not in ipl_player_stats.columns and ipl_player_stats.shape[1] == 15:
            ipl_player_stats.columns = ['batsman', 'total_runs', 'highest_score', 'total_balls', 'fours', 'sixes', 
                                       'strike_rate', 'total_wickets', 'runs_conceded', 'balls_bowled', 
                                       'overs_bowled', 'economy_rate', 'catches', 'stumpings', 'run_outs']
        
        # Convert columns to appropriate types
        numeric_cols = ['total_runs', 'highest_score', 'total_balls', 'fours', 'sixes', 'strike_rate',
                       'total_wickets', 'runs_conceded', 'balls_bowled', 'overs_bowled', 'economy_rate',
                       'catches', 'stumpings', 'run_outs']
        for col in numeric_cols:
            if col in ipl_player_stats.columns:
                ipl_player_stats[col] = pd.to_numeric(ipl_player_stats[col], errors='coerce').fillna(0)
        
        # Calculate fantasy points based on IPL fantasy points system
        ipl_player_stats['fantasy_points'] = (
            # Base points
            4 +  # Starting XI points
            ipl_player_stats['total_runs'] * 1 +  # 1 point per run
            ipl_player_stats['fours'] * 1 +       # 1 bonus point per boundary
            ipl_player_stats['sixes'] * 2 +        # 2 bonus points per six
            ipl_player_stats['total_wickets'] * 25 + # 25 points per wicket
            ipl_player_stats['catches'] * 8 +      # 8 points per catch
            ipl_player_stats['stumpings'] * 12 +   # 12 points per stumping
            ipl_player_stats['run_outs'] * 6       # 6 points per run out
        )
        
        # Add bonus points for half-centuries and centuries
        ipl_player_stats.loc[ipl_player_stats['highest_score'] >= 50, 'fantasy_points'] += 8  # Half century bonus
        ipl_player_stats.loc[ipl_player_stats['highest_score'] >= 100, 'fantasy_points'] += 8  # Century bonus (additional)
        
        # Economy rate bonus for bowlers (minimum 2 overs)
        bowlers_mask = ipl_player_stats['overs_bowled'] >= 2
        ipl_player_stats.loc[bowlers_mask & (ipl_player_stats['economy_rate'] < 6) & (ipl_player_stats['economy_rate'] >= 5), 'fantasy_points'] += 2
        ipl_player_stats.loc[bowlers_mask & (ipl_player_stats['economy_rate'] < 5) & (ipl_player_stats['economy_rate'] >= 4), 'fantasy_points'] += 4
        ipl_player_stats.loc[bowlers_mask & (ipl_player_stats['economy_rate'] < 4), 'fantasy_points'] += 6
        
        # Penalty for poor economy rate
        ipl_player_stats.loc[bowlers_mask & (ipl_player_stats['economy_rate'] > 9) & (ipl_player_stats['economy_rate'] <= 10), 'fantasy_points'] -= 2
        ipl_player_stats.loc[bowlers_mask & (ipl_player_stats['economy_rate'] > 10) & (ipl_player_stats['economy_rate'] <= 11), 'fantasy_points'] -= 4
        ipl_player_stats.loc[bowlers_mask & (ipl_player_stats['economy_rate'] > 11), 'fantasy_points'] -= 6
        
        # Merge with player_performance data
        player_performance = pd.merge(player_performance, 
                                     ipl_player_stats[['batsman', 'fantasy_points']], 
                                     left_on='Batter', 
                                     right_on='batsman', 
                                     how='left').fillna(0)
        player_performance.drop(columns=['batsman'], inplace=True, errors='ignore')
        
        # If fantasy_points are all zero, create a synthetic score
        if player_performance['fantasy_points'].sum() == 0:
            player_performance['fantasy_points'] = (
                player_performance['Total Runs'] * 1 + 
                player_performance['Avg Runs'] * 5 + 
                player_performance['Strike Rate'] * 0.1 - 
                player_performance['Economy Rate'] * 2
            )
            
    except Exception as e:
        print(f"Error loading IPL player stats: {e}")
        # Create synthetic fantasy points if file not found
        player_performance['fantasy_points'] = (
            player_performance['Total Runs'] * 1 + 
            player_performance['Avg Runs'] * 5 + 
            player_performance['Strike Rate'] * 0.1 - 
            player_performance['Economy Rate'] * 2
        )

    return player_performance, team_data, bbb_df

# Initialize model and data
player_performance, team_data, bbb_df = prepare_model()

@app.route('/')
def home():
    teams = ['csk', 'dc', 'gt', 'kkr', 'lsg', 'mi', 'pbks', 'rcb', 'rr', 'srh']
    venues = sorted(bbb_df['Venue'].unique())
    return render_template('index.html', teams=teams, venues=venues)

@app.route('/predict', methods=['POST'])
def predict():
    # Get JSON data and handle potential errors
    try:
        data = request.get_json(force=True)  # force=True will try to parse JSON even if content-type is not set correctly
        if data is None:
            return jsonify({'error': 'No JSON data received'}), 400
        
        # Check for required fields
        if not all(k in data for k in ('team1', 'team2', 'venue')):
            return jsonify({'error': 'Missing required fields: team1, team2, or venue'}), 400
        
        # Get values from JSON data
        team1 = data['team1']
        team2 = data['team2']
        venue = data['venue']
        
        # Validate team names
        if team1 not in team_data or team2 not in team_data:
            return jsonify({'error': 'Invalid team name provided'}), 400
            
        # Get team players
        team1_players = team_data[team1]['player_name'].tolist()
        team2_players = team_data[team2]['player_name'].tolist()
        all_players = team1_players + team2_players
        
        # Get player stats for both teams
        all_stats = player_performance[player_performance['Batter'].isin(all_players)].copy()
        
        # Add team information to identify which team each player belongs to
        all_stats['Team'] = ''
        all_stats.loc[all_stats['Batter'].isin(team1_players), 'Team'] = team1.upper()
        all_stats.loc[all_stats['Batter'].isin(team2_players), 'Team'] = team2.upper()
        
        # Add role classification based on player stats
        all_stats['Role'] = 'Batsman'  # Default role
        
        # Classify as bowler if they have bowled a significant number of balls
        all_stats.loc[all_stats['Balls Bowled'] > 100, 'Role'] = 'Bowler'
        
        # Classify as all-rounder if they have both batting and bowling stats
        all_stats.loc[(all_stats['Balls Faced'] > 100) & (all_stats['Balls Bowled'] > 50), 'Role'] = 'All-Rounder'
        
        # For simplicity, assume some players are wicketkeepers (in a real system, this would come from player data)
        # Here we're just randomly assigning some players as wicketkeepers for demonstration
        wicketkeeper_candidates = all_stats[all_stats['Role'] == 'Batsman'].sample(min(3, len(all_stats))).index
        all_stats.loc[wicketkeeper_candidates, 'Role'] = 'Wicket-Keeper'
        
        # Sort by fantasy points and select best 11 players across both teams
        best_11_combined = all_stats.sort_values(by='fantasy_points', ascending=False).head(11)
        
        # Count roles in the best 11
        role_counts = best_11_combined['Role'].value_counts().to_dict()
        
        # Prepare response with player details and their teams
        players_list = []
        for idx, (_, player) in enumerate(best_11_combined.iterrows(), 1):
            players_list.append({
                'position': idx,
                'name': player['Batter'],
                'team': player['Team'],
                'role': player['Role'],
                'fantasy_points': round(player['fantasy_points'], 1)
            })
        
        result = {
            'fantasy_team': {
                'players': players_list,
                'team1_count': len(best_11_combined[best_11_combined['Team'] == team1.upper()]),
                'team2_count': len(best_11_combined[best_11_combined['Team'] == team2.upper()]),
                'role_distribution': role_counts
            }
        }
        
        return jsonify(result)
        
    except Exception as e:
        # Log the error for debugging
        print(f"Error in predict endpoint: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)