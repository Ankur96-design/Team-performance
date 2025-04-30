import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import OptionsPage from './components/OptionsPage';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const PredictTeam = lazy(() => import('./components/PredictTeam'));

const LoadingSpinner = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
    bgcolor="#1e4620"
  >
    <CircularProgress sx={{ color: '#fff' }} />
  </Box>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/options" element={<OptionsPage />} />
          <Route path="/predict" element={<PredictTeam />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App; 