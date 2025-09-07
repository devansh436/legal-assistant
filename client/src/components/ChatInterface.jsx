import { Card, ListGroup, Badge, Alert } from 'react-bootstrap'
import { MessageCircle, Bot, User } from 'lucide-react'

const ChatInterface = ({ messages }) => {
  return (
    <Card className="card-glass h-100">
      <Card.Header className="d-flex align-items-center gap-2 bg-dark text-white">
        <MessageCircle size={24} className="text-primary" />
        <h5 className="mb-0">Legal Consultation</h5>
      </Card.Header>
      
      <Card.Body className="p-0" style={{ height: '500px', overflowY: 'auto' }}>
        {messages.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
            <Bot size={48} className="text-primary mb-3 opacity-75" />
            <h6>Start speaking to begin your legal consultation</h6>
            <small>Your personalized legal assistant is ready to help</small>
          </div>
        ) : (
          <ListGroup variant="flush">
            {messages.map(message => (
              <ListGroup.Item 
                key={message.id} 
                className={`border-0 p-3 ${message.sender === 'user' ? 'bg-primary bg-opacity-10' : 'bg-secondary bg-opacity-10'}`}
              >
                <div className={`d-flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`rounded-circle d-flex align-items-center justify-content-center ${message.sender === 'user' ? 'bg-gradient-primary text-white' : 'bg-dark text-primary'}`} 
                       style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                    {message.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className="flex-grow-1">
                    <div className={`p-3 rounded-3 ${message.sender === 'user' ? 'bg-primary bg-opacity-20' : 'bg-dark bg-opacity-50'}`}>
                      <p className="mb-2">{message.text}</p>
                      <div className="d-flex gap-3 small text-muted">
                        <span>{message.timestamp}</span>
                        <Badge bg={message.language === 'hi' ? 'info' : 'secondary'}>
                          {message.language === 'hi' ? 'हिंदी' : 'English'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  )
}

export default ChatInterface
