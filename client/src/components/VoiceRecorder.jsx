import { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Paper, Fade, Chip, LinearProgress } from '@mui/material';
import { Mic, Stop, GraphicEq, Psychology, RecordVoiceOver, CheckCircle } from '@mui/icons-material';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

const VoiceRecorder = ({ onSendAudio, isProcessing }) => {
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording } = useAudioRecorder();
  const [duration, setDuration] = useState(0);
  const [processingStage, setProcessingStage] = useState('');

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 100);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isProcessing) {
      setProcessingStage('transcribing');
      const timer1 = setTimeout(() => setProcessingStage('analyzing'), 1500);
      const timer2 = setTimeout(() => setProcessingStage('generating'), 3000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setProcessingStage('');
    }
  }, [isProcessing]);

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else if (audioBlob) {
      onSendAudio(audioBlob);
      clearRecording();
    } else {
      startRecording();
    }
  };

  const formatDuration = (seconds) => {
    const secs = Math.floor(seconds / 10);
    return `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
  };

  const getProcessingText = () => {
    switch (processingStage) {
      case 'transcribing':
        return 'Transcribing...';
      case 'analyzing':
        return 'Analyzing...';
      case 'generating':
        return 'Generating...';
      default:
        return 'Processing...';
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        p: 3,
        bgcolor: '#0a0a0a',
        border: '1px solid #1f1f1f',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* Status */}
      <Box sx={{ textAlign: 'center', minHeight: '80px' }}>
        {isRecording && (
          <Fade in>
            <Box>
              <Chip
                icon={<GraphicEq />}
                label={formatDuration(duration)}
                sx={{
                  bgcolor: '#18181b',
                  color: '#ef4444',
                  border: '1px solid #27272a',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 2,
                }}
              />
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#71717a' }}>
                Recording...
              </Typography>
            </Box>
          </Fade>
        )}

        {isProcessing && (
          <Fade in>
            <Box>
              <Chip
                label={getProcessingText()}
                sx={{
                  bgcolor: '#18181b',
                  color: '#ffffff',
                  border: '1px solid #27272a',
                  fontWeight: 600,
                  py: 2,
                }}
              />
              <LinearProgress
                sx={{
                  mt: 2,
                  height: 2,
                  bgcolor: '#18181b',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#ffffff',
                  },
                }}
              />
            </Box>
          </Fade>
        )}

        {!isRecording && !isProcessing && !audioBlob && (
          <Typography variant="body2" sx={{ color: '#71717a' }}>
            Ready to listen
          </Typography>
        )}

        {audioBlob && !isProcessing && (
          <Chip
            label="Ready to send"
            sx={{
              bgcolor: '#18181b',
              color: '#22c55e',
              border: '1px solid #27272a',
              fontWeight: 600,
            }}
          />
        )}
      </Box>

      {/* Record Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        <IconButton
          onClick={handleRecord}
          disabled={isProcessing}
          sx={{
            width: 100,
            height: 100,
            bgcolor: isRecording ? '#ef4444' : audioBlob ? '#22c55e' : '#18181b',
            border: '1px solid #27272a',
            color: '#ffffff',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: isRecording ? '#dc2626' : audioBlob ? '#16a34a' : '#27272a',
              transform: 'scale(1.05)',
            },
            '&:disabled': {
              bgcolor: '#18181b',
              color: '#52525b',
            },
          }}
        >
          {isRecording ? (
            <Stop sx={{ fontSize: 40 }} />
          ) : audioBlob ? (
            <CheckCircle sx={{ fontSize: 40 }} />
          ) : (
            <Mic sx={{ fontSize: 40 }} />
          )}
        </IconButton>
      </Box>

      {/* Instructions */}
      <Typography
        variant="caption"
        sx={{
          textAlign: 'center',
          color: '#52525b',
          fontSize: '0.85rem',
        }}
      >
        {!isRecording && !audioBlob && 'Click to record'}
        {isRecording && 'Click to stop'}
        {audioBlob && !isProcessing && 'Click to send'}
      </Typography>
    </Paper>
  );
};

export default VoiceRecorder;
