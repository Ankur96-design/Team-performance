import React, { useState } from 'react';
import '../styles/CreateDreamTeam.css';
import { teams } from '../data/teams';
import DreamTeamSelector from './DreamTeamSelector';

const CreateDreamTeam = ({ onBack }) => {
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [venue, setVenue] = useState('');
  const [showDreamTeamSelector, setShowDreamTeamSelector] = useState(false);

  const venues = [
    'Arun Jaitley Stadium',
    'Barabati Stadium',
    'Barsapara Cricket Stadium',
    'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium',
    'Brabourne Stadium',
    'Buffalo Park',
    'De Beers Diamond Oval',
    'Dr DY Patil Sports Academy',
    'Dr. Y.S. Rajasekhara Reddy ACA-VDCA Cricket Stadium',
    'Dubai International Cricket Stadium',
    'Eden Gardens',
    'Feroz Shah Kotla',
    'Green Park',
    'Himachal Pradesh Cricket Association Stadium',
    'Holkar Cricket Stadium',
    'JSCA International Stadium Complex',
    'Kingsmead',
    'M Chinnaswamy Stadium',
    'MA Chidambaram Stadium',
    'Maharashtra Cricket Association Stadium',
    'Narendra Modi Stadium',
    'Nehru Stadium',
    'New Wanderers Stadium',
    'Newlands',
    'OUTsurance Oval',
    'Punjab Cricket Association IS Bindra Stadium',
    'Punjab Cricket Association Stadium',
    'Rajiv Gandhi International Stadium',
    'Sardar Patel Stadium',
    'Saurashtra Cricket Association Stadium',
    'Sawai Mansingh Stadium',
    'Shaheed Veer Narayan Singh International Stadium',
    'Sharjah Cricket Stadium',
    'Sheikh Zayed Stadium',
    'St George\'s Park',
    'Subrata Roy Sahara Stadium',
    'SuperSport Park',
    'Vidarbha Cricket Association Stadium',
    'Wankhede Stadium',
    'Zayed Cricket Stadium'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowDreamTeamSelector(true);
  };

  const handleDreamTeamBack = () => {
    setShowDreamTeamSelector(false);
  };

  if (showDreamTeamSelector) {
    return (
      <DreamTeamSelector
        team1Players={teams[team1]?.players || []}
        team2Players={teams[team2]?.players || []}
        onBack={handleDreamTeamBack}
      />
    );
  }

  return (
    <div className="dream-team-creator">
      <div className="header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>Select Your Dream Team</h1>
      </div>

      <div className="selection-container">
        <h2>Select Teams</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Team 1</label>
            <div className="select-wrapper">
              <select
                value={team1}
                onChange={(e) => setTeam1(e.target.value)}
                required
              >
                <option value="">Select Team 1</option>
                {Object.entries(teams).map(([key, team]) => (
                  <option key={key} value={key}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Team 2</label>
            <div className="select-wrapper">
              <select
                value={team2}
                onChange={(e) => setTeam2(e.target.value)}
                required
              >
                <option value="">Select Team 2</option>
                {Object.entries(teams).map(([key, team]) => (
                  <option key={key} value={key} disabled={key === team1}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Venue</label>
            <div className="select-wrapper">
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
              >
                <option value="">Select Venue</option>
                {venues.map((venue) => (
                  <option key={venue} value={venue}>
                    {venue}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="predict-button">
            Create your Dream Team
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDreamTeam; 