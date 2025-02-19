import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import Welcome from './steps/Welcome';
import UserProfile from './steps/UserProfile';
import UseCase from './steps/UseCase';
import TeamSetup from './steps/TeamSetup';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const steps = [
  'Welcome to Formly',
  'Your Profile',
  'Your Use Case',
  'Team Setup',
];

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { user, updateUserData } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [onboardingData, setOnboardingData] = useState({
    profile: {
      name: user?.displayName || '',
      company: '',
      role: '',
      industry: '',
    },
    useCase: {
      primaryUse: '',
      expectedResponses: '',
      integrationsNeeded: [],
    },
    team: {
      size: '',
      inviteMembers: [],
    },
  });

  const validateStep = (step) => {
    console.log('Validating step:', step, 'with data:', onboardingData);
    switch (step) {
      case 0: // Welcome
        return true;
      case 1: // Profile
        if (!onboardingData.profile.name || !onboardingData.profile.role || !onboardingData.profile.industry) {
          console.log('Profile validation failed:', { 
            name: onboardingData.profile.name,
            role: onboardingData.profile.role,
            industry: onboardingData.profile.industry 
          });
          setError('Please fill in all required profile fields');
          return false;
        }
        return true;
      case 2: // Use Case
        if (!onboardingData.useCase.primaryUse || !onboardingData.useCase.expectedResponses) {
          console.log('Use Case validation failed:', { 
            primaryUse: onboardingData.useCase.primaryUse,
            expectedResponses: onboardingData.useCase.expectedResponses 
          });
          setError('Please fill in all required use case fields');
          return false;
        }
        return true;
      case 3: // Team
        if (!onboardingData.team.size) {
          console.log('Team validation failed:', { size: onboardingData.team.size });
          setError('Please select a team size');
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    setError('');
    console.log('handleNext called, current step:', activeStep);
    
    if (activeStep === steps.length - 1) {
      console.log('On final step, validating...');
      if (!validateStep(activeStep)) {
        console.log('Final step validation failed');
        return;
      }
      
      try {
        console.log('Saving onboarding data...');
        setIsSubmitting(true);
        
        const userData = {
          email: user.email,
          name: onboardingData.profile.name || user.displayName || 'User',
          company: onboardingData.profile.company,
          role: onboardingData.profile.role,
          industry: onboardingData.profile.industry,
          useCase: onboardingData.useCase,
          team: onboardingData.team,
          updatedAt: new Date().toISOString(),
          onboarding: {
            completed: true,
            completedAt: new Date().toISOString(),
          },
          profile: {
            name: onboardingData.profile.name || user.displayName || 'User',
            company: onboardingData.profile.company,
            role: onboardingData.profile.role,
            industry: onboardingData.profile.industry,
          }
        };

        console.log('Saving user data:', userData);
        await updateUserData(userData);
        console.log('Data saved successfully, waiting before redirect...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Redirecting to dashboard...');
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Error saving onboarding data:', error);
        setError('Failed to save your information. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    
    console.log('Not on final step, validating current step...');
    if (validateStep(activeStep)) {
      console.log('Step validation passed, moving to next step');
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleSkip = async () => {
    try {
      setIsSubmitting(true);
      
      const userData = {
        email: user.email,
        name: user.displayName || 'User',
        updatedAt: new Date().toISOString(),
        onboarding: {
          completed: true,
          skipped: true,
          completedAt: new Date().toISOString(),
        },
        profile: {
          name: user.displayName || 'User'
        }
      };

      await updateUserData(userData);
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      setError('Failed to skip onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateData = (step, data) => {
    setOnboardingData((prev) => ({
      ...prev,
      [step]: { ...prev[step], ...data },
    }));
    setError('');
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <Welcome />;
      case 1:
        return (
          <UserProfile
            data={onboardingData.profile}
            updateData={(data) => updateData('profile', data)}
          />
        );
      case 2:
        return (
          <UseCase
            data={onboardingData.useCase}
            updateData={(data) => updateData('useCase', data)}
          />
        );
      case 3:
        return (
          <TeamSetup
            data={onboardingData.team}
            updateData={(data) => updateData('team', data)}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2, textAlign: 'center' }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 4, mb: 6 }}>{getStepContent(activeStep)}</Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          color="inherit"
          onClick={() => setActiveStep((prev) => prev - 1)}
          sx={{ mr: 1 }}
          disabled={activeStep === 0 || isSubmitting}
        >
          Back
        </Button>
        <Box>
          <Button
            color="inherit"
            onClick={handleSkip}
            sx={{ mr: 1 }}
            disabled={isSubmitting}
          >
            Skip Setup
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === steps.length - 1 ? (
              'Get Started'
            ) : (
              'Next'
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default OnboardingFlow; 