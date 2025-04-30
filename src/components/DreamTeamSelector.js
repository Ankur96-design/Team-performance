import React, { useState } from 'react';
import '../styles/DreamTeamSelector.css';
import SavedDreamTeam from './SavedDreamTeam';

const DreamTeamSelector = ({ team1Players, team2Players, onBack }) => {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [error, setError] = useState('');
  const [showSavedTeam, setShowSavedTeam] = useState(false);

  const handlePlayerSelect = (player) => {
    if (selectedPlayers.includes(player)) {
      setSelectedPlayers(selectedPlayers.filter(p => p !== player));
      setError('');
    } else {
      if (selectedPlayers.length < 11) {
        setSelectedPlayers([...selectedPlayers, player]);
        setError('');
      } else {
        setError('You can only select 11 players for your Dream Team');
      }
    }
  };

  const handleSaveTeam = () => {
    if (selectedPlayers.length === 11) {
      setShowSavedTeam(true);
    }
  };

  const handleSavedTeamBack = () => {
    setShowSavedTeam(false);
  };

  const isPlayerSelected = (player) => selectedPlayers.includes(player);

  const renderPlayerCard = (player, isSelected) => (
    <div
      key={player}
      className={`player-card ${isSelected ? 'selected' : ''}`}
      onClick={() => handlePlayerSelect(player)}
    >
      <div className="player-info">
        <span className="player-name">{player}</span>
      </div>
    </div>
  );

  if (showSavedTeam) {
    return <SavedDreamTeam players={selectedPlayers} onBack={handleSavedTeamBack} />;
  }

  return (
    <div className="dream-team-container">
      <h2>Create Your Dream Team</h2>
      <p className="selection-info">Select 11 players from both teams to create your perfect lineup</p>
      
      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}
      
      <div className="selected-count">
        <span>Selected Players: {selectedPlayers.length}/11</span>
        {selectedPlayers.length === 11 && (
          <span className="success-message"> - Perfect! You've selected 11 players</span>
        )}
      </div>
      
      <div className="teams-container">
        <div className="team-section">
          <h3>Team 1</h3>
          <div className="players-grid">
            {team1Players.map(player => renderPlayerCard(player, isPlayerSelected(player)))}
          </div>
        </div>

        <div className="team-section">
          <h3>Team 2</h3>
          <div className="players-grid">
            {team2Players.map(player => renderPlayerCard(player, isPlayerSelected(player)))}
          </div>
        </div>
      </div>

      {selectedPlayers.length > 0 && (
        <div className="selected-players">
          <h3>Your Dream Team Selection</h3>
          <div className="selected-players-grid">
            {selectedPlayers.map(player => (
              <div key={player} className="selected-player-card" onClick={() => handlePlayerSelect(player)}>
                <div className="player-info">
                  <span className="player-name">{player}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="buttons-container">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <button 
          className="save-button"
          disabled={selectedPlayers.length !== 11}
          onClick={handleSaveTeam}
        >
          Save Dream Team
        </button>
      </div>
    </div>
  );
};

export default DreamTeamSelector; 