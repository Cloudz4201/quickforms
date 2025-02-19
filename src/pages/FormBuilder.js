import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  TextFields as TextFieldsIcon,
  CheckBox as CheckBoxIcon,
  RadioButtonChecked as RadioButtonIcon,
  DateRange as DateRangeIcon,
  AttachFile as AttachFileIcon,
  ShortText as ShortTextIcon,
  Subject as SubjectIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Add as AddIcon,
  Close as CloseIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import FormPreview from '../components/form-fields/FormPreview';
import FormTemplates from '../components/form-templates/FormTemplates';
import FormBuilderEditor from '../components/form-builder/FormBuilderEditor';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const fieldTypes = [
  { id: 'short_text', icon: <ShortTextIcon />, label: 'Short Text' },
  { id: 'long_text', icon: <SubjectIcon />, label: 'Long Text' },
  { id: 'email', icon: <EmailIcon />, label: 'Email' },
  { id: 'phone', icon: <PhoneIcon />, label: 'Phone' },
  { id: 'checkbox', icon: <CheckBoxIcon />, label: 'Checkbox' },
  { id: 'radio', icon: <RadioButtonIcon />, label: 'Radio' },
  { id: 'date', icon: <DateRangeIcon />, label: 'Date' },
  { id: 'file', icon: <AttachFileIcon />, label: 'File Upload' },
];

const FormBuilder = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formTitle, setFormTitle] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [formId, setFormId] = useState(null);
  const [showShareDialogOpen, setShowShareDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      if (!user?.uid) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get form ID from URL parameters
        const params = new URLSearchParams(location.search);
        const urlFormId = params.get('id') || params.get('formId');
        const templateId = params.get('template');

        console.log('Loading form with ID:', urlFormId);
        console.log('Template ID:', templateId);

        if (urlFormId) {
          // Load existing form
          const formRef = doc(db, 'users', user.uid, 'forms', urlFormId);
          const formDoc = await getDoc(formRef);

          console.log('Form doc exists:', formDoc.exists());

          if (formDoc.exists()) {
            const formData = formDoc.data();
            console.log('Form data loaded:', formData);

            setFormTitle(formData.title || '');
            setFormFields(formData.fields || []);
            setIsPublished(formData.published || false);
            setFormId(urlFormId);
          } else {
            console.error('Form not found');
            setError('Form not found. Please check the URL and try again.');
          }
        } else if (templateId) {
          // Load template
          const templateRef = doc(db, 'templates', templateId);
          const templateDoc = await getDoc(templateRef);

          if (templateDoc.exists()) {
            const templateData = templateDoc.data();
            console.log('Template data loaded:', templateData);

            setFormTitle(templateData.title || '');
            setFormFields(templateData.fields || []);
            setIsPublished(false);
            setFormId(null);
          } else {
            console.error('Template not found');
            setError('Template not found. Please try another template.');
          }
        } else {
          // New form
          console.log('Creating new form');
          setFormTitle('');
          setFormFields([]);
          setIsPublished(false);
          setFormId(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading form:', err);
        setError('Failed to load form. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [location.search, user?.uid, navigate]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormFields(items);
  };

  const addField = (type) => {
    const newField = {
      id: `field_${Date.now()}`, // Ensure unique ID format
      type: type.id,
      label: `${type.label} Question`,
      required: false,
      options: type.id === 'checkbox' || type.id === 'radio' ? ['Option 1'] : undefined,
    };
    setFormFields([...formFields, newField]);
  };

  const updateField = (id, updates) => {
    setFormFields(formFields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id) => {
    setFormFields(formFields.filter(field => field.id !== id));
  };

  const handleSave = async (publish = false) => {
    if (!user?.uid) {
      setError('Please log in to save your form');
      return;
    }

    if (!formTitle.trim()) {
      setError('Please enter a form title');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = {
        title: formTitle.trim(),
        fields: formFields,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
        published: publish,
      };

      let savedFormId;
      if (formId) {
        // Update existing form
        console.log('Updating existing form:', formId);
        const formRef = doc(db, 'users', user.uid, 'forms', formId);
        await updateDoc(formRef, formData);
        savedFormId = formId;
      } else {
        // Create new form
        console.log('Creating new form');
        formData.createdAt = new Date().toISOString();
        formData.responses = 0;
        const formRef = doc(collection(db, 'users', user.uid, 'forms'));
        await setDoc(formRef, formData);
        savedFormId = formRef.id;
      }

      console.log('Form saved successfully:', savedFormId);
      setIsPublished(publish);
      setFormId(savedFormId);

      // Show success message
      setError(null);
      
      if (!formId) {
        // If this is a new form, navigate to the edit URL
        navigate(`/builder?id=${savedFormId}`, { replace: true });
      }

      return savedFormId;
    } catch (err) {
      console.error('Error saving form:', err);
      setError('Failed to save form. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    try {
      if (!template) return;
      
      // Update form with template data
      setFormTitle(template.title || '');
      setFormFields(template.fields || []);
      setShowTemplates(false);
      
      // Reset form state
      setFormId(null);
      setIsPublished(false);
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error applying template:', err);
      setError('Failed to apply template');
    }
  };

  const renderFormFields = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="form-fields" isDropDisabled={false}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{ minHeight: 100 }}
          >
            {formFields.map((field, index) => (
              <Draggable
                key={field.id}
                draggableId={field.id}
                index={index}
                isDragDisabled={false}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      marginBottom: '8px',
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: snapshot.isDragging ? 'grey.100' : 'background.paper',
                        '&:hover': {
                          boxShadow: 2,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DragIndicatorIcon sx={{ mr: 1, cursor: 'grab', color: 'action.active' }} />
                        <Box sx={{ flex: 1 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Field Label"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                          />
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => removeField(field.id)}
                          sx={{ ml: 1 }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            />
                          }
                          label="Required"
                        />
                      </Box>
                    </Paper>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Please log in to create or edit forms.
          <Button color="inherit" onClick={() => navigate('/login')} sx={{ ml: 2 }}>
            Log In
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Form Editor */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <TextField
                fullWidth
                label="Form Title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                sx={{ mb: 3 }}
              />
              {renderFormFields()}
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => handleSave(false)}
                  disabled={loading}
                >
                  Save Draft
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSave(true)}
                  disabled={loading || !formTitle.trim() || formFields.length === 0}
                >
                  {isPublished ? 'Update Published Form' : 'Publish Form'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Field Types Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flex: 1 }}>
                  Form Fields
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowTemplates(true)}
                >
                  Templates
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click to add fields to your form
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {fieldTypes.map((type) => (
                  <ListItem
                    key={type.id}
                    onClick={() => addField(type)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>{type.icon}</ListItemIcon>
                    <ListItemText primary={type.label} />
                    <Tooltip title="Add field">
                      <IconButton size="small">
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Preview Dialog */}
      <FormPreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        form={{ title: formTitle, fields: formFields }}
      />

      {/* Share Dialog */}
      <Dialog
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Form</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Your form has been published! Share this link to collect responses:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 2,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {`${window.location.origin}/f/${formId}`}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Choose a Template
            </Typography>
            <IconButton
              edge="end"
              onClick={() => setShowTemplates(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <FormTemplates
            onSelect={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
            userId={user.uid}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FormBuilder; 