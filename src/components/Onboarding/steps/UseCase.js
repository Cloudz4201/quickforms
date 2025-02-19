import React from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Autocomplete,
  Chip,
} from '@mui/material';
import { FORMLY_INFO } from '../../../constants/formly';

const useCases = [
  'Lead Generation',
  'Customer Feedback',
  'Job Applications',
  'Event Registration',
  'Contact Forms',
  'Surveys & Research',
  'Order Forms',
  'Support Requests',
  'Other',
];

const responseRanges = [
  '0-100 per month',
  '100-500 per month',
  '500-1000 per month',
  '1000+ per month',
];

const UseCase = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleIntegrationsChange = (event, newValue) => {
    updateData({ integrationsNeeded: newValue });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        How will you use Formly?
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 6 }}>
        Help us understand your needs to provide better recommendations
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Primary Use Case"
            name="primaryUse"
            value={data.primaryUse}
            onChange={handleChange}
            variant="outlined"
            helperText="What's the main way you'll use Formly?"
          >
            {useCases.map((useCase) => (
              <MenuItem key={useCase} value={useCase}>
                {useCase}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Expected Monthly Responses"
            name="expectedResponses"
            value={data.expectedResponses}
            onChange={handleChange}
            variant="outlined"
            helperText="How many form submissions do you expect?"
          >
            {responseRanges.map((range) => (
              <MenuItem key={range} value={range}>
                {range}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <Autocomplete
            multiple
            options={FORMLY_INFO.integrations}
            getOptionLabel={(option) => option.name}
            value={data.integrationsNeeded}
            onChange={handleIntegrationsChange}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Integrations Needed"
                helperText="Select the tools you'd like to integrate with"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  sx={{ m: 0.5 }}
                />
              ))
            }
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.category}
                  </Typography>
                </Box>
              </Box>
            )}
            groupBy={(option) => option.category}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          We'll use this information to customize your dashboard and suggest relevant templates.
        </Typography>
      </Box>
    </Box>
  );
};

export default UseCase; 