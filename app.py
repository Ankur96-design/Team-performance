from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import pickle
import os

app = Flask(__name__)
CORS(app)

# Load the model and required data
def load_model_and_data():
    # Load ball-by-ball data
    bbb_df = pd.read_csv('data/bbb.csv')
    
    # Load team data
    teams = ['csk', 'dc', 'gt', 'kkr', 'lsg', 'mi', 'pbks', 'rcb', 'rr', 'srh']
    team_data = {}
    for team in teams:
        file_name = f'data/{team}.xlsx'
        team_data[team] = pd.read_excel(file_name)
    
    # Preprocess and create player performance data
    bbb_df['Date'] = pd.to_datetime(bbb_df['Date'])
    bbb_df.fillna(0, inplace=True)
    
    # Calculate player stats
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
    
    # Merge stats and calculate performance score
    player_performance = pd.merge(player_stats, bowler_stats, left_on='Batter', right_on='Bowler', how='outer').fillna(0)
    player_performance.drop(columns=['Bowler'], inplace=True)
    player_performance['Performance Score'] = (
        player_performance['Avg Runs'] * 0.5 + 
        player_performance['Strike Rate'] * 0.3 - 
        player_performance['Economy Rate'] * 0.2
    )
    
    return player_performance, team_data

# Initialize data
player_performance, team_data = load_model_and_data()

@app.route('/api/predict', methods=['POST'])
def predict_best_11():
    try:
        data = request.get_json()
        team1 = data['team1']
        team2 = data['team2']
        venue = data['venue']
        
        # Get players from both teams
        team1_players = team_data[team1]['player_name'].tolist()
        team2_players = team_data[team2]['player_name'].tolist()
        
        # Get player stats and sort by performance score
        team1_stats = player_performance[player_performance['Batter'].isin(team1_players)]
        team2_stats = player_performance[player_performance['Batter'].isin(team2_players)]
        
        best_11_team1 = team1_stats.sort_values(by='Performance Score', ascending=False).head(6)
        best_11_team2 = team2_stats.sort_values(by='Performance Score', ascending=False).head(5)
        
        # Format response
        response = {
            'team1_players': best_11_team1[['Batter', 'Performance Score']].to_dict('records'),
            'team2_players': best_11_team2[['Batter', 'Performance Score']].to_dict('records'),
            'venue': venue
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 