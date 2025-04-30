import React, { useState, useMemo, useCallback, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
} from '@mui/material';

const PredictTeam = () => {
  const [formData, setFormData] = useState({
    team1: '',
    team2: '',
    venue: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState(null);

  // Memoize teams object to prevent unnecessary re-renders
  const teams = useMemo(() => ({
    csk: { name: 'Chennai Super Kings' },
    dc: { name: 'Delhi Capitals' },
    gt: { name: 'Gujarat Titans' },
    kkr: { name: 'Kolkata Knight Riders' },
    lsg: { name: 'Lucknow Super Giants' },
    mi: { name: 'Mumbai Indians' },
    pbks: { name: 'Punjab Kings' },
    rcb: { name: 'Royal Challengers Bangalore' },
    rr: { name: 'Rajasthan Royals' },
    srh: { name: 'Sunrisers Hyderabad' },
  }), []);

  // Memoize venues array
  const venues = useMemo(() => [
    'Eden Gardens',
    'M Chinnaswamy Stadium',
    'Wankhede Stadium',
    'MA Chidambaram Stadium',
    'Arun Jaitley Stadium',
    'Narendra Modi Stadium',
  ], []);

  // Memoize handleChange function
  const handleChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  useEffect(() => {
    // Create a cancel token for the API request
    const cancelToken = axios.CancelToken.source();

    return () => {
      // Cancel any ongoing requests when component unmounts
      cancelToken.cancel('Component unmounted');
    };
  }, []);

  // Memoize handleSubmit function
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cancelToken = axios.CancelToken.source();

    try {
      const response = await axios.post('http://localhost:5000/api/predict', formData, {
        cancelToken: cancelToken.token,
        // Add timeout to prevent hanging requests
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setPredictions(response.data);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request cancelled:', err.message);
      } else {
        setError('Failed to get predictions. Please try again.');
        console.error('Prediction error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [formData]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ 
        p: 4, 
        borderRadius: 2, 
        bgcolor: '#1e4620',
        mb: 3 
      }}>
        <Typography variant="h3" gutterBottom align="center" sx={{ 
          color: '#fff',
          mb: 2,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
        }}>
          Predict Your Dream Team
        </Typography>
        <Typography variant="h6" align="center" sx={{ 
          color: '#fff',
          mb: 4,
          opacity: 0.9,
          fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
        }}>
          Use advanced analytics to find the best playing XI for any IPL match up
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={2} sx={{ 
          p: 3, 
          bgcolor: '#fff',
          borderRadius: 2
        }}>
          <Typography variant="h6" sx={{ 
            color: '#1e4620',
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}>
            <span style={{ fontSize: '1.4em', marginRight: '8px' }}>👥</span> Select Teams
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Team 1</InputLabel>
                  <Select
                    name="team1"
                    value={formData.team1}
                    onChange={handleChange}
                    required
                    sx={{
                      bgcolor: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(30, 70, 32, 0.23)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(30, 70, 32, 0.8)',
                      },
                    }}
                  >
                    {Object.entries(teams).map(([code, team]) => (
                      <MenuItem key={code} value={code} disabled={code === formData.team2}>
                        {team.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Team 2</InputLabel>
                  <Select
                    name="team2"
                    value={formData.team2}
                    onChange={handleChange}
                    required
                    sx={{
                      bgcolor: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(30, 70, 32, 0.23)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(30, 70, 32, 0.8)',
                      },
                    }}
                  >
                    {Object.entries(teams).map(([code, team]) => (
                      <MenuItem key={code} value={code} disabled={code === formData.team1}>
                        {team.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Venue</InputLabel>
                  <Select
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    required
                    sx={{
                      bgcolor: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(30, 70, 32, 0.23)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(30, 70, 32, 0.8)',
                      },
                    }}
                  >
                    {venues.map((venue) => (
                      <MenuItem key={venue} value={venue}>
                        {venue}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 4,
                py: 1.5,
                bgcolor: '#1e4620',
                '&:hover': {
                  bgcolor: '#2e5a2e',
                },
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Predict Best 11'}
            </Button>
          </Box>
        </Paper>

        {predictions && (
          <Paper elevation={2} sx={{ 
            mt: 4, 
            p: 3,
            bgcolor: '#fff',
            borderRadius: 2
          }}>
            <Typography variant="h6" sx={{ 
              color: '#1e4620',
              mb: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}>
              <span style={{ fontSize: '1.4em', marginRight: '8px' }}>⭐</span> Predicted Best XI
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ 
                  color: '#1e4620',
                  mb: 2,
                  borderBottom: '2px solid #1e4620',
                  pb: 1,
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}>
                  {teams[formData.team1].name}
                </Typography>
                {predictions.team1_players.map((player, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'rgba(30, 70, 32, 0.05)' }
                    }}
                  >
                    <Typography sx={{ 
                      color: '#000',
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}>
                      {index + 1}. {player.Batter}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#fff',
                        bgcolor: '#1e4620',
                        px: 1,
                        py: 0.5,
                        borderRadius: '12px',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}
                    >
                      #{index + 1}
                    </Typography>
                  </Box>
                ))}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ 
                  color: '#1e4620',
                  mb: 2,
                  borderBottom: '2px solid #1e4620',
                  pb: 1,
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}>
                  {teams[formData.team2].name}
                </Typography>
                {predictions.team2_players.map((player, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'rgba(30, 70, 32, 0.05)' }
                    }}
                  >
                    <Typography sx={{ 
                      color: '#000',
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}>
                      {index + 1}. {player.Batter}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#fff',
                        bgcolor: '#1e4620',
                        px: 1,
                        py: 0.5,
                        borderRadius: '12px',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}
                    >
                      #{index + 1}
                    </Typography>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </Paper>
        )}
      </Paper>
    </Container>
  );
};

export default React.memo(PredictTeam); 