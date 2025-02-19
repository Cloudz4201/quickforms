import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import dayjs from 'dayjs';
import FormAnalytics from '../components/analytics/FormAnalytics';

const FormDetails = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchForm = async () => {
      try {
        if (!user?.uid || !formId) return;

        const formRef = doc(db, 'users', user.uid, 'forms', formId);
        const formDoc = await getDoc(formRef);

        if (formDoc.exists()) {
          setForm({ id: formDoc.id, ...formDoc.data() });
        } else {
          setError('Form not found');
        }
      } catch (err) {
        console.error('Error fetching form:', err);
        setError('Failed to load form details');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [user?.uid, formId]);

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/f/${formId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setSnackbar({
        open: true,
        message: 'Form link copied to clipboard!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
      setSnackbar({
        open: true,
        message: 'Failed to copy link',
        severity: 'error',
      });
    }
  };

  const handleVisibilityToggle = async () => {
    try {
      const formRef = doc(db, 'users', user.uid, 'forms', formId);
      await updateDoc(formRef, {
        isPublic: !form.isPublic,
      });
      setForm(prev => ({ ...prev, isPublic: !prev.isPublic }));
      setSnackbar({
        open: true,
        message: `Form is now ${!form.isPublic ? 'public' : 'private'}`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Error updating form visibility:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update form visibility',
        severity: 'error',
      });
    }
  };

  const handleDeleteForm = async () => {
    try {
      const formRef = doc(db, 'users', user.uid, 'forms', formId);
      await deleteDoc(formRef);
      setSnackbar({
        open: true,
        message: 'Form deleted successfully',
        severity: 'success',
      });
      navigate('/');
    } catch (err) {
      console.error('Error deleting form:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete form',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!form) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Form not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ flex: 1 }}>
          {form.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={() => setShowShareDialog(true)}
          >
            Share
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/builder?formId=${formId}`)}
          >
            Edit Form
          </Button>
        </Box>
      </Box>

      {/* Form Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Responses
              </Typography>
              <Typography variant="h3" color="primary">
                {form.responses || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Created On
              </Typography>
              <Typography variant="body1">
                {dayjs(form.createdAt).format('MMM D, YYYY')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Last Response
              </Typography>
              <Typography variant="body1">
                {form.lastResponseAt
                  ? dayjs(form.lastResponseAt).format('MMM D, YYYY')
                  : 'No responses yet'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analytics Section */}
      <Box sx={{ mt: 4 }}>
        <FormAnalytics formId={formId} userId={user.uid} />
      </Box>

      {/* Form Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Form Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isPublic}
                  onChange={handleVisibilityToggle}
                />
              }
              label={`Form is ${form.isPublic ? 'public' : 'private'}`}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Form
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

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
            Share this link with others to collect responses:
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
            <Tooltip title={copySuccess ? 'Copied!' : 'Copy link'}>
              <IconButton onClick={handleCopyLink} size="small">
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowShareDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Form</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this form? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteForm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FormDetails; 