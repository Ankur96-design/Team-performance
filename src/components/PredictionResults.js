import React, { useState } from 'react';
import '../styles/PredictionResults.css';
import DreamTeamSelector from './DreamTeamSelector';
import CreateDreamTeam from './CreateDreamTeam';

const PredictionResults = ({ results, teams }) => {
  const [showDreamTeamSelector, setShowDreamTeamSelector] = useState(false);
  const [showCreateDreamTeam, setShowCreateDreamTeam] = useState(false);

  const handleCreateDreamTeam = () => {
    setShowCreateDreamTeam(true);
  };

  const handleBack = () => {
    setShowDreamTeamSelector(false);
    setShowCreateDreamTeam(false);
  };

  if (showCreateDreamTeam) {
    return <CreateDreamTeam onBack={handleBack} />;
  }

  if (!results || !teams) {
    return null;
  }

  return (
    <div className="prediction-results">
      <h2>Match Prediction Results</h2>
      
      <div className="team-distribution">
        <div className="team-card">
          <h3>{teams[results.team1].name}</h3>
          <p>Win Probability: {results.team1Probability}%</p>
        </div>
        <div className="team-card">
          <h3>{teams[results.team2].name}</h3>
          <p>Win Probability: {results.team2Probability}%</p>
        </div>
      </div>

      <div className="venue-info">
        <h3>Venue</h3>
        <p>{results.venue}</p>
      </div>

      <div className="players-list">
        <div className="team-players">
          <h3>{teams[results.team1].name} Players</h3>
          <ul>
            {teams[results.team1].players.map((player) => (
              <li key={player}>{player}</li>
            ))}
          </ul>
        </div>
        <div className="team-players">
          <h3>{teams[results.team2].name} Players</h3>
          <ul>
            {teams[results.team2].players.map((player) => (
              <li key={player}>{player}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="dream-team-buttons">
        <button 
          className="dream-team-button create-team"
          onClick={handleCreateDreamTeam}
        >
          Create Your Dream Team
        </button>
      </div>
    </div>
  );
};

export default PredictionResults; 