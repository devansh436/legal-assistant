import { useEffect, useRef } from 'react';
import { Box, Paper, Typography, Avatar, Chip, Fade, Zoom } from '@mui/material';
import { Person, SmartToy, Verified, HistoryEdu } from '@mui/icons-material';

const ChatDisplay = ({ messages }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        overflowY: 'auto',
        p: 3,
        bgcolor: '#0a0a0a',
        border: '1px solid #1f1f1f',
        borderRadius: 2,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#0a0a0a',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#27272a',
          borderRadius: '10px',
          '&:hover': {
            background: '#3f3f46',
          },
        },
      }}
    >
      {messages.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 3,
          }}
        >
          <Zoom in timeout={500}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: '#18181b',
                border: '1px solid #27272a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HistoryEdu sx={{ fontSize: 50, color: '#ffffff' }} />
            </Box>
          </Zoom>
          <Fade in timeout={1000}>
            <Typography
              variant="h5"
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Welcome to AI Legal Assistant
            </Typography>
          </Fade>
          <Fade in timeout={1500}>
            <Typography
              variant="body1"
              sx={{
                color: '#71717a',
                textAlign: 'center',
                maxWidth: '400px',
              }}
            >
              🎤 Use the voice recorder to ask your legal questions
            </Typography>
          </Fade>
        </Box>
      ) : (
        <>
          {messages.map((message, index) => (
            <Fade in key={index} timeout={500}>
              <div>
                <MessageBubble message={message} />
              </div>
            </Fade>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </Paper>
  );
};

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 3,
        gap: 1.5,
      }}
    >
      {!isUser && (
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: '#18181b',
            border: '1px solid #27272a',
          }}
        >
          <SmartToy sx={{ color: '#ffffff', fontSize: 20 }} />
        </Avatar>
      )}

      <Box sx={{ maxWidth: '70%' }}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            bgcolor: isUser ? '#18181b' : '#0a0a0a',
            border: isUser ? '1px solid #27272a' : '1px solid #1f1f1f',
            borderRadius: 2,
            position: 'relative',
          }}
        >
          {!isUser && (
            <Chip
              icon={<Verified sx={{ fontSize: 14 }} />}
              label="AI Assistant"
              size="small"
              sx={{
                position: 'absolute',
                top: -10,
                left: 12,
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: '#18181b',
                color: '#a1a1aa',
                border: '1px solid #27272a',
              }}
            />
          )}

          <Typography
            variant="body1"
            sx={{
              color: '#ffffff',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              fontSize: '0.95rem',
              mt: !isUser ? 1 : 0,
            }}
          >
            {message.content}
          </Typography>

          {message.timestamp && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1.5,
                color: '#52525b',
                fontSize: '0.75rem',
                textAlign: 'right',
              }}
            >
              {new Date(message.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          )}
        </Paper>
      </Box>

      {isUser && (
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: '#18181b',
            border: '1px solid #27272a',
          }}
        >
          <Person sx={{ color: '#ffffff', fontSize: 20 }} />
        </Avatar>
      )}
    </Box>
  );
};

export default ChatDisplay;
