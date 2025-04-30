import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import PlayersList from '../PlayersList/PlayersList';

const PredictionResults = ({ team1, team2, venue }) => {
  return (
    <Container maxWidth="lg">
      <Paper 
        elevation={3}
        sx={{
          mt: 4,
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,1))',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Typography variant="h4" gutterBottom align="center" sx={{ color: 'primary.main' }}>
          Match Prediction Results
        </Typography>
        
        <Typography variant="h6" gutterBottom align="center" sx={{ color: 'text.secondary', mb: 4 }}>
          {venue ? `Venue: ${venue}` : 'Analyzing team combinations'}
        </Typography>

        {team1 && team2 ? (
          <PlayersList team1={team1} team2={team2} />
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Select teams to see player predictions
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PredictionResults; 