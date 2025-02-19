import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const templates = [
  {
    id: 'contact-form',
    title: 'Contact Form',
    description: 'A simple contact form with name, email, and message fields',
    category: 'Contact',
    image: 'https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?w=600',
    fields: [
      {
        id: 'name',
        type: 'short_text',
        label: 'Full Name',
        required: true,
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
      },
      {
        id: 'phone',
        type: 'phone',
        label: 'Phone Number',
        required: false,
      },
      {
        id: 'message',
        type: 'long_text',
        label: 'Message',
        required: true,
      },
    ],
  },
  {
    id: 'job-application',
    title: 'Job Application',
    description: 'Collect job applications with resume upload',
    category: 'HR',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600',
    fields: [
      {
        id: 'name',
        type: 'short_text',
        label: 'Full Name',
        required: true,
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
      },
      {
        id: 'phone',
        type: 'phone',
        label: 'Phone Number',
        required: true,
      },
      {
        id: 'position',
        type: 'short_text',
        label: 'Position Applied For',
        required: true,
      },
      {
        id: 'experience',
        type: 'long_text',
        label: 'Work Experience',
        required: true,
      },
      {
        id: 'resume',
        type: 'file',
        label: 'Resume',
        required: true,
        allowedTypes: '.pdf,.doc,.docx',
        maxSize: 5,
      },
    ],
  },
  {
    id: 'event-registration',
    title: 'Event Registration',
    description: 'Register attendees for your event',
    category: 'Events',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600',
    fields: [
      {
        id: 'name',
        type: 'short_text',
        label: 'Full Name',
        required: true,
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
      },
      {
        id: 'ticket_type',
        type: 'radio',
        label: 'Ticket Type',
        required: true,
        options: ['Standard', 'VIP', 'Group'],
      },
      {
        id: 'date',
        type: 'date',
        label: 'Preferred Date',
        required: true,
      },
      {
        id: 'dietary',
        type: 'checkbox',
        label: 'Dietary Requirements',
        required: false,
        options: ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher'],
      },
    ],
  },
  {
    id: 'feedback-survey',
    title: 'Feedback Survey',
    description: 'Collect customer feedback and suggestions',
    category: 'Feedback',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600',
    fields: [
      {
        id: 'rating',
        type: 'radio',
        label: 'Overall Satisfaction',
        required: true,
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
      },
      {
        id: 'liked',
        type: 'checkbox',
        label: 'What did you like?',
        required: true,
        options: ['Quality', 'Price', 'Service', 'Speed', 'Support'],
      },
      {
        id: 'improvements',
        type: 'long_text',
        label: 'Suggestions for Improvement',
        required: false,
      },
      {
        id: 'recommend',
        type: 'radio',
        label: 'Would you recommend us?',
        required: true,
        options: ['Yes', 'No', 'Maybe'],
      },
    ],
  },
  {
    id: 'product-order',
    title: 'Product Order Form',
    description: 'Take product orders with customization options',
    category: 'Sales',
    image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=600',
    fields: [
      {
        id: 'name',
        type: 'short_text',
        label: 'Customer Name',
        required: true,
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
      },
      {
        id: 'product',
        type: 'radio',
        label: 'Product Selection',
        required: true,
        options: ['Basic Package', 'Premium Package', 'Enterprise Package'],
      },
      {
        id: 'quantity',
        type: 'short_text',
        label: 'Quantity',
        required: true,
      },
      {
        id: 'customization',
        type: 'long_text',
        label: 'Customization Requirements',
        required: false,
      },
    ],
  },
  {
    id: 'appointment-booking',
    title: 'Appointment Booking',
    description: 'Schedule appointments and consultations',
    category: 'Scheduling',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600',
    fields: [
      {
        id: 'name',
        type: 'short_text',
        label: 'Full Name',
        required: true,
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
      },
      {
        id: 'phone',
        type: 'phone',
        label: 'Phone Number',
        required: true,
      },
      {
        id: 'service',
        type: 'radio',
        label: 'Service Type',
        required: true,
        options: ['Consultation', 'Follow-up', 'General Appointment'],
      },
      {
        id: 'preferred_date',
        type: 'date',
        label: 'Preferred Date',
        required: true,
      },
      {
        id: 'notes',
        type: 'long_text',
        label: 'Additional Notes',
        required: false,
      },
    ],
  },
  {
    id: 'newsletter-signup',
    title: 'Newsletter Signup',
    description: 'Collect newsletter subscriptions with preferences',
    category: 'Marketing',
    image: 'https://images.unsplash.com/photo-1557568192-2fafc8b5bdc9?w=600',
    fields: [
      {
        id: 'name',
        type: 'short_text',
        label: 'Name',
        required: true,
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
      },
      {
        id: 'interests',
        type: 'checkbox',
        label: 'Topics of Interest',
        required: true,
        options: ['Technology', 'Business', 'Design', 'Marketing', 'Development'],
      },
      {
        id: 'frequency',
        type: 'radio',
        label: 'Email Frequency',
        required: true,
        options: ['Daily', 'Weekly', 'Monthly'],
      },
    ],
  },
  {
    id: 'bug-report',
    title: 'Bug Report Form',
    description: 'Collect detailed bug reports from users',
    category: 'Support',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600',
    fields: [
      {
        id: 'email',
        type: 'email',
        label: 'Your Email',
        required: true,
      },
      {
        id: 'issue_type',
        type: 'radio',
        label: 'Issue Type',
        required: true,
        options: ['Bug', 'Feature Request', 'Performance Issue', 'Other'],
      },
      {
        id: 'description',
        type: 'long_text',
        label: 'Issue Description',
        required: true,
      },
      {
        id: 'steps',
        type: 'long_text',
        label: 'Steps to Reproduce',
        required: true,
      },
      {
        id: 'screenshot',
        type: 'file',
        label: 'Screenshot',
        required: false,
        allowedTypes: '.png,.jpg,.jpeg,.gif',
        maxSize: 5,
      },
    ],
  },
];

const categories = ['All', 'Contact', 'HR', 'Events', 'Feedback', 'Sales', 'Scheduling', 'Marketing', 'Support'];

const FormTemplates = ({ onSelect, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      const formId = `form_${Date.now()}`;
      const formData = {
        title: selectedTemplate.title,
        fields: selectedTemplate.fields,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: 0,
        template: selectedTemplate.id,
        isPublic: false
      };

      // Create the form under the user's forms collection
      const userFormRef = doc(db, 'users', user.uid, 'forms', formId);
      await setDoc(userFormRef, formData);

      // Update user's forms count in profile
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'profile.formsCount': increment(1)
      });
      
      // Close the template selection dialog
      if (onClose) {
        onClose();
      }

      // Navigate to the form builder
      navigate(`/builder?formId=${formId}`, { replace: true });
    } catch (error) {
      console.error('Error creating form from template:', error);
      alert('Failed to create form from template. Please try again.');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => setSelectedCategory(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card
              sx={{
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardMedia
                component="img"
                height="140"
                image={template.image}
                alt={template.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {template.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {template.description}
                </Typography>
                <Chip
                  label={template.category}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Use Template: {selectedTemplate?.title}
            </Typography>
            <IconButton
              edge="end"
              onClick={() => setSelectedTemplate(null)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTemplate && (
            <Box>
              <Typography variant="body1" paragraph>
                {selectedTemplate.description}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Fields included:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {selectedTemplate.fields.map((field) => (
                  <Chip
                    key={field.id}
                    label={field.label}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTemplate(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUseTemplate}
            startIcon={<AddIcon />}
          >
            Use Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormTemplates; 