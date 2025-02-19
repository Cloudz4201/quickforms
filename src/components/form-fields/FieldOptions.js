import React from 'react';
import {
  Box,
  FormControlLabel,
  Switch,
  TextField,
  IconButton,
  List,
  ListItem,
  Button,
  Typography,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const FieldOptions = ({ field, onChange }) => {
  const handleRequiredChange = (event) => {
    onChange({ ...field, required: event.target.checked });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...field.options];
    newOptions[index] = value;
    onChange({ ...field, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
    onChange({ ...field, options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = field.options.filter((_, i) => i !== index);
    onChange({ ...field, options: newOptions });
  };

  const renderOptions = () => {
    if (!['checkbox', 'radio'].includes(field.type)) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Options
        </Typography>
        <List dense>
          {field.options?.map((option, index) => (
            <ListItem
              key={index}
              sx={{ px: 0 }}
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => removeOption(index)}
                  disabled={field.options.length <= 1}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <TextField
                size="small"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                sx={{ flex: 1 }}
              />
            </ListItem>
          ))}
        </List>
        <Button
          startIcon={<AddIcon />}
          onClick={addOption}
          size="small"
          sx={{ mt: 1 }}
        >
          Add Option
        </Button>
      </Box>
    );
  };

  const renderValidation = () => {
    switch (field.type) {
      case 'email':
        return (
          <TextField
            size="small"
            fullWidth
            label="Error Message"
            value={field.errorMessage || 'Please enter a valid email address'}
            onChange={(e) => onChange({ ...field, errorMessage: e.target.value })}
            sx={{ mt: 2 }}
          />
        );
      case 'phone':
        return (
          <TextField
            size="small"
            fullWidth
            label="Error Message"
            value={field.errorMessage || 'Please enter a valid phone number'}
            onChange={(e) => onChange({ ...field, errorMessage: e.target.value })}
            sx={{ mt: 2 }}
          />
        );
      case 'file':
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              size="small"
              fullWidth
              label="Allowed File Types"
              value={field.allowedTypes || '.pdf,.doc,.docx'}
              onChange={(e) => onChange({ ...field, allowedTypes: e.target.value })}
              helperText="Comma-separated file extensions (e.g., .pdf,.doc)"
              sx={{ mb: 2 }}
            />
            <TextField
              size="small"
              fullWidth
              type="number"
              label="Max File Size (MB)"
              value={field.maxSize || 5}
              onChange={(e) => onChange({ ...field, maxSize: Number(e.target.value) })}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Divider />
      <Box sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={field.required}
              onChange={handleRequiredChange}
              size="small"
            />
          }
          label="Required"
        />
      </Box>
      {renderOptions()}
      {renderValidation()}
    </Box>
  );
};

export default FieldOptions; 