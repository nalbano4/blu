// frontend/src/components/Login.jsx - Corporate Modern Login
import { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Flex,
  Badge,
  useColorModeValue,
  keyframes
} from '@chakra-ui/react';
import { Eye, EyeOff, Mail, Lock, BarChart3 } from 'lucide-react';

// Fade-in animation
const fadeInUp = keyframes`
  0% { 
    opacity: 0; 
    transform: translateY(40px); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Demo accounts for easy testing
  const demoAccounts = [
    { email: 'admin@blu.com', password: 'admin123', role: 'Admin', color: 'red' },
    { email: 'analyst@blu.com', password: 'analyst123', role: 'Analyst', color: 'blue' },
    { email: 'kevin@blu.com', password: 'kevin123', role: 'Executive', color: 'purple' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication - replace with real API
      const user = demoAccounts.find(account => 
        account.email === email && account.password === password
      );

      if (user) {
        onLogin({ 
          name: user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1),
          email: user.email,
          role: user.role 
        });
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <Box
      minH="100vh"
      bg="blue.600"
      bgGradient="linear(to-br, blue.600, blue.800, blue.900)"
      position="relative"
      overflow="hidden"
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.1}
        backgroundImage="radial-gradient(circle at 20% 80%, white 1px, transparent 1px)"
        backgroundSize="60px 60px"
      />

      <Flex
        minH="100vh"
        align="center"
        justify="center"
        px={6}
        position="relative"
        zIndex={1}
      >
        <Box maxW="420px" w="full">
          {/* Header */}
          <VStack 
            spacing={6} 
            mb={8} 
            textAlign="center"
            animation={`${fadeInUp} 1s ease-out forwards`}
          >
            <VStack spacing={4}>
              <Flex align="center" gap={3}>
                <Box p={3} bg="rgba(255, 255, 255, 0.15)" rounded="xl" backdropFilter="blur(10px)">
                  <BarChart3 size={28} color="white" />
                </Box>
                <Heading size="xl" color="white" fontWeight="300">
                  Media Performance
                </Heading>
              </Flex>
              <Text color="blue.100" fontSize="lg" fontWeight="300">
                Powered by Blu.
              </Text>
            </VStack>
          </VStack>

          {/* Login Card */}
          <Box
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(20px)"
            border="1px"
            borderColor="rgba(255, 255, 255, 0.2)"
            rounded="2xl"
            p={8}
            shadow="2xl"
            animation={`${fadeIn} 1.2s ease-out 0.3s forwards`}
            opacity={0}
            style={{ animationFillMode: 'forwards' }}
          >
            

            {/* Error Message */}
            {error && (
              <Alert status="error" mb={6} rounded="lg" bg="red.500" color="white" border="none">
                <AlertIcon color="white" />
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <VStack spacing={5}>
                {/* Email Input */}
                <Box w="full">
                  <Text fontSize="sm" fontWeight="medium" mb={2} color="rgba(255, 255, 255, 0.8)">
                    Email Address
                  </Text>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Mail color="rgba(255, 255, 255, 0.5)" size={18} />
                    </InputLeftElement>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      bg="rgba(255, 255, 255, 0.1)"
                      border="1px"
                      borderColor="rgba(255, 255, 255, 0.2)"
                      _hover={{ borderColor: 'rgba(255, 255, 255, 0.4)' }}
                      _focus={{ 
                        borderColor: 'rgba(255, 255, 255, 0.6)',
                        boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.3)'
                      }}
                      color="white"
                      _placeholder={{ color: 'rgba(255, 255, 255, 0.5)' }}
                      size="lg"
                      transition="all 0.3s ease"
                    />
                  </InputGroup>
                </Box>

                {/* Password Input */}
                <Box w="full">
                  <Text fontSize="sm" fontWeight="medium" mb={2} color="rgba(255, 255, 255, 0.8)">
                    Password
                  </Text>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Lock color="rgba(255, 255, 255, 0.5)" size={18} />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      bg="rgba(255, 255, 255, 0.1)"
                      border="1px"
                      borderColor="rgba(255, 255, 255, 0.2)"
                      _hover={{ borderColor: 'rgba(255, 255, 255, 0.4)' }}
                      _focus={{ 
                        borderColor: 'rgba(255, 255, 255, 0.6)',
                        boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.3)'
                      }}
                      color="white"
                      _placeholder={{ color: 'rgba(255, 255, 255, 0.5)' }}
                      size="lg"
                      transition="all 0.3s ease"
                    />
                    <InputRightElement>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                        icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        color="rgba(255, 255, 255, 0.5)"
                        _hover={{ color: 'white' }}
                      />
                    </InputRightElement>
                  </InputGroup>
                </Box>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  bg="white"
                  color="blue.700"
                  fontWeight="semibold"
                  _hover={{ 
                    bg: 'gray.100',
                    transform: 'translateY(-1px)',
                    shadow: 'lg'
                  }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.3s ease"
                  mt={2}
                >
                  Sign In
                </Button>
              </VStack>
            </form>

            {/* Footer */}
            <Text fontSize="xs" color="rgba(255, 255, 255, 0.5)" textAlign="center" mt={8}>
              Secure access to media performance analytics
            </Text>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Login;