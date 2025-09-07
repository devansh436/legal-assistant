import { ButtonGroup, Button } from 'react-bootstrap'
import { Globe } from 'lucide-react'

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
  ]

  return (
    <div className="d-flex align-items-center gap-2">
      <Globe className="text-primary" size={20} />
      <ButtonGroup size="sm">
        {languages.map(lang => (
          <Button
            key={lang.code}
            variant={selectedLanguage === lang.code ? 'primary' : 'outline-primary'}
            onClick={() => onLanguageChange(lang.code)}
            className="d-flex align-items-center gap-1"
            title={lang.name}
          >
            <span className="fs-5">{lang.flag}</span>
            <span className="d-none d-sm-inline">{lang.name}</span>
          </Button>
        ))}
      </ButtonGroup>
    </div>
  )
}

export default LanguageSelector

