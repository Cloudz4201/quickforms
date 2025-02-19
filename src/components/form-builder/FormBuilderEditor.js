import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
  Preview as PreviewIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FormField from './FormField';
import FormPreview from '../form-preview/FormPreview';

const FIELD_TYPES = [
  { id: 'short_text', label: 'Short Text' },
  { id: 'long_text', label: 'Long Text' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'checkbox', label: 'Checkbox' },
  { id: 'radio', label: 'Radio' },
  { id: 'date', label: 'Date' },
];

const FormBuilderEditor = ({
  formTitle,
  formFields,
  setFormTitle,
  setFormFields,
  onSave,
  saving,
  showTemplateDialog,
  isPublished
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormFields(items);
  };

  const handleAddField = (type) => {
    const newField = {
      id: Date.now().toString(),
      type: type.id,
      label: `New ${type.label}`,
      required: false,
      options: type.id === 'checkbox' || type.id === 'radio' ? ['Option 1'] : undefined,
    };
    setFormFields([...formFields, newField]);
  };

  const handleUpdateField = (index, updates) => {
    const updatedFields = [...formFields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFormFields(updatedFields);
  };

  const handleRemoveField = (index) => {
    const updatedFields = formFields.filter((_, i) => i !== index);
    setFormFields(updatedFields);
  };

  const handleSave = async (publish = false) => {
    if (!formTitle) {
      setError('Please enter a form title');
      return;
    }

    if (formFields.length === 0) {
      setError('Please add at least one field to your form');
      return;
    }

    try {
      await onSave(publish);
      setError(null);
    } catch (err) {
      setError(publish ? 'Failed to publish form' : 'Failed to save form');
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Form Title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            error={!formTitle}
            helperText={!formTitle ? 'Title is required' : ''}
            placeholder="Enter your form title"
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Box sx={{ minHeight: 100 }}>
            <Droppable droppableId="form-fields-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {formFields.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary" gutterBottom>
                        Start building your form by adding fields
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Drag and drop fields to reorder them
                      </Typography>
                    </Box>
                  ) : (
                    formFields.map((field, index) => (
                      <Draggable
                        key={field.id}
                        draggableId={field.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Box sx={{ mb: 2 }}>
                              <FormField
                                field={field}
                                onUpdate={(updates) => handleUpdateField(index, updates)}
                                onRemove={() => handleRemoveField(index)}
                              />
                            </Box>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Box>
        </DragDropContext>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Add Fields
          </Typography>
          <Grid container spacing={1}>
            {FIELD_TYPES.map((type) => (
              <Grid item key={type.id}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleAddField(type)}
                  startIcon={<AddIcon />}
                >
                  {type.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => handleSave(false)}
          disabled={saving}
          startIcon={<SaveIcon />}
        >
          {saving ? <CircularProgress size={24} /> : 'Save Draft'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSave(true)}
          disabled={saving || !formTitle || !formFields.length}
          startIcon={<PublishIcon />}
        >
          {isPublished ? 'Update Published Form' : 'Publish Form'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => setPreviewOpen(true)}
          startIcon={<PreviewIcon />}
        >
          Preview
        </Button>
        <Button
          variant="outlined"
          onClick={showTemplateDialog}
          startIcon={<DashboardIcon />}
        >
          Load Template
        </Button>
      </Box>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Form Preview</DialogTitle>
        <DialogContent>
          <FormPreview
            title={formTitle}
            fields={formFields}
            onSubmit={() => {}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormBuilderEditor; 