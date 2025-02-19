import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Button,
  Chip,
  Paper,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';

const teamSizes = [
  'Just me',
  '2-5 people',
  '6-10 people',
  '11-25 people',
  '26-50 people',
  '50+ people',
];

const TeamSetup = ({ data, updateData }) => {
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAddTeamMember = () => {
    if (!newEmail) {
      setEmailError('Please enter an email address');
      return;
    }

    if (!validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (data.inviteMembers.includes(newEmail)) {
      setEmailError('This email has already been added');
      return;
    }

    updateData({
      inviteMembers: [...data.inviteMembers, newEmail],
    });
    setNewEmail('');
    setEmailError('');
  };

  const handleRemoveTeamMember = (email) => {
    updateData({
      inviteMembers: data.inviteMembers.filter((e) => e !== email),
    });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Set Up Your Team
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 6 }}>
        Invite your team members to collaborate on forms
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Team Size"
            name="size"
            value={data.size}
            onChange={handleChange}
            variant="outlined"
            helperText="How many people will be using Formly?"
          >
            {teamSizes.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Invite Team Members
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Add your team members' email addresses to invite them to Formly
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              label="Email Address"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                setEmailError('');
              }}
              error={!!emailError}
              helperText={emailError}
              variant="outlined"
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleAddTeamMember}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Box>

          {data.inviteMembers.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Team Members to Invite
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {data.inviteMembers.map((email) => (
                  <Chip
                    key={email}
                    label={email}
                    onDelete={() => handleRemoveTeamMember(email)}
                    deleteIcon={
                      <IconButton size="small">
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    }
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Team members will receive an invitation email once you complete the setup.
          {data.size !== 'Just me' &&
            !data.inviteMembers.length &&
            " Don't worry, you can always invite team members later."}
        </Typography>
      </Box>
    </Box>
  );
};

export default TeamSetup; 