import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Card, Container, IconButton, InputAdornment, Tooltip } from '@mui/material';
import { Visibility, VisibilityOff, Info } from '@mui/icons-material';
import axios from 'axios';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { GlobalTheme } from './../theme.js';
import { useNavigate } from 'react-router-dom';

const Forget = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [redirectCounter, setRedirectCounter] = useState(10); // Countdown in seconds
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (step === 1 && message.includes('Password reset successfully')) {
      timer = setInterval(() => {
        setRedirectCounter((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/'); // Redirect to login page
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, message, navigate]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError('Email cannot be blank.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email format.');
      return;
    }

    try {
      await axios.post('https://vadhuu.com/cmsapi/forget/send-otp', { email });
      setMessage('OTP sent to your email.');
      setError('');
      setStep(2);
    } catch (error) {
      setError('Email not found or failed to send OTP.');
    }
  };

  const handleValidateOtp = async () => {
    if (!otp) {
      setError('OTP cannot be blank.');
      return;
    }

    try {
      await axios.post('https://vadhuu.com/cmsapi/forget/validate-otp', { email, otp });
      setMessage('OTP validated. Please reset your password.');
      setError('');
      setStep(3);
    } catch (error) {
      setError('Invalid OTP.');
    }
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!regex.test(password)) {
      return 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.';
    }
    return '';
  };

  const handleResetPassword = async () => {
    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      await axios.post('https://vadhuu.com/cmsapi/forget/reset', {
        email,
        otp,
        newPassword,
      });
      setMessage('Password reset successfully. Redirecting to login in 10 seconds.');
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setPasswordError('');
    } catch (error) {
      setError('Failed to reset password.');
    }
  };

  const generateStrongPassword = () => {
    const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const digitChars = '0123456789';
    const specialChars = '@$!%*?&#';
    const allChars = upperCaseChars + lowerCaseChars + digitChars + specialChars;
  
    let password = '';
  
    // Ensure at least one character from each required category
    password += upperCaseChars.charAt(Math.floor(Math.random() * upperCaseChars.length));
    password += lowerCaseChars.charAt(Math.floor(Math.random() * lowerCaseChars.length));
    password += digitChars.charAt(Math.floor(Math.random() * digitChars.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
    // Fill the rest of the password with random characters from all categories
    for (let i = 4; i < 12; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
  
    // Shuffle the password to avoid predictable patterns
    password = password.split('').sort(() => Math.random() - 0.5).join('');
  
    // Set the generated password and clear errors/messages
    setNewPassword(password);
    setConfirmPassword(password);
    setPasswordError('');
    setMessage('Strong password generated.Make sure to copy the password first.');
  };

  return (
    <ThemeProvider theme={GlobalTheme}>
      <CssBaseline />
      <Container
        maxWidth="sm"
        sx={{
          height: '100%',
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card variant="outlined" sx={{ p: 8, width: '100%' }}>
          <Typography
            component="h1"
            variant="h5"
            sx={{ width: '100%', fontSize: '1.5rem', marginBottom: 2 }}
          >
            {step === 1
              ? 'Forgot Password'
              : step === 2
              ? 'Enter OTP'
              : 'Reset Password'}
          </Typography>
          {message && (
            <Typography color="green" sx={{ marginBottom: 2 }}>
              {message}
              {step === 1 && message.includes('Redirecting to login') && (
                <span> ({redirectCounter}s)</span>
              )}
            </Typography>
          )}
          {error && (
            <Typography color="error" sx={{ marginBottom: 2 }}>
              {error}
            </Typography>
          )}
          {step === 1 && (
            <Box>
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
              />
              <Button
                onClick={handleSendOtp}
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Send OTP
              </Button>
            </Box>
          )}
          {step === 2 && (
            <Box>
              <TextField
                label="OTP"
                fullWidth
                margin="normal"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setError('');
                }}
              />
              <Button
                onClick={handleValidateOtp}
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Validate OTP
              </Button>
            </Box>
          )}
          {step === 3 && (
            <Box>
              <Tooltip
                title="Password must have at least 8 characters, one uppercase, one lowercase, one number, and one special character."
                arrow
              >
                <TextField
                  label="New Password"
                  fullWidth
                  margin="normal"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError('');
                  }}
                  error={!!passwordError}
                  helperText={passwordError}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Tooltip>
              <TextField
                label="Confirm Password"
                fullWidth
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError('');
                }}
                error={!!passwordError}
              />
              <Button
                onClick={generateStrongPassword}
                variant="outlined"
                color="secondary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Generate Strong Password
              </Button>
              <Button
                onClick={handleResetPassword}
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Reset Password
              </Button>
            </Box>
          )}
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default Forget;
