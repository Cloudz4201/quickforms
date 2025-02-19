import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import dayjs from 'dayjs';

const COLORS = ['#3f51b5', '#f50057', '#00bcd4', '#4caf50', '#ff9800', '#9c27b0'];

const FormAnalytics = ({ formId, userId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState([]);
  const [dateRange, setDateRange] = useState('week'); // week, month, year
  const [chartType, setChartType] = useState('responses'); // responses, fields, completion
  const [anchorEl, setAnchorEl] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalResponses: 0,
    responsesByDate: {},
    completionRate: 0,
    averageTimeToComplete: 0,
    fieldAnalytics: {},
  });

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setLoading(true);
        setError(null);

        const responsesRef = collection(db, 'users', userId, 'forms', formId, 'responses');
        const responsesQuery = query(
          responsesRef,
          orderBy('submittedAt', 'desc')
        );

        const snapshot = await getDocs(responsesQuery);
        const responsesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setResponses(responsesData);
        generateAnalytics(responsesData);
      } catch (err) {
        console.error('Error fetching responses:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (userId && formId) {
      fetchResponses();
    }
  }, [formId, userId]);

  const generateAnalytics = (responsesData) => {
    const analytics = {
      totalResponses: responsesData.length,
      responsesByDate: {},
      completionRate: 0,
      averageTimeToComplete: 0,
      fieldAnalytics: {},
    };

    // Process responses
    responsesData.forEach(response => {
      // Responses by date
      const date = dayjs(response.submittedAt).format('YYYY-MM-DD');
      analytics.responsesByDate[date] = (analytics.responsesByDate[date] || 0) + 1;

      // Field analytics
      Object.entries(response.responses).forEach(([fieldId, value]) => {
        if (!analytics.fieldAnalytics[fieldId]) {
          analytics.fieldAnalytics[fieldId] = {
            total: 0,
            values: {},
          };
        }

        analytics.fieldAnalytics[fieldId].total++;

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

  const getChartData = () => {
    switch (chartType) {
      case 'responses':
        return Object.entries(analytics.responsesByDate)
          .map(([date, count]) => ({
            date: dayjs(date).format('MMM D'),
            responses: count,
          }))
          .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

      case 'fields':
        return Object.entries(analytics.fieldAnalytics)
          .map(([fieldId, data]) => ({
            field: fieldId,
            responses: data.total,
          }));

      case 'completion':
        return Object.entries(analytics.fieldAnalytics)
          .map(([fieldId, data]) => ({
            name: fieldId,
            value: (data.total / analytics.totalResponses) * 100,
          }));

      default:
        return [];
    }
  };

  const handleExport = () => {
    const csvData = responses.map(response => ({
      id: response.id,
      submittedAt: response.submittedAt,
      ...response.responses,
    }));

    const csv = convertToCSV(csvData);
    downloadCSV(csv, `form-responses-${formId}.csv`);
  };

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => JSON.stringify(row[header])).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
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
      <Paper sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Analytics Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ flex: 1 }}>
          Form Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DateRangeIcon />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            {dateRange === 'week' ? 'Last 7 Days' : 
             dateRange === 'month' ? 'Last 30 Days' : 'Last Year'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Responses
              </Typography>
              <Typography variant="h3" color="primary">
                {analytics.totalResponses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Completion Rate
              </Typography>
              <Typography variant="h3" color="primary">
                {Math.round(analytics.completionRate)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Avg. Time to Complete
              </Typography>
              <Typography variant="h3" color="primary">
                {Math.round(analytics.averageTimeToComplete)}m
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Response Rate
              </Typography>
              <Typography variant="h3" color="primary">
                {responses.length > 0 
                  ? Math.round((responses.length / analytics.totalResponses) * 100)
                  : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Response Trends
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Response Timeline">
              <IconButton
                color={chartType === 'responses' ? 'primary' : 'default'}
                onClick={() => setChartType('responses')}
              >
                <TimelineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Field Completion">
              <IconButton
                color={chartType === 'fields' ? 'primary' : 'default'}
                onClick={() => setChartType('fields')}
              >
                <BarChartIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Completion Rate">
              <IconButton
                color={chartType === 'completion' ? 'primary' : 'default'}
                onClick={() => setChartType('completion')}
              >
                <PieChartIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'responses' ? (
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip />
                <Line type="monotone" dataKey="responses" stroke="#3f51b5" />
              </LineChart>
            ) : chartType === 'fields' ? (
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="field" />
                <YAxis />
                <ChartTooltip />
                <Bar dataKey="responses" fill="#3f51b5" />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={getChartData()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  label
                >
                  {getChartData().map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            )}
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Date Range Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem 
          onClick={() => {
            setDateRange('week');
            setAnchorEl(null);
          }}
        >
          Last 7 Days
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setDateRange('month');
            setAnchorEl(null);
          }}
        >
          Last 30 Days
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setDateRange('year');
            setAnchorEl(null);
          }}
        >
          Last Year
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default FormAnalytics; 