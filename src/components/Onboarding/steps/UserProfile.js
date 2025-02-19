import React from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';

const industries = [
  'Technology',
  'Marketing & Advertising',
  'Education',
  'Healthcare',
  'Financial Services',
  'E-commerce',
  'Real Estate',
  'Non-profit',
  'Other',
];

const roles = [
  'Business Owner',
  'Marketing Manager',
  'Sales Representative',
  'HR Manager',
  'Product Manager',
  'Customer Support',
  'Developer',
  'Other',
];

const UserProfile = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Tell us about yourself
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 6 }}>
        Help us personalize your Formly experience
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={data.name}
            onChange={handleChange}
            variant="outlined"
            helperText="How should we address you?"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Company/Organization"
            name="company"
            value={data.company}
            onChange={handleChange}
            variant="outlined"
            helperText="Where do you work?"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Role"
            name="role"
            value={data.role}
            onChange={handleChange}
            variant="outlined"
            helperText="What best describes your role?"
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Industry"
            name="industry"
            value={data.industry}
            onChange={handleChange}
            variant="outlined"
            helperText="What industry do you work in?"
          >
            {industries.map((industry) => (
              <MenuItem key={industry} value={industry}>
                {industry}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          This information helps us provide you with the most relevant templates and suggestions.
        </Typography>
      </Box>
    </Box>
  );
};

export default UserProfile; 