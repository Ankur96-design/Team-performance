import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/OptionsPage.css';

const OptionsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="options-page">
      <button onClick={() => navigate('/')} className="back-button">
        ← Back
      </button>
      
      <div className="header">
        <h1>Choose Your Path</h1>
        <p>Select how you want to create your dream team</p>
      </div>

      <div className="options-container">
        <div className="option-card" onClick={() => navigate('/predict')}>
          <h2>🤖 AI Prediction</h2>
          <p>Let our advanced AI predict the best playing XI based on historical performance data</p>
          <div className="arrow">→</div>
        </div>

        <div className="option-card" onClick={() => navigate('/manual')}>
          <h2>✋ Manual Selection</h2>
          <p>Create your own dream team by selecting players manually</p>
          <div className="arrow">→</div>
        </div>
      </div>
    </div>
  );
};

export default OptionsPage; 