import { Box, Flex, Text, Button, HStack, Spacer, useColorMode, IconButton, Badge } from '@chakra-ui/react'
import { BarChart3, TrendingUp, Users, Settings, Sun, Moon, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Navbar({ selectedClient }) {
  const { colorMode, toggleColorMode } = useColorMode()
  const navigate = useNavigate()

  const handleHomeClick = () => {
    navigate('/home')
  }

  return (
    <Box bg="bg-surface" px={6} py={3} borderBottom="1px solid" borderColor="border-main">
      <Flex h={10} alignItems="center">
        <Text 
          fontSize="lg" 
          fontWeight="bold" 
          color="text-primary"
          mr={8}
        >
          Blu. Performance
        </Text>

        <HStack spacing={1}>
          <Button
            variant="solid"
            bg="blue.600"
            color="white"
            size="xs"
            leftIcon={<BarChart3 size={14} />}
            _hover={{ bg: 'blue.500' }}
            _active={{ bg: 'blue.700' }}
            fontSize="xs"
            fontWeight="semibold"
            px={3}
            py={2}
            rounded="md"
          >
            Partner Overview
          </Button>
          
          <Button
            variant="ghost"
            color="text-muted"
            size="xs"
            leftIcon={<TrendingUp size={14} />}
            _hover={{ bg: 'bg-card', color: 'text-primary' }}
            fontSize="xs"
            fontWeight="semibold"
            px={3}
            py={2}
            rounded="md"
          >
            Channel Performance
          </Button>
          
          <Button
            variant="ghost"
            color="text-muted"
            size="xs"
            leftIcon={<Users size={14} />}
            _hover={{ bg: 'bg-card', color: 'text-primary' }}
            fontSize="xs"
            fontWeight="semibold"
            px={3}
            py={2}
            rounded="md"
          >
            Scenario Planner
          </Button>
        </HStack>

        <Spacer />

        <HStack spacing={4} color="text-muted">
          {/* Client Display */}
          {selectedClient && (
            <>
              <HStack spacing={2}>
                <Text fontSize="xs" color="text-muted">
                  Client:
                </Text>
                <Badge 
                  colorScheme="blue" 
                  fontSize="xs" 
                  px={2} 
                  py={1}
                  fontWeight="semibold"
                >
                  {selectedClient.name}
                </Badge>
              </HStack>
              <Box w="1px" h={3} bg="border-main" />
            </>
          )}

          {/* Home Button */}
          <IconButton
            aria-label="Go to home"
            icon={<Home size={14} />}
            onClick={handleHomeClick}
            variant="ghost"
            size="xs"
            color="text-muted"
            _hover={{ color: 'text-secondary', bg: 'bg-card' }}
            rounded="md"
            title="Select different client"
          />

          <Text fontSize="xs">
            Data refreshed 1 minute ago
          </Text>
          <Box w="1px" h={3} bg="border-main" />
          
          {/* Color Mode Toggle */}
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            onClick={toggleColorMode}
            variant="ghost"
            size="xs"
            color="text-muted"
            _hover={{ color: 'text-secondary', bg: 'bg-card' }}
            rounded="md"
          />
          
          <HStack spacing={2} cursor="pointer" _hover={{ color: 'text-secondary' }}>
            <Settings size={14} />
            <Text fontSize="xs">Settings</Text>
          </HStack>
        </HStack>
      </Flex>
    </Box>
  )
}

export default Navbar