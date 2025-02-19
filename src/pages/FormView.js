import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormGroup,
  Alert,
  CircularProgress,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useAuth } from '../contexts/AuthContext';

const FormView = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchForm = async () => {
      try {
        let formDoc;
        
        // First try to get the form from the user's forms collection
        if (user?.uid) {
          formDoc = await getDoc(doc(db, 'users', user.uid, 'forms', formId));
        }
        
        // If not found in user's forms, try the public forms collection
        if (!formDoc?.exists()) {
          formDoc = await getDoc(doc(db, 'forms', formId));
        }
        
        if (formDoc?.exists()) {
          setForm(formDoc.data());
          // Initialize form data with empty values
          const initialData = {};
          formDoc.data().fields.forEach(field => {
            initialData[field.id] = field.type === 'checkbox' ? [] : '';
          });
          setFormData(initialData);
        } else {
          setError('Form not found');
        }
      } catch (err) {
        console.error('Error fetching form:', err);
        setError('Error loading form');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId, user?.uid]);

  const validateForm = () => {
    const errors = {};
    form.fields.forEach(field => {
      if (field.required) {
        const value = formData[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          errors[field.id] = 'This field is required';
        }
      }

      if (field.type === 'email' && formData[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.id])) {
          errors[field.id] = field.errorMessage || 'Please enter a valid email address';
        }
      }

      if (field.type === 'phone' && formData[field.id]) {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(formData[field.id])) {
          errors[field.id] = field.errorMessage || 'Please enter a valid phone number';
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileUpload = async (file, fieldId) => {
    if (!file) return null;

    const timestamp = Date.now();
    const fileName = `${fieldId}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `form-uploads/${formId}/${fileName}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({
            ...prev,
            [fieldId]: progress
          }));
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadURL,
              fileName: fileName,
              contentType: file.type,
              size: file.size
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      setError(null);

      if (!form) {
        throw new Error('Form not found');
      }

      const responseData = {
        formId: formId,
        responses: values,
        submittedAt: new Date().toISOString(),
        submittedBy: user?.uid || null,
      };

      // Update the path to save in the subcollection
      const responseRef = doc(collection(db, 'users', form.userId, 'forms', formId, 'responses'));
      await setDoc(responseRef, responseData);

      // Update the form's response count
      const formRef = doc(db, 'users', form.userId, 'forms', formId);
      await updateDoc(formRef, {
        responses: increment(1),
        lastResponseAt: new Date().toISOString(),
      });

      setSubmitSuccess(true);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    // Clear validation error when field is modified
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const renderField = (field) => {
    const error = validationErrors[field.id];

    switch (field.type) {
      case 'short_text':
        return (
          <TextField
            fullWidth
            label={field.label}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error}
            size="small"
            sx={{ mb: 3 }}
          />
        );
      
      case 'long_text':
        return (
          <TextField
            fullWidth
            label={field.label}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error}
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
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error}
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
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error}
            type="tel"
            size="small"
            sx={{ mb: 3 }}
          />
        );
      
      case 'checkbox':
        return (
          <FormControl 
            required={field.required}
            error={!!error}
            component="fieldset"
            sx={{ mb: 3 }}
          >
            <FormLabel component="legend">{field.label}</FormLabel>
            <FormGroup>
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={formData[field.id]?.includes(option) || false}
                      onChange={(e) => {
                        const currentValues = formData[field.id] || [];
                        const newValues = e.target.checked
                          ? [...currentValues, option]
                          : currentValues.filter(value => value !== option);
                        handleFieldChange(field.id, newValues);
                      }}
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
            {error && (
              <Typography color="error" variant="caption">
                {error}
              </Typography>
            )}
          </FormControl>
        );
      
      case 'radio':
        return (
          <FormControl 
            required={field.required}
            error={!!error}
            component="fieldset"
            sx={{ mb: 3 }}
          >
            <FormLabel component="legend">{field.label}</FormLabel>
            <RadioGroup
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            >
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
            {error && (
              <Typography color="error" variant="caption">
                {error}
              </Typography>
            )}
          </FormControl>
        );
      
      case 'date':
        return (
          <Box sx={{ mb: 3 }}>
            <FormLabel
              required={field.required}
              error={!!error}
              sx={{ display: 'block', mb: 1 }}
            >
              {field.label}
            </FormLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={formData[field.id] ? dayjs(formData[field.id]) : null}
                onChange={(value) => handleFieldChange(field.id, value?.toISOString())}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    required: field.required,
                    error: !!error,
                    helperText: error,
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        );
      
      case 'file':
        const progress = uploadProgress[field.id];
        
        return (
          <Box sx={{ mb: 3 }}>
            <FormLabel
              required={field.required}
              error={!!error}
              sx={{ display: 'block', mb: 1 }}
            >
              {field.label}
            </FormLabel>
            <Button
              variant="outlined"
              component="label"
              size="small"
              color={error ? 'error' : 'primary'}
              disabled={!!progress && progress < 100}
            >
              {formData[field.id] ? 'Change File' : 'Choose File'}
              <input
                type="file"
                hidden
                accept={field.allowedTypes}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (field.maxSize && file.size > field.maxSize * 1024 * 1024) {
                      setValidationErrors(prev => ({
                        ...prev,
                        [field.id]: `File size must be less than ${field.maxSize}MB`
                      }));
                      return;
                    }
                    handleFieldChange(field.id, file);
                  }
                }}
              />
            </Button>
            {formData[field.id] && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Selected file: {formData[field.id].name}
              </Typography>
            )}
            {progress > 0 && progress < 100 && (
              <Box sx={{ width: '100%', mt: 1 }}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="caption" color="text.secondary">
                  Uploading: {Math.round(progress)}%
                </Typography>
              </Box>
            )}
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Allowed types: {field.allowedTypes || '.pdf,.doc,.docx'}
              {field.maxSize && ` (Max size: ${field.maxSize}MB)`}
            </Typography>
            {error && (
              <Typography color="error" variant="caption" display="block">
                {error}
              </Typography>
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!form) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Form not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {form.title}
        </Typography>

        {form.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {form.description}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          {form.fields.map((field) => (
            <Box key={field.id}>
              {renderField(field)}
            </Box>
          ))}

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={submitting}
              sx={{ minWidth: 120 }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={submitSuccess}
        autoHideDuration={3000}
        onClose={() => setSubmitSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Form submitted successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FormView; 