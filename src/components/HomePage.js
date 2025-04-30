import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="content">
        <h1>IPL TEAM PERFORMANCE PREDICTOR</h1>
        <p>Create your dream team or let our AI predict the best combination of players</p>
        <button onClick={() => navigate('/options')} className="get-started-btn">
          🏏 GET STARTED
        </button>
      </div>
    </div>
  );
};

export default HomePage; 