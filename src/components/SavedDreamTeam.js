import React from 'react';
import '../styles/SavedDreamTeam.css';

const SavedDreamTeam = ({ players, onBack }) => {
  return (
    <div className="saved-team-container">
      <div className="header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>Your Dream Team</h1>
      </div>

      <div className="team-overview">
        <div className="team-stats">
          <div className="stat-item">
            <span className="stat-label">Total Players</span>
            <span className="stat-value">{players.length}</span>
          </div>
        </div>
      </div>

      <div className="players-container">
        <div className="players-grid">
          {players.map((player, index) => (
            <div key={player} className="player-card">
              <div className="player-number">{index + 1}</div>
              <div className="player-info">
                <span className="player-name">{player}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedDreamTeam; 