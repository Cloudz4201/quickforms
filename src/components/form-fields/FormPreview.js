import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormGroup,
  Typography,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const FormPreview = ({ open, onClose, form }) => {
  const renderField = (field) => {
    switch (field.type) {
      case 'short_text':
        return (
          <TextField
            fullWidth
            label={field.label}
            required={field.required}
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
                  control={<Checkbox />}
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
                  control={<Radio />}
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
                label={field.label}
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
      
      case 'file':
        return (
          <Box sx={{ mb: 3 }}>
            <FormLabel
              required={field.required}
              sx={{ display: 'block', mb: 1 }}
            >
              {field.label}
            </FormLabel>
            <Button
              variant="outlined"
              component="label"
              size="small"
            >
              Choose File
              <input
                type="file"
                hidden
                accept={field.allowedTypes}
              />
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Allowed types: {field.allowedTypes || '.pdf,.doc,.docx'}
              {field.maxSize && ` (Max size: ${field.maxSize}MB)`}
            </Typography>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        {form.title || 'Untitled Form'}
      </DialogTitle>
      <DialogContent dividers>
        {form.fields?.map((field) => (
          <Box key={field.id}>
            {renderField(field)}
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button variant="contained" color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormPreview; 