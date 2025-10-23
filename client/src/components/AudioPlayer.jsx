import { useState, useRef, useEffect } from 'react';
import { PlayArrow, Pause, VolumeUp, GraphicEq } from '@mui/icons-material';
import { Box, IconButton, LinearProgress, Typography, Alert, CircularProgress, Paper, Chip } from '@mui/material';

const AudioPlayer = ({ audioUrl, autoPlay = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      console.log('🎵 Loading audio...');
      setIsLoading(true);
      setError(null);
      audioRef.current.load();

      audioRef.current.addEventListener('canplay', () => {
        console.log('✅ Audio ready to play');
        setIsLoading(false);

        if (autoPlay) {
          audioRef.current.play()
            .then(() => {
              console.log('✅ Audio playing');
              setIsPlaying(true);
            })
            .catch(error => {
              console.error('❌ Auto-play error:', error);
              setError('Click play to start audio');
            });
        }
      }, { once: true });
    }
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(error => {
            console.error('Play error:', error);
            setError('Failed to play audio: ' + error.message);
          });
      }
    }
  };

  const handleError = (e) => {
    console.error('❌ Audio error:', e.target.error);
    setError(`Audio error: ${e.target.error?.message || 'Unknown error'}`);
    setIsLoading(false);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      console.log('📊 Audio duration:', audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioUrl) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        bgcolor: '#0a0a0a',
        border: '1px solid #1f1f1f',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <VolumeUp sx={{ color: '#71717a', fontSize: 20 }} />
        <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 600 }}>
          AI Response Audio
        </Typography>
        {isPlaying && (
          <Chip
            icon={<GraphicEq sx={{ fontSize: 14 }} />}
            label="Playing"
            size="small"
            sx={{
              ml: 'auto',
              height: 24,
              bgcolor: '#18181b',
              color: '#22c55e',
              border: '1px solid #27272a',
              fontSize: '0.75rem',
            }}
          />
        )}
      </Box>

      {error && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 2, 
            bgcolor: '#18181b',
            color: '#fbbf24',
            border: '1px solid #27272a',
            '& .MuiAlert-icon': {
              color: '#fbbf24',
            },
          }} 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={handleError}
          preload="auto"
        />

        {/* Play/Pause Button */}
        <IconButton
          onClick={togglePlayPause}
          disabled={isLoading}
          sx={{
            width: 48,
            height: 48,
            bgcolor: '#18181b',
            border: '1px solid #27272a',
            color: '#ffffff',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: '#27272a',
              transform: 'scale(1.05)',
            },
            '&:disabled': {
              bgcolor: '#18181b',
              color: '#52525b',
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} sx={{ color: '#71717a' }} />
          ) : isPlaying ? (
            <Pause sx={{ fontSize: 24 }} />
          ) : (
            <PlayArrow sx={{ fontSize: 24 }} />
          )}
        </IconButton>

        {/* Progress and Time */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ position: 'relative', mb: 1 }}>
            <LinearProgress
              variant={isLoading ? 'indeterminate' : 'determinate'}
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: '#18181b',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                },
              }}
            />
            {/* Progress Dot */}
            {!isLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: `${progress}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: '#ffffff',
                  border: '2px solid #0a0a0a',
                  transition: 'left 0.1s linear',
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 600, fontSize: '0.7rem' }}>
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 600, fontSize: '0.7rem' }}>
              {formatTime(duration)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default AudioPlayer;
