import { useState } from 'react'
import { Container, Row, Col, Nav } from 'react-bootstrap'
import ChatInterface from '../components/ChatInterface'
import SpeechInput from '../components/SpeechInput'
import Navbar from '../components/Navbar';
import LanguageSelector from '../components/LanguageSelector'

const LegalAssistant = () => {
  const [messages, setMessages] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')

  const handleSpeechResult = (transcript) => {
    const newMessage = {
      id: Date.now(),
      text: transcript,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      language: selectedLanguage
    }
    setMessages(prev => [...prev, newMessage])
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: `I understand you said: "${transcript}". This is a simulated legal assistant response. In a real implementation, this would connect to a legal AI service.`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
        language: selectedLanguage
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language)
  }

  return (
    <div className="bg-gradient-dark min-vh-100">
      <Navbar 
        selectedLanguage={selectedLanguage}
        handleLanguageChange={handleLanguageChange}
      />
      
      <Container className="py-4">
        <Row className="g-4">
          <Col lg={8}>
            <ChatInterface messages={messages} />
          </Col>
          <Col lg={4}>
            <SpeechInput 
              onSpeechResult={handleSpeechResult}
              isListening={isListening}
              setIsListening={setIsListening}
              language={selectedLanguage}
            />
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default LegalAssistant
