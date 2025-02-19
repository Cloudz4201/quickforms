import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormGroup,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const FormPreview = ({ title, fields, onSubmit }) => {
  const renderField = (field) => {
    switch (field.type) {
      case 'short_text':
        return (
          <TextField
            fullWidth
            label={field.label}
            required={field.required}
            disabled
            size="small"
            sx={{ mb: 3 }}
          />
        );
      
      case 'long_text':
        return (
          <TextField
            fullWidth
            label={field.label}
            required={field.required}
            multiline
            rows={4}
            disabled
            size="small"
            sx={{ mb: 3 }}
          />
        );
      
      case 'email':
        return (
          <TextField
            fullWidth
            label={field.label}
            required={field.required}
            type="email"
            disabled
            size="small"
            sx={{ mb: 3 }}
          />
        );
      
      case 'phone':
        return (
          <TextField
            fullWidth
            label={field.label}
            required={field.required}
            type="tel"
            disabled
            size="small"
            sx={{ mb: 3 }}
          />
        );
      
      case 'checkbox':
        return (
          <FormControl 
            required={field.required}
            component="fieldset"
            sx={{ mb: 3 }}
          >
            <FormLabel component="legend">{field.label}</FormLabel>
            <FormGroup>
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={<Checkbox disabled />}
                  label={option}
                />
              ))}
            </FormGroup>
          </FormControl>
        );
      
      case 'radio':
        return (
          <FormControl 
            required={field.required}
            component="fieldset"
            sx={{ mb: 3 }}
          >
            <FormLabel component="legend">{field.label}</FormLabel>
            <RadioGroup>
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio disabled />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      
      case 'date':
        return (
          <Box sx={{ mb: 3 }}>
            <FormLabel
              required={field.required}
              sx={{ display: 'block', mb: 1 }}
            >
              {field.label}
            </FormLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                disabled
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    required: field.required,
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      {fields.map((field) => (
        <Box key={field.id}>
          {renderField(field)}
        </Box>
      ))}
    </Box>
  );
};

export default FormPreview; 