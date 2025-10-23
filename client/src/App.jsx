import { useState, useEffect } from "react";
import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tab,
  Tabs,
  Alert,
  Snackbar,
  Fade,
  IconButton,
  Badge,
  Chip,
} from "@mui/material";
import { Gavel, Chat, Settings, Notifications } from "@mui/icons-material";
import VoiceRecorder from "./components/VoiceRecorder";
import ChatDisplay from "./components/ChatDisplay";
import AudioPlayer from "./components/AudioPlayer";
import UserProfile from "./components/UserProfile";
import { userAPI, voiceAPI } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      let userId = localStorage.getItem("userId");

      if (!userId) {
        const userData = {
          name: "Demo User",
          email: `user${Date.now()}@example.com`,
          preferences: {
            legalJurisdiction: "Indian",
            conversationStyle: "formal",
            voiceId: "aura-asteria-en",
            language: "en",
          },
        };

        const response = await userAPI.register(userData);
        userId = response.userId;
        localStorage.setItem("userId", userId);
        setUser(response.user);
      } else {
        const userData = await userAPI.getUser(userId);
        setUser(userData);
      }

      // No WebSocket - using REST API only
      showNotification("Connected to AI assistant", "success");
    } catch (error) {
      console.error("Error initializing user:", error);
      showNotification("Failed to initialize user", "error");
    }
  };

  const handleSendAudio = async (audioBlob) => {
  setIsProcessing(true);
  
  try {
    // Safety check: ensure user is loaded
    if (!user || !user._id) {
      console.error('❌ User not loaded');
      showNotification('User not initialized. Please refresh the page.', 'error');
      setIsProcessing(false);
      return;
    }
    
    // Step 1: Transcribe
    console.log('🎤 Transcribing audio...');
    const transcribeResponse = await voiceAPI.transcribe(audioBlob);
    
    // ... rest of your code
  } catch (error) {
    console.error('❌ Error processing audio:', error);
    showNotification('Failed to process audio', 'error');
  } finally {
    setIsProcessing(false);
  }
};

  const handleUpdatePreferences = async (preferences) => {
    try {
      await userAPI.updatePreferences(user._id, preferences);
      setUser((prev) => ({ ...prev, preferences }));
      showNotification("Preferences updated successfully", "success");
    } catch (error) {
      console.error("Error updating preferences:", error);
      showNotification("Failed to update preferences", "error");
    }
  };

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const showNotification = (message, severity = "info") => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ open: false, message: "", severity: "info" });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0a0a0a",
        color: "#ffffff",
      }}
    >
      {/* App Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#000000",
          borderBottom: "1px solid #1f1f1f",
        }}
      >
        <Toolbar sx={{ py: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Gavel sx={{ fontSize: 28, color: "#ffffff" }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.5px",
              }}
            >
              AI Legal Assistant
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Chip
            label={`${messages.length} queries`}
            sx={{
              bgcolor: "#1f1f1f",
              color: "#a1a1aa",
              fontWeight: 600,
              border: "1px solid #27272a",
              mr: 2,
            }}
          />

          <IconButton sx={{ color: "#a1a1aa" }}>
            <Badge badgeContent={0} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Tabs */}
      <Box
        sx={{
          bgcolor: "#000000",
          borderBottom: "1px solid #1f1f1f",
        }}
      >
        <Container maxWidth="xl">
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            sx={{
              "& .MuiTab-root": {
                color: "#71717a",
                fontWeight: 600,
                fontSize: "0.95rem",
                textTransform: "none",
                minHeight: 56,
                "&.Mui-selected": {
                  color: "#ffffff",
                },
              },
              "& .MuiTabs-indicator": {
                height: 2,
                bgcolor: "#ffffff",
              },
            }}
          >
            <Tab icon={<Chat />} iconPosition="start" label="Voice Assistant" />
            <Tab icon={<Settings />} iconPosition="start" label="Settings" />
          </Tabs>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Fade in timeout={500}>
          <Box>
            {currentTab === 0 && (
              <Box
                sx={{ display: "flex", gap: 3, height: "calc(100vh - 200px)" }}
              >
                {/* LEFT: Chat Display (80%) */}
                <Box
                  sx={{
                    flex: "0 0 calc(80% - 12px)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <ChatDisplay messages={messages} />
                  {audioUrl && <AudioPlayer audioUrl={audioUrl} autoPlay />}
                </Box>

                {/* RIGHT: Voice Recorder (20%) */}
                <Box sx={{ flex: "0 0 calc(20% - 12px)" }}>
                  <VoiceRecorder
                    onSendAudio={handleSendAudio}
                    isProcessing={isProcessing}
                  />
                </Box>
              </Box>
            )}

            {currentTab === 1 && (
              <UserProfile
                user={user}
                onUpdatePreferences={handleUpdatePreferences}
              />
            )}
          </Box>
        </Fade>
      </Container>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{
            bgcolor:
              notification.severity === "success" ? "#18181b" : undefined,
            color: "#ffffff",
            border: "1px solid #27272a",
            borderRadius: 2,
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
