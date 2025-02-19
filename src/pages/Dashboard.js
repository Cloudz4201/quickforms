import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Skeleton,
  Alert,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Category as CategoryIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import WelcomeDialog from '../components/WelcomeDialog';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user?.uid) {
          // Get user's forms
          const userFormsRef = collection(db, 'users', user.uid, 'forms');
          const formsQuery = query(userFormsRef, orderBy('createdAt', 'desc'));
          const formsSnapshot = await getDocs(formsQuery);
          
          const formsData = formsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setUserData(prev => ({
            ...prev,
            forms: formsData,
            formsCount: formsData.length,
            totalResponses: formsData.reduce((total, form) => total + (form.responses || 0), 0)
          }));
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.uid]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={140} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button
            color="inherit"
            onClick={() => window.location.reload()}
            sx={{ ml: 2 }}
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <WelcomeDialog
        open={showWelcome}
        onClose={handleCloseWelcome}
        userName={userData?.name}
      />
      
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {userData.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Let's create some amazing forms today
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<BusinessIcon />}
            label={userData.company || 'Company not set'}
            variant="outlined"
          />
          <Chip
            icon={<CategoryIcon />}
            label={userData.industry || 'Industry not set'}
            variant="outlined"
          />
          <Chip
            icon={<GroupIcon />}
            label={userData.role || 'Role not set'}
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Forms Created
              </Typography>
              <Typography variant="h3" color="primary">
                {userData.formsCount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Responses
              </Typography>
              <Typography variant="h3" color="primary">
                {userData.totalResponses || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Use Case
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {userData.useCase?.primaryUse || 'Not specified'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Team Size
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {userData.team?.size || 'Not specified'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => navigate('/builder')}
              sx={{ height: '100%', py: 2 }}
            >
              Create New Form
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<DescriptionIcon />}
              onClick={() => navigate('/responses')}
              sx={{ height: '100%', py: 2 }}
            >
              View Responses
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Recent Forms */}
      <Box>
        <Typography variant="h5" gutterBottom>
          Recent Forms
        </Typography>
        <Grid container spacing={2}>
          {userData.forms?.length > 0 ? (
            userData.forms.map((form) => (
              <Grid item xs={12} sm={6} md={4} key={form.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                    height: '100%',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => navigate(`/responses/${form.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="h2">
                        {form.title}
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      {form.responses || 0} responses
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Created {new Date(form.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Card sx={{ textAlign: 'center', py: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    No forms yet
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Create your first form to get started
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/builder')}
                    startIcon={<AddIcon />}
                  >
                    Create Form
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard; 