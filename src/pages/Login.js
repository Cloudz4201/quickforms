import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const Login = () => {
  const { loginWithGoogle, loginWithGithub, loginWithEmail, registerWithEmail, isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('Login component rendered:', { isAuthenticated, loading, user });

  useEffect(() => {
    const checkUserStatus = async () => {
      if (isAuthenticated && user) {
        console.log('User is authenticated, checking onboarding status');
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.exists() ? userDoc.data() : null;
          
          console.log('User data:', userData);
          
          if (!userData || !userData.onboarding?.completed) {
            console.log('Redirecting to onboarding');
            navigate('/onboarding', { replace: true });
          } else {
            console.log('Redirecting to dashboard');
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          setError('Error checking user status. Please try again.');
        }
      }
    };

    checkUserStatus();
  }, [isAuthenticated, user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      console.log('Attempting Google login');
      setError('');
      setIsSubmitting(true);
      await loginWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      console.log('Attempting GitHub login');
      setError('');
      setIsSubmitting(true);
      await loginWithGithub();
    } catch (error) {
      console.error('GitHub login error:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      console.log('Attempting email auth:', { isRegistering });
      setError('');
      setIsSubmitting(true);
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (error) {
      console.error('Email auth error:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" component="h1" fontWeight={600} sx={{ mb: 3 }}>
          {isRegistering ? 'Create an Account' : 'Welcome Back'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleEmailAuth}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            fullWidth
            type="submit"
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          >
            {isRegistering ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
        >
          Continue with Google
        </Button>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<GitHubIcon />}
          onClick={handleGithubLogin}
          disabled={isSubmitting}
          sx={{ mb: 3 }}
        >
          Continue with GitHub
        </Button>

        <Typography variant="body2" color="text.secondary">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Button
            color="primary"
            onClick={() => setIsRegistering(!isRegistering)}
            sx={{ p: 0, minWidth: 'auto' }}
          >
            {isRegistering ? 'Sign In' : 'Create Account'}
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login; 