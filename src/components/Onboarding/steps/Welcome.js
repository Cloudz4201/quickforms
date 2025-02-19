import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Icon,
} from '@mui/material';
import { FORMLY_INFO } from '../../../constants/formly';

const Welcome = () => {
  const highlightedFeatures = FORMLY_INFO.features.slice(0, 6);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Welcome to {FORMLY_INFO.name}!
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 6 }}>
        {FORMLY_INFO.tagline}
      </Typography>

      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        {FORMLY_INFO.description}
      </Typography>

      <Grid container spacing={3}>
        {highlightedFeatures.map((feature) => (
          <Grid item xs={12} sm={6} md={4} key={feature.id}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Icon
                    sx={{
                      color: 'primary.main',
                      mr: 1,
                      fontSize: 24,
                    }}
                  >
                    {feature.icon}
                  </Icon>
                  <Typography variant="h6" component="h3">
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Let's set up your account and get you started with creating amazing forms!
        </Typography>
      </Box>
    </Box>
  );
};

export default Welcome; 