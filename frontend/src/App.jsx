import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ChakraProvider, Box, Flex, keyframes } from '@chakra-ui/react'
import theme from './theme'
import Login from './components/Login'
import LandingPage from './components/LandingPage'
import Navbar from './components/Navbar'
import GlobalMetrics from './components/GlobalMetrics'
import Filters from './components/Filters'
import PartnersSummary from './components/PartnersSummary'
import DeepDive from './components/DeepDive'
import Insights from './components/Insights'

// Animation keyframes
const fadeInUp = keyframes`
  0% { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0); 
  }
`

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`

// Home component with landing page
function HomePage({ user, onLogout }) {
  const navigate = useNavigate()
  
  const handleClientSelect = (client) => {
    console.log('Client selected:', client)
    // Navigate to dashboard with client context
    navigate('/dashboard', { state: { client } })
  }

  return (
    <LandingPage 
      user={user} 
      onClientSelect={handleClientSelect} 
    />
  )
}

// Dashboard component with animations
function Dashboard({ user, onLogout }) {
  // State for filters and selections
  const [selectedPeriod, setSelectedPeriod] = useState(12) // Default to 12 weeks
  const [selectedChannel, setSelectedChannel] = useState('all') // Default to all channels
  const [selectedPartner, setSelectedPartner] = useState(null)
  
  // Animation states
  const [mounted, setMounted] = useState(false)
  
  // Get client info from route state
  const location = useLocation()
  const selectedClient = location.state?.client

  // Trigger animations on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Handle partner selection from PartnersSummary component
  const handlePartnerSelect = (partner) => {
    setSelectedPartner(partner)
    // Optional: Log for debugging
    console.log('Selected partner:', partner)
  }

  return (
    <Box minH="100vh" bg="bg-main">
      {/* Navbar with fade in */}
      <Box
        opacity={0}
        animation={mounted ? `${fadeIn} 0.6s ease-out 0.1s forwards` : 'none'}
      >
        <Navbar selectedClient={selectedClient} />
      </Box>
      
      <Box p={6}>
        {/* Filters with slide up animation */}
        <Box
          opacity={0}
          animation={mounted ? `${fadeInUp} 0.8s ease-out 0.3s forwards` : 'none'}
        >
          <Filters 
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            selectedChannel={selectedChannel}
            onChannelChange={setSelectedChannel}
          />
        </Box>
        
        {/* Global Metrics with slide up animation */}
        <Box
          opacity={0}
          animation={mounted ? `${fadeInUp} 0.8s ease-out 0.5s forwards` : 'none'}
        >
          <GlobalMetrics period={selectedPeriod} />
        </Box>
        
        {/* Three-column layout with staggered animations */}
        <Flex gap={6} mt={6}>
          {/* Left Panel - Partners Summary */}
          <Box 
            flex="1" 
            minW="300px"
            opacity={0}
            animation={mounted ? `${fadeInUp} 0.8s ease-out 0.7s forwards` : 'none'}
          >
            <PartnersSummary 
              selectedPeriod={selectedPeriod}
              selectedChannel={selectedChannel}
              selectedPartner={selectedPartner}
              onPartnerSelect={handlePartnerSelect}
            />
          </Box>
          
          {/* Middle Panel - Deep Dive */}
          <Box 
            flex="2" 
            minW="400px"
            opacity={0}
            animation={mounted ? `${fadeInUp} 0.8s ease-out 0.9s forwards` : 'none'}
          >
            <DeepDive 
              period={selectedPeriod}
              selectedPartner={selectedPartner}
              selectedChannel={selectedChannel}
            />
          </Box>
          
          {/* Right Panel - Insights */}
          <Box 
            flex="1" 
            minW="300px"
            opacity={0}
            animation={mounted ? `${fadeInUp} 0.8s ease-out 1.1s forwards` : 'none'}
          >
            <Insights 
              period={selectedPeriod}
              selectedPartner={selectedPartner}
              selectedChannel={selectedChannel}
            />
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

// Main App component
function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  // Handle login
  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
    console.log('User logged in:', userData)
  }

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    console.log('User logged out')
  }

  return (
    <ChakraProvider theme={theme}>
      <Router>
        {!isAuthenticated ? (
          // Show login page when not authenticated
          <Login onLogin={handleLogin} />
        ) : (
          // Show main app when authenticated
          <Routes>
            {/* Default route redirects to home */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            
            {/* Landing page with client selection */}
            <Route path="/home" element={<HomePage user={user} onLogout={handleLogout} />} />
            
            {/* Dashboard route */}
            <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        )}
      </Router>
    </ChakraProvider>
  )
}

export default App