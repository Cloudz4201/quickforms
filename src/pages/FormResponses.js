import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  GetApp as DownloadIcon,
  FilterList as FilterIcon,
  Analytics as AnalyticsIcon,
  Search as SearchIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const FormResponses = () => {
  // Navigation and Auth
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core Data States
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [responses, setResponses] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  // Dialog States
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Filter States
  const [filterOptions, setFilterOptions] = useState({
    dateRange: 'all',
    searchTerm: '',
  });

  // Toast Notification State
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'info' | 'warning'
  });

  // Load forms on component mount
  useEffect(() => {
    if (user?.uid) {
      fetchForms();
    }
  }, [user?.uid]);

  // Fetch forms from Firestore
  const fetchForms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const formsRef = collection(db, 'users', user.uid, 'forms');
      const formsQuery = query(formsRef, orderBy('createdAt', 'desc'));
      const formsSnapshot = await getDocs(formsQuery);
      
      const formsData = formsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setForms(formsData);
      
      if (formsData.length > 0) {
        setSelectedForm(formsData[0]);
        await fetchResponses(formsData[0].id);
      }
    } catch (err) {
      console.error('Error fetching forms:', err);
      setError('Failed to load forms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch responses for a specific form
  const fetchResponses = async (formId) => {
    try {
      if (!user?.uid || !formId) return;
      
      setLoading(true);
      setError(null);
      
      const responsesRef = collection(db, 'users', user.uid, 'forms', formId, 'responses');
      const responsesQuery = query(responsesRef, orderBy('submittedAt', 'desc'));
      const responsesSnapshot = await getDocs(responsesQuery);
      
      const responsesData = responsesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setResponses(responsesData);
      generateAnalytics(responsesData);
      showToast(`Loaded ${responsesData.length} responses`);
    } catch (err) {
      console.error('Error fetching responses:', err);
      setError('Failed to load responses. Please try again.');
      showToast('Failed to load responses. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Generate analytics from response data
  const generateAnalytics = (responsesData) => {
    const analytics = {
      totalResponses: responsesData.length,
      responsesByDate: {},
      fieldAnalytics: {},
    };

    responsesData.forEach(response => {
      // Aggregate by date
      const date = dayjs(response.submittedAt).format('YYYY-MM-DD');
      analytics.responsesByDate[date] = (analytics.responsesByDate[date] || 0) + 1;

      // Analyze field responses
      Object.entries(response.responses).forEach(([fieldId, value]) => {
        if (!analytics.fieldAnalytics[fieldId]) {
          analytics.fieldAnalytics[fieldId] = { responses: 0, values: {} };
        }

        analytics.fieldAnalytics[fieldId].responses++;

        if (Array.isArray(value)) {
          value.forEach(v => {
            analytics.fieldAnalytics[fieldId].values[v] = 
              (analytics.fieldAnalytics[fieldId].values[v] || 0) + 1;
          });
        } else if (typeof value === 'string') {
          analytics.fieldAnalytics[fieldId].values[value] = 
            (analytics.fieldAnalytics[fieldId].values[value] || 0) + 1;
        }
      });
    });

    setAnalytics(analytics);
  };

  // Filter responses based on search and date range
  const getFilteredResponses = () => {
    let filtered = [...responses];

    if (filterOptions.searchTerm) {
      const searchTerm = filterOptions.searchTerm.toLowerCase();
      filtered = filtered.filter(response => 
        Object.values(response.responses).some(value => 
          String(value).toLowerCase().includes(searchTerm)
        )
      );
    }

    if (filterOptions.dateRange !== 'all') {
      const now = dayjs();
      const cutoff = now.subtract(
        filterOptions.dateRange === 'week' ? 7 : 
        filterOptions.dateRange === 'month' ? 30 : 90,
        'day'
      );
      filtered = filtered.filter(response => 
        dayjs(response.submittedAt).isAfter(cutoff)
      );
    }

    return filtered;
  };

  // Toast Helper Functions
  const showToast = (message, severity = 'success') => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast(prev => ({ ...prev, open: false }));
  };

  // Event Handlers
  const handleFormChange = (event) => {
    const form = forms.find(f => f.id === event.target.value);
    setSelectedForm(form);
    fetchResponses(form.id);
    setPage(0);
    showToast(`Switched to form: ${form.title}`);
  };

  const handleViewResponse = (response) => {
    setSelectedResponse(response);
    setShowResponseDialog(true);
  };

  const handleShareForm = () => {
    setShowShareDialog(true);
    showToast('Share dialog opened. Copy the link to share your form!', 'info');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDownloadFile = async (fileData) => {
    try {
      const response = await fetch(fileData.url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileData.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`File "${fileData.fileName}" downloaded successfully`);
    } catch (error) {
      console.error('Error downloading file:', error);
      showToast('Failed to download file. Please try again.', 'error');
    }
  };

  const handleFilterChange = (type, value) => {
    setFilterOptions(prev => ({
      ...prev,
      [type]: value,
    }));
    showToast('Filters updated', 'info');
  };

  // Render empty state message
  const renderEmptyState = () => (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          No Responses Yet
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {selectedForm 
            ? "This form hasn't received any responses yet. Share your form to start collecting responses!"
            : "You haven't created any forms yet. Create your first form to get started!"}
        </Typography>
        <Button
          variant="contained"
          startIcon={selectedForm ? <ShareIcon /> : null}
          onClick={() => selectedForm ? handleShareForm() : navigate('/builder')}
        >
          {selectedForm ? 'Share Form' : 'Create Form'}
        </Button>
      </Paper>
    </Box>
  );

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const filteredResponses = getFilteredResponses();

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ flex: 1 }}>
              Form Responses
            </Typography>
            {selectedForm && responses.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<AnalyticsIcon />}
                onClick={() => setShowAnalytics(!showAnalytics)}
                sx={{ mr: 2 }}
              >
                Analytics
              </Button>
            )}
          </Box>
        </Grid>

        {/* Form Selection and Filters */}
        {forms.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Select Form"
                    value={selectedForm?.id || ''}
                    onChange={handleFormChange}
                  >
                    {forms.map((form) => (
                      <MenuItem key={form.id} value={form.id}>
                        {form.title}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                {responses.length > 0 && (
                  <>
                    <Grid item xs={12} md={3}>
                      <TextField
                        select
                        fullWidth
                        label="Date Range"
                        value={filterOptions.dateRange}
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      >
                        <MenuItem value="all">All Time</MenuItem>
                        <MenuItem value="week">Last 7 Days</MenuItem>
                        <MenuItem value="month">Last 30 Days</MenuItem>
                        <MenuItem value="quarter">Last 90 Days</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <TextField
                        fullWidth
                        label="Search Responses"
                        value={filterOptions.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        InputProps={{
                          startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                        }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Analytics Section */}
        {showAnalytics && analytics && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Analytics Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" component="div">
                        {analytics.totalResponses}
                      </Typography>
                      <Typography color="text.secondary">
                        Total Responses
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                {selectedForm?.fields.map(field => {
                  const fieldStats = analytics.fieldAnalytics[field.id];
                  if (!fieldStats) return null;

                  return (
                    <Grid item xs={12} md={4} key={field.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {field.label}
                          </Typography>
                          {Object.entries(fieldStats.values)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 3)
                            .map(([value, count]) => (
                              <Box key={value} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>
                                  {value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {count} ({Math.round(count/fieldStats.responses*100)}%)
                                </Typography>
                              </Box>
                            ))
                          }
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Responses Table or Empty State */}
        <Grid item xs={12}>
          {!forms.length || !responses.length ? (
            renderEmptyState()
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Submission Date</TableCell>
                    {selectedForm?.fields.map(field => (
                      <TableCell key={field.id}>{field.label}</TableCell>
                    ))}
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredResponses
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((response) => (
                      <TableRow key={response.id}>
                        <TableCell>
                          {dayjs(response.submittedAt).format('MMM D, YYYY h:mm A')}
                        </TableCell>
                        {selectedForm?.fields.map(field => (
                          <TableCell key={field.id}>
                            {field.type === 'file' && response.responses[field.id] ? (
                              <Button
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownloadFile(response.responses[field.id])}
                              >
                                Download
                              </Button>
                            ) : Array.isArray(response.responses[field.id]) ? (
                              response.responses[field.id].join(', ')
                            ) : (
                              String(response.responses[field.id] || '')
                            )}
                          </TableCell>
                        ))}
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleViewResponse(response)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredResponses.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          )}
        </Grid>
      </Grid>

      {/* Response Details Dialog */}
      <Dialog
        open={showResponseDialog}
        onClose={() => setShowResponseDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Response Details</DialogTitle>
        <DialogContent dividers>
          {selectedResponse && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Submitted on {dayjs(selectedResponse.submittedAt).format('MMM D, YYYY h:mm A')}
                </Typography>
              </Grid>
              {selectedForm?.fields.map(field => (
                <Grid item xs={12} key={field.id}>
                  <Typography variant="subtitle2" gutterBottom>
                    {field.label}
                  </Typography>
                  {field.type === 'file' && selectedResponse.responses[field.id] ? (
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadFile(selectedResponse.responses[field.id])}
                    >
                      Download {selectedResponse.responses[field.id].fileName}
                    </Button>
                  ) : Array.isArray(selectedResponse.responses[field.id]) ? (
                    selectedResponse.responses[field.id].map((value, index) => (
                      <Chip
                        key={index}
                        label={value}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))
                  ) : (
                    <Typography>
                      {String(selectedResponse.responses[field.id] || '')}
                    </Typography>
                  )}
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResponseDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FormResponses; 