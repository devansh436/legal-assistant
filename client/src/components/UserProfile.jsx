import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Avatar,
  Chip,
  Paper,
  Grid,
} from '@mui/material';
import { Person, Save, AccountCircle, Language, RecordVoiceOver, Gavel, CheckCircle } from '@mui/icons-material';

const UserProfile = ({ user, onUpdatePreferences }) => {
  const [preferences, setPreferences] = useState(user?.preferences || {
    legalJurisdiction: 'Indian',
    conversationStyle: 'formal',
    voiceId: 'aura-asteria-en',
    language: 'en',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value,
    }));
    setSaved(false);
  };

  const handleSave = () => {
    onUpdatePreferences(preferences);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Card
      elevation={0}
      sx={{
        maxWidth: 700,
        mx: 'auto',
        bgcolor: '#0a0a0a',
        border: '1px solid #1f1f1f',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 4,
          borderBottom: '1px solid #1f1f1f',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: '#18181b',
              border: '1px solid #27272a',
            }}
          >
            <AccountCircle sx={{ fontSize: 44, color: '#ffffff' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 700, mb: 0.5 }}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#71717a', mb: 1 }}>
              {user?.email || 'user@example.com'}
            </Typography>
            <Chip
              label="Premium User"
              size="small"
              sx={{
                bgcolor: '#18181b',
                color: '#a1a1aa',
                border: '1px solid #27272a',
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
            Preferences
          </Typography>
          {saved && (
            <Chip
              icon={<CheckCircle sx={{ fontSize: 14 }} />}
              label="Saved!"
              size="small"
              sx={{
                ml: 'auto',
                bgcolor: '#18181b',
                color: '#22c55e',
                border: '1px solid #27272a',
              }}
            />
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Legal Jurisdiction */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Gavel sx={{ color: '#ffffff', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ffffff' }}>
                  Legal Jurisdiction
                </Typography>
              </Box>
              <FormControl fullWidth>
                <Select
                  value={preferences.legalJurisdiction}
                  onChange={(e) => handleChange('legalJurisdiction', e.target.value)}
                  sx={{
                    bgcolor: '#0a0a0a',
                    color: '#ffffff',
                    borderRadius: 1.5,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#27272a',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3f3f46',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#52525b',
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#71717a',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: '#18181b',
                        border: '1px solid #27272a',
                        '& .MuiMenuItem-root': {
                          color: '#ffffff',
                          '&:hover': {
                            bgcolor: '#27272a',
                          },
                          '&.Mui-selected': {
                            bgcolor: '#27272a',
                            '&:hover': {
                              bgcolor: '#3f3f46',
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="Indian">🇮🇳 Indian Law</MenuItem>
                  <MenuItem value="US">🇺🇸 US Law</MenuItem>
                  <MenuItem value="UK">🇬🇧 UK Law</MenuItem>
                  <MenuItem value="General">🌐 General</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Grid>

          {/* Conversation Style */}
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Person sx={{ color: '#ffffff', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ffffff' }}>
                  Tone
                </Typography>
              </Box>
              <FormControl fullWidth>
                <Select
                  value={preferences.conversationStyle}
                  onChange={(e) => handleChange('conversationStyle', e.target.value)}
                  sx={{
                    bgcolor: '#0a0a0a',
                    color: '#ffffff',
                    borderRadius: 1.5,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#27272a',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3f3f46',
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#71717a',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: '#18181b',
                        border: '1px solid #27272a',
                        '& .MuiMenuItem-root': {
                          color: '#ffffff',
                          '&:hover': {
                            bgcolor: '#27272a',
                          },
                          '&.Mui-selected': {
                            bgcolor: '#27272a',
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="formal">Formal</MenuItem>
                  <MenuItem value="casual">Casual</MenuItem>
                  <MenuItem value="technical">Technical</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Grid>

          {/* Language */}
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Language sx={{ color: '#ffffff', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ffffff' }}>
                  Language
                </Typography>
              </Box>
              <FormControl fullWidth>
                <Select
                  value={preferences.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  sx={{
                    bgcolor: '#0a0a0a',
                    color: '#ffffff',
                    borderRadius: 1.5,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#27272a',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3f3f46',
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#71717a',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: '#18181b',
                        border: '1px solid #27272a',
                        '& .MuiMenuItem-root': {
                          color: '#ffffff',
                          '&:hover': {
                            bgcolor: '#27272a',
                          },
                          '&.Mui-selected': {
                            bgcolor: '#27272a',
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">हिन्दी (Hindi)</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Grid>

          {/* Voice Selection */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <RecordVoiceOver sx={{ color: '#ffffff', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ffffff' }}>
                  AI Voice
                </Typography>
              </Box>
              <FormControl fullWidth>
                <Select
                  value={preferences.voiceId}
                  onChange={(e) => handleChange('voiceId', e.target.value)}
                  sx={{
                    bgcolor: '#0a0a0a',
                    color: '#ffffff',
                    borderRadius: 1.5,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#27272a',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3f3f46',
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#71717a',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: '#18181b',
                        border: '1px solid #27272a',
                        '& .MuiMenuItem-root': {
                          color: '#ffffff',
                          '&:hover': {
                            bgcolor: '#27272a',
                          },
                          '&.Mui-selected': {
                            bgcolor: '#27272a',
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="aura-asteria-en">👩 Asteria (Female)</MenuItem>
                  <MenuItem value="aura-luna-en">👩 Luna (Female)</MenuItem>
                  <MenuItem value="aura-stella-en">👩 Stella (Female)</MenuItem>
                  <MenuItem value="aura-athena-en">👩 Athena (Female)</MenuItem>
                  <MenuItem value="aura-hera-en">👩 Hera (Female)</MenuItem>
                  <MenuItem value="aura-orion-en">👨 Orion (Male)</MenuItem>
                  <MenuItem value="aura-arcas-en">👨 Arcas (Male)</MenuItem>
                  <MenuItem value="aura-perseus-en">👨 Perseus (Male)</MenuItem>
                  <MenuItem value="aura-angus-en">👨 Angus (Male)</MenuItem>
                  <MenuItem value="aura-orpheus-en">👨 Orpheus (Male)</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<Save />}
          onClick={handleSave}
          sx={{
            mt: 4,
            py: 1.5,
            bgcolor: '#ffffff',
            color: '#0a0a0a',
            borderRadius: 1.5,
            fontSize: '1rem',
            fontWeight: 700,
            textTransform: 'none',
            border: '1px solid #27272a',
            '&:hover': {
              bgcolor: '#f4f4f5',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
