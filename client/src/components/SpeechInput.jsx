import { useState, useEffect, useCallback } from 'react'
import { Card, Button, Alert, Badge, Spinner } from 'react-bootstrap'
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react'

const SpeechInput = ({ onSpeechResult, isListening, setIsListening, language }) => {
  const [recognition, setRecognition] = useState(null)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [permissionGranted, setPermissionGranted] = useState(false)

  // Check for microphone permission
  const checkMicrophonePermission = useCallback(async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' })
        setPermissionGranted(permission.state === 'granted')
        return permission.state === 'granted'
      }
      return true // Assume granted if we can't check
    } catch (err) {
      console.log('Permission check not supported:', err)
      return true
    }
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    const initializeSpeechRecognition = async () => {
      // Check browser support
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setIsSupported(false)
        setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
        return
      }

      // Check microphone permission
      const hasPermission = await checkMicrophonePermission()
      if (!hasPermission) {
        setError('Microphone permission is required for voice input. Please allow microphone access.')
        return
      }

      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognitionInstance = new SpeechRecognition()
        
        // Configure recognition settings
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.maxAlternatives = 1
        recognitionInstance.lang = language === 'hi' ? 'hi-IN' : 'en-US'
        
        // Add timeout settings to prevent automatic stopping
        recognitionInstance.serviceURI = 'wss://www.google.com/speech-api/full-duplex/v1/up'
        
        // Event handlers
        recognitionInstance.onstart = () => {
          console.log('Speech recognition started')
          setIsListening(true)
          setTranscript('')
          setError('')
        }
        
        recognitionInstance.onresult = (event) => {
          console.log('Speech recognition result:', event)
          let finalTranscript = ''
          let interimTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }
          
          // Update transcript display
          setTranscript(finalTranscript || interimTranscript)
          
          // Process final result
          if (finalTranscript) {
            console.log('Final transcript:', finalTranscript)
            onSpeechResult(finalTranscript.trim())
            // Don't stop listening automatically - let user control it
            // setIsListening(false)
            setTranscript('')
          }
        }
        
        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          
          switch (event.error) {
            case 'no-speech':
              setError('No speech detected. Please try speaking again.')
              break
            case 'audio-capture':
              setError('Microphone not found. Please check your microphone connection.')
              break
            case 'not-allowed':
              setError('Microphone permission denied. Please allow microphone access.')
              setPermissionGranted(false)
              break
            case 'network':
              setError('Network error occurred. Please check your internet connection.')
              break
            case 'aborted':
              setError('Speech recognition was aborted.')
              break
            default:
              setError(`Speech recognition error: ${event.error}`)
          }
        }
        
        recognitionInstance.onend = () => {
          console.log('Speech recognition ended')
          setIsListening(false)
        }
        
        setRecognition(recognitionInstance)
        setIsSupported(true)
        setError('')
      } catch (err) {
        console.error('Failed to initialize speech recognition:', err)
        setError('Failed to initialize speech recognition. Please refresh the page and try again.')
      }
    }

    initializeSpeechRecognition()
  }, [language, onSpeechResult, checkMicrophonePermission])

  const toggleListening = async () => {
    if (!recognition) {
      setError('Speech recognition not initialized. Please refresh the page.')
      return
    }
    
    try {
      if (isListening) {
        recognition.stop()
      } else {
        // Clear any previous errors
        setError('')
        setTranscript('')
        
        // Start recognition
        recognition.start()
      }
    } catch (err) {
      console.error('Error toggling speech recognition:', err)
      setError('Failed to start speech recognition. Please try again.')
    }
  }

  const speakText = (text) => {
    try {
      if ('speechSynthesis' in window) {
        // Stop any ongoing speech
        speechSynthesis.cancel()
        
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US'
        utterance.rate = 0.8
        utterance.pitch = 1
        utterance.volume = 0.8
        
        utterance.onstart = () => {
          console.log('Speech synthesis started')
        }
        
        utterance.onend = () => {
          console.log('Speech synthesis ended')
        }
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error)
          setError(`Failed to play audio: ${event.error}`)
        }
        
        speechSynthesis.speak(utterance)
      } else {
        setError('Speech synthesis is not supported in this browser.')
      }
    } catch (err) {
      console.error('Error with speech synthesis:', err)
      setError('Failed to play audio.')
    }
  }

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop()) // Stop the stream immediately
      setPermissionGranted(true)
      setError('')
    } catch (err) {
      console.error('Microphone permission denied:', err)
      setError('Microphone permission is required. Please allow microphone access and refresh the page.')
    }
  }

  if (!isSupported) {
    return (
      <Card className="card-glass">
        <Card.Body className="text-center text-danger">
          <AlertCircle size={48} className="mb-3" />
          <h6>Speech recognition is not supported in this browser</h6>
          <p className="small">Please use Chrome, Edge, or Safari for the best experience</p>
        </Card.Body>
      </Card>
    )
  }

  if (!permissionGranted) {
    return (
      <Card className="card-glass">
        <Card.Body className="text-center text-warning">
          <AlertCircle size={48} className="mb-3" />
          <h6>Microphone permission is required for voice input</h6>
          <Button 
            variant="primary"
            onClick={requestMicrophonePermission}
            className="mt-2"
          >
            Grant Microphone Permission
          </Button>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card className="card-glass">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          <AlertCircle size={16} className="me-2" />
          {error}
        </Alert>
      )}
      
      <Card.Body>
        <div className="d-flex flex-column align-items-center gap-3">
          <Button
            variant={isListening ? 'danger' : 'primary'}
            size="lg"
            className={`rounded-circle ${isListening ? 'pulse-animation' : ''}`}
            onClick={toggleListening}
            disabled={!isSupported || !permissionGranted}
            style={{ width: '80px', height: '80px' }}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </Button>
          
          <div className="text-center">
            {isListening ? (
              <div className="d-flex align-items-center justify-content-center gap-2 text-danger">
                <Spinner animation="grow" size="sm" />
                <span>Listening... Speak now</span>
              </div>
            ) : (
              <span className="text-muted">Click microphone to start speaking</span>
            )}
          </div>
          
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => speakText('Hello, I am your legal assistant. How can I help you today?')}
              title="Test English speech synthesis"
            >
              <Volume2 size={16} className="me-1" />
              EN
            </Button>
            
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => speakText('नमस्ते, मैं आपका कानूनी सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?')}
              title="Test Hindi speech synthesis"
            >
              <Volume2 size={16} className="me-1" />
              HI
            </Button>
          </div>
        </div>
        
        {transcript && (
          <Alert variant="info" className="mt-3">
            <strong>You said:</strong> {transcript}
          </Alert>
        )}
        
        <div className="text-center mt-3">
          <Badge bg="secondary">
            Current language: {language === 'hi' ? 'हिंदी (Hindi)' : 'English'}
          </Badge>
        </div>
      </Card.Body>
    </Card>
  )
}

export default SpeechInput
