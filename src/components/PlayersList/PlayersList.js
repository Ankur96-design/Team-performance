import React from 'react';
import { Box, Card, Typography, Grid, Avatar } from '@mui/material';
import { teams } from '../../data/teams';

const PlayersList = ({ team1, team2 }) => {
  const getTeamPlayers = (teamCode) => {
    return teams[teamCode]?.players || [];
  };

  const team1Players = getTeamPlayers(team1);
  const team2Players = getTeamPlayers(team2);

  const PlayerCard = ({ name, team }) => (
    <Card
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 1,
        backgroundColor: 'background.paper',
        '&:hover': {
          boxShadow: 3,
          transform: 'scale(1.02)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <Avatar sx={{ bgcolor: team === team1 ? 'primary.main' : 'secondary.main' }}>
        {name.split(' ').map(n => n[0]).join('')}
      </Avatar>
      <Typography variant="body1">{name}</Typography>
    </Card>
  );

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Team 1 Players */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
            {teams[team1]?.name} Players
          </Typography>
          <Box>
            {team1Players.map((player, index) => (
              <PlayerCard key={`${team1}-${index}`} name={player} team={team1} />
            ))}
          </Box>
        </Grid>

        {/* Team 2 Players */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom sx={{ color: 'secondary.main' }}>
            {teams[team2]?.name} Players
          </Typography>
          <Box>
            {team2Players.map((player, index) => (
              <PlayerCard key={`${team2}-${index}`} name={player} team={team2} />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlayersList; 