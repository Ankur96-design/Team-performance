import React, { useState } from 'react';
import {
  Box,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
} from '@mui/material';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import LocationOnIcon from '@mui/icons-material/LocationOn';

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

const PredictionForm = ({ onSubmit, teams }) => {
  const [formData, setFormData] = useState({
    team1: '',
    team2: '',
    venue: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card
      sx={{
        p: 3,
        maxWidth: 600,
        mx: 'auto',
        borderRadius: 2,
        boxShadow: 3,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4 }}>
        Select Teams
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Team 1</InputLabel>
          <Select
            name="team1"
            value={formData.team1}
            onChange={handleChange}
            required
            startAdornment={<SportsCricketIcon sx={{ mr: 1 }} />}
          >
            {Object.entries(teams).map(([code, team]) => (
              <MenuItem
                key={code}
                value={code}
                disabled={code === formData.team2}
              >
                {team.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Team 2</InputLabel>
          <Select
            name="team2"
            value={formData.team2}
            onChange={handleChange}
            required
            startAdornment={<SportsCricketIcon sx={{ mr: 1 }} />}
          >
            {Object.entries(teams).map(([code, team]) => (
              <MenuItem
                key={code}
                value={code}
                disabled={code === formData.team1}
              >
                {team.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Venue</InputLabel>
          <Select
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            required
            startAdornment={<LocationOnIcon sx={{ mr: 1 }} />}
          >
            {venues.map((venue) => (
              <MenuItem key={venue} value={venue}>
                {venue}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{
            mt: 2,
            py: 1.5,
            background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #283593 30%, #1a237e 90%)',
            },
          }}
        >
          Predict Best 11
        </Button>
      </Box>
    </Card>
  );
};

export default PredictionForm; 