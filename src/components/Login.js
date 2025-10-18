import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Card, Container, Link } from '@mui/material';
import axios from 'axios';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { GlobalTheme } from './../theme.js';
import { styled } from '@mui/material/styles';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://vadhuu.com/backend/login', { username, password });
      if (response.data.success) {
        onLogin();
      } else {
        alert('Invalid username or password');
      }
    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  return (
    <ThemeProvider theme={GlobalTheme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{
        height: '100%', justifyContent: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        <Card variant='outlined' sx={{ p: 8, width: '100%'}}>	
          <img src='https://vadhuu.com/static/media/logo.38ec35200b67031298a5.gif' alt='' style={{
            width: 100
          }} />
          <Typography
            component="h1"
            variant="h5"
            sx={{ width: '100%', fontSize: 'clamp(1rem, 10vw, 1.8rem)' }}
          >
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >

            <TextField
              label="Username"
              fullWidth
              autoFocus
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{
              borderRadius: 5, mt: 2, py: 1.2
            }}>Sign in</Button>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Link href="/Forgot" sx={{cursor: 'pointer'}}>Reset Password</Link>
            </Box>
          </Box>

        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default Login;
