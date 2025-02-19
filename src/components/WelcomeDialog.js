import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Backdrop,
} from '@mui/material';
import { Celebration as CelebrationIcon } from '@mui/icons-material';

const WelcomeDialog = ({ open, onClose, userName }) => {
  return (
    <>
      <Backdrop
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={open}
      />
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            p: 2,
          },
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
          <CelebrationIcon
            sx={{
              fontSize: 48,
              color: 'primary.main',
              mb: 2,
            }}
          />
          <Typography variant="h4" component="div" gutterBottom>
            Welcome to Formly!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Hi {userName}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Thank you for joining Formly. We're excited to help you create amazing forms and collect responses efficiently.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Get started by creating your first form or exploring our templates.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={onClose}
            sx={{
              px: 4,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
            }}
          >
            Let's Get Started
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WelcomeDialog; 