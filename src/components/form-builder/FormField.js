import React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  FormControlLabel,
  Switch,
  Typography,
  Button,
} from '@mui/material';
import {
  DragIndicator as DragIndicatorIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const FormField = ({ field, onUpdate, onRemove }) => {
  const handleOptionAdd = () => {
    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
    onUpdate({ options: newOptions });
  };

  const handleOptionUpdate = (index, value) => {
    const newOptions = [...field.options];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const handleOptionRemove = (index) => {
    const newOptions = field.options.filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton sx={{ cursor: 'grab', mr: 1 }}>
            <DragIndicatorIcon />
          </IconButton>
          <TextField
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Field Label"
            size="small"
            fullWidth
            sx={{ mr: 1 }}
          />
          <IconButton onClick={onRemove} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>

        <Box sx={{ pl: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={field.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                size="small"
              />
            }
            label="Required"
          />

          {(field.type === 'checkbox' || field.type === 'radio') && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Options
              </Typography>
              {field.options?.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    value={option}
                    onChange={(e) => handleOptionUpdate(index, e.target.value)}
                    size="small"
                    fullWidth
                    sx={{ mr: 1 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleOptionRemove(index)}
                    disabled={field.options.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleOptionAdd}
                size="small"
                sx={{ mt: 1 }}
              >
                Add Option
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FormField; 