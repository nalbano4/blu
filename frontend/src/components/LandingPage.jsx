// frontend/src/components/LandingPage.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Image,
  Grid,
  GridItem,
  Flex,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  keyframes
} from '@chakra-ui/react';
import { ChevronRight, TrendingUp, Users, DollarSign, Search } from 'lucide-react';

// Fade-in animation keyframes
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

const LandingPage = ({ user, onClientSelect }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample client data - replace with your actual clients
  const clients = [
    {
      id: 'nike',
      name: 'Horizon Pitch',
      logo: '/logos/hmi-logo.png', // Replace with actual logo URLs
      bannerImage: '/banners/horizon-banner.png', // Add banner image here
      description: 'New Business Demo',
      metrics: {
        campaigns: 24,
        spend: '$215.4M',
        roas: '$4.20'
      },
      color: 'orange.500',
      bgGradient: 'linear(to-br, orange.400, orange.600)',
      bannerPattern: 'nike'
    },
    {
      id: 'apple',
      name: 'Tropical Smoothie Cafe',
      logo: '/logos/TSC-logo.png',
      bannerImage: '/banners/tsc-banner.jpg', // Add banner image here
      description: 'Quick Service Restaurant',
      metrics: {
        campaigns: 18,
        spend: '$47.8M',
        roas: '$5.85'
      },
      color: 'gray.600',
      bgGradient: 'linear(to-br, gray.500, gray.700)',
      bannerPattern: 'apple'
    },
    {
      id: 'coca-cola',
      name: 'GoGoSqueez',
      logo: '/logos/ggs-logo-fit.jpg',
      bannerImage: '/banners/ggs-banner-green.jpg', // Add banner image here
      description: 'Consumer Packaged Goods',
      metrics: {
        campaigns: 31,
        spend: '$30.9M',
        roas: '$2.45'
      },
      color: 'red.500',
      bgGradient: 'linear(to-br, red.400, red.600)',
      bannerPattern: 'coca-cola'
    },
    {
      id: 'amazon',
      name: 'Revlon',
      logo: '/logos/revlon-logo.png',
      bannerImage: '/banners/revlon-banner.jpg', // Add banner image here
      description: 'Retail and Beauty',
      metrics: {
        campaigns: 42,
        spend: '$25.2M',
        roas: '$6.10'
      },
      color: 'yellow.500',
      bgGradient: 'linear(to-br, yellow.400, orange.500)',
      bannerPattern: 'amazon'
    },
    {
      id: 'tesla',
      name: 'Impossible Foods',
      logo: '/logos/if-logo.png',
      bannerImage: '/banners/if-banner.jpg', // Add banner image here
      description: 'Consumer Packaged Goods',
      metrics: {
        campaigns: 15,
        spend: '$38.1M',
        roas: '$2.75'
      },
      color: 'red.600',
      bgGradient: 'linear(to-br, red.500, red.700)',
      bannerPattern: 'tesla'
    },
    {
      id: 'microsoft',
      name: 'Starkist',
      logo: '/logos/starkist-logo.jpg',
      bannerImage: '/banners/starkist-banner.jpg', // Add banner image here
      description: 'Consumer Packaged Goods',
      metrics: {
        campaigns: 28,
        spend: '$29.1M',
        roas: '$5.25'
      },
      color: 'blue.600',
      bgGradient: 'linear(to-br, blue.500, blue.700)',
      bannerPattern: 'microsoft'
    }
  ];

  // Staggered animation timing
  useEffect(() => {
    const timer1 = setTimeout(() => setShowWelcome(true), 500);
    const timer2 = setTimeout(() => setShowSubtext(true), 1500);
    const timer3 = setTimeout(() => setShowSearch(true), 2200);
    const timer4 = setTimeout(() => setShowCards(true), 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Function to render banner decorations based on pattern
  const renderBannerDecorations = (pattern) => {
    switch (pattern) {
      case 'nike':
        return (
          <>
            {/* Nike-inspired swoosh pattern */}
            <Box
              position="absolute"
              top="20px"
              right="10px"
              w="50px"
              h="25px"
              bg="rgba(255, 255, 255, 0.15)"
              borderRadius="0 25px 25px 0"
            />
            <Box
              position="absolute"
              top="10px"
              right="20px"
              w="30px"
              h="30px"
              bg="rgba(255, 255, 255, 0.1)"
              borderRadius="full"
            />
          </>
        );
      case 'apple':
        return (
          <>
            {/* Apple-inspired clean circles */}
            <Box
              position="absolute"
              top="15px"
              right="15px"
              w="35px"
              h="35px"
              bg="rgba(255, 255, 255, 0.12)"
              borderRadius="full"
            />
            <Box
              position="absolute"
              top="25px"
              right="35px"
              w="20px"
              h="20px"
              bg="rgba(255, 255, 255, 0.08)"
              borderRadius="full"
            />
          </>
        );
      case 'coca-cola':
        return (
          <>
            {/* Coca-Cola inspired bubbles */}
            <Box
              position="absolute"
              top="10px"
              right="10px"
              w="25px"
              h="25px"
              bg="rgba(255, 255, 255, 0.2)"
              borderRadius="full"
            />
            <Box
              position="absolute"
              top="35px"
              right="25px"
              w="18px"
              h="18px"
              bg="rgba(255, 255, 255, 0.15)"
              borderRadius="full"
            />
            <Box
              position="absolute"
              top="20px"
              right="45px"
              w="12px"
              h="12px"
              bg="rgba(255, 255, 255, 0.1)"
              borderRadius="full"
            />
          </>
        );
      case 'amazon':
        return (
          <>
            {/* Amazon-inspired arrow/smile pattern */}
            <Box
              position="absolute"
              top="15px"
              right="15px"
              w="40px"
              h="20px"
              bg="rgba(255, 255, 255, 0.15)"
              borderRadius="20px"
            />
            <Box
              position="absolute"
              top="40px"
              right="25px"
              w="30px"
              h="15px"
              bg="rgba(255, 255, 255, 0.1)"
              borderRadius="15px"
            />
          </>
        );
      case 'tesla':
        return (
          <>
            {/* Tesla-inspired electric pattern */}
            <Box
              position="absolute"
              top="10px"
              right="10px"
              w="8px"
              h="30px"
              bg="rgba(255, 255, 255, 0.15)"
              borderRadius="4px"
              transform="rotate(15deg)"
            />
            <Box
              position="absolute"
              top="20px"
              right="25px"
              w="8px"
              h="25px"
              bg="rgba(255, 255, 255, 0.12)"
              borderRadius="4px"
              transform="rotate(-15deg)"
            />
            <Box
              position="absolute"
              top="30px"
              right="40px"
              w="6px"
              h="20px"
              bg="rgba(255, 255, 255, 0.08)"
              borderRadius="3px"
              transform="rotate(25deg)"
            />
          </>
        );
      case 'microsoft':
        return (
          <>
            {/* Microsoft-inspired squares pattern */}
            <Box
              position="absolute"
              top="15px"
              right="15px"
              w="20px"
              h="20px"
              bg="rgba(255, 255, 255, 0.15)"
              borderRadius="2px"
            />
            <Box
              position="absolute"
              top="15px"
              right="40px"
              w="15px"
              h="15px"
              bg="rgba(255, 255, 255, 0.12)"
              borderRadius="2px"
            />
            <Box
              position="absolute"
              top="40px"
              right="15px"
              w="15px"
              h="15px"
              bg="rgba(255, 255, 255, 0.12)"
              borderRadius="2px"
            />
            <Box
              position="absolute"
              top="40px"
              right="35px"
              w="12px"
              h="12px"
              bg="rgba(255, 255, 255, 0.08)"
              borderRadius="2px"
            />
          </>
        );
      default:
        return (
          <>
            {/* Default pattern */}
            <Box
              position="absolute"
              top="10px"
              right="15px"
              w="40px"
              h="40px"
              bg="rgba(255, 255, 255, 0.15)"
              borderRadius="full"
            />
            <Box
              position="absolute"
              top="30px"
              right="35px"
              w="20px"
              h="20px"
              bg="rgba(255, 255, 255, 0.1)"
              borderRadius="full"
            />
          </>
        );
    }
  };
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientClick = (client) => {
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');

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

      <Box p={8} position="relative" zIndex={1}>
        {/* Welcome Text */}
        <VStack spacing={8} align="center" mb={16}>
          <VStack spacing={4} textAlign="center">
            {/* Main Welcome Message */}
            <Box
              animation={showWelcome ? `${fadeInUp} 1.5s ease-out forwards` : 'none'}
              opacity={showWelcome ? 1 : 0}
            >
              <Heading
                size="2xl"
                color="white"
                fontWeight="300"
                lineHeight="1.2"
                maxW="800px"
              >
                Hello, {user?.name?.split(' ')[0] || 'Kevin'}.
              </Heading>
              <Heading
                size="2xl"
                color="white"
                fontWeight="600"
                mt={2}
                maxW="800px"
              >
                Welcome to Media Performance.
              </Heading>
            </Box>

            {/* Subtext */}
            <Box
              animation={showSubtext ? `${fadeInUp} 1.2s ease-out forwards` : 'none'}
              opacity={showSubtext ? 1 : 0}
              mt={6}
            >
              <Text
                fontSize="xl"
                color="blue.100"
                fontWeight="300"
                maxW="600px"
              >
                Which client would you like to explore?
              </Text>
            </Box>

            {/* Search Bar */}
            <Box
              animation={showSearch ? `${fadeInUp} 1s ease-out forwards` : 'none'}
              opacity={showSearch ? 1 : 0}
              mt={8}
              w="full"
              maxW="500px"
            >
              <InputGroup size="md">
                <InputLeftElement pointerEvents="none">
                  <Search color="rgba(255, 255, 255, 0.6)" size={18} />
                </InputLeftElement>
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="rgba(255, 255, 255, 0.1)"
                  backdropFilter="blur(10px)"
                  border="1px"
                  borderColor="rgba(255, 255, 255, 0.2)"
                  _hover={{ 
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    bg: 'rgba(255, 255, 255, 0.15)'
                  }}
                  _focus={{ 
                    borderColor: 'rgba(255, 255, 255, 0.6)', 
                    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.3)',
                    bg: 'rgba(255, 255, 255, 0.15)'
                  }}
                  color="white"
                  fontSize="sm"
                  fontWeight="400"
                  _placeholder={{ color: 'rgba(255, 255, 255, 0.6)' }}
                  transition="all 0.3s ease"
                />
              </InputGroup>
            </Box>
          </VStack>
        </VStack>

        {/* Client Cards */}
        <Box
          animation={showCards ? `${fadeIn} 1s ease-out forwards` : 'none'}
          opacity={showCards ? 1 : 0}
          maxW="1200px"
          mx="auto"
        >
          <Grid
            templateColumns={{
              base: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            }}
            gap={6}
          >
            {filteredClients.length > 0 ? (
              filteredClients.map((client, index) => (
              <GridItem
                key={client.id}
                style={{
                  animationDelay: showCards ? `${index * 0.1}s` : '0s'
                }}
              >
                <Card
                  bg="rgba(255, 255, 255, 0.1)"
                  backdropFilter="blur(20px)"
                  borderRadius="xl"
                  shadow="xl"
                  cursor="pointer"
                  transition="all 0.3s ease"
                  _hover={{
                    transform: 'translateY(-6px)',
                    shadow: '2xl',
                    bg: "rgba(255, 255, 255, 0.15)"
                  }}
                  onClick={() => handleClientClick(client)}
                  position="relative"
                  overflow="hidden"
                  border="1px"
                  borderColor="rgba(255, 255, 255, 0.2)"
                >
                  {/* Top banner with background image and overlay */}
                  <Box
                    h="80px"
                    position="relative"
                    overflow="hidden"
                    backgroundImage={client.bannerImage ? `url(${client.bannerImage})` : 'none'}
                    backgroundSize="cover"
                    backgroundPosition="center"
                    backgroundRepeat="no-repeat"
                  >
                    {/* Dark blue/grey overlay */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bg="linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(51, 65, 85, 0.8))"
                      backdropFilter="blur(1px)"
                    />
                    
                    {/* Fallback gradient if no image */}
                    {!client.bannerImage && (
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bgGradient={client.bgGradient}
                      />
                    )}
                  </Box>

                  <CardBody p={4} pt={0}>
                    {/* Logo positioned to overlap banner */}
                    <Box
                      position="relative"
                      mt="-35px"
                      mb={3}
                      display="flex"
                      justifyContent="flex-start"
                      pl={4}
                    >
                      <Box
                        w="70px"
                        h="70px"
                        bg="white"
                        borderRadius="50%"
                        shadow="lg"
                        border="4px solid white"
                        position="relative"
                      >
                        {/* Logo container - absolutely positioned for perfect centering */}
                        <Box
                          position="absolute"
                          top="50%"
                          left="50%"
                          transform="translate(-50%, -50%)"
                          w="40px"
                          h="40px"
                        >
                          <Image
                            src={client.logo}
                            alt={`${client.name} logo`}
                            w="100%"
                            h="100%"
                            objectFit="contain"
                            fallback={
                              <Flex
                                w="40px"
                                h="40px"
                                bg={client.color}
                                borderRadius="50%"
                                align="center"
                                justify="center"
                                color="white"
                                fontSize="sm"
                                fontWeight="bold"
                              >
                                {client.name.substring(0, 2).toUpperCase()}
                              </Flex>
                            }
                          />
                        </Box>
                      </Box>
                    </Box>

                    {/* Client info - left aligned */}
                    <VStack align="flex-start" spacing={1} mb={3}>
                      <Heading size="md" color="white" fontWeight="600">
                        {client.name}
                      </Heading>
                      <Text fontSize="sm" color="rgba(255, 255, 255, 0.8)">
                        {client.description}
                      </Text>
                    </VStack>

                    {/* Last 12 Months - centered */}
                    <Box textAlign="center" mb={3}>
                      <Text fontSize="xs" color="rgba(255, 255, 255, 0.6)" fontWeight="medium">
                        Last 12 Months
                      </Text>
                    </Box>

                    {/* Divider */}
                    <Box w="100%" h="1px" bg="rgba(255, 255, 255, 0.2)" mb={3} />

                    {/* Metrics - horizontal layout */}
                    <HStack spacing={6} justify="center">
                      <VStack spacing={1}>
                        <Text fontSize="xs" color="rgba(255, 255, 255, 0.7)" fontWeight="medium" textTransform="uppercase">
                          Spend
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="white">
                          {client.metrics.spend}
                        </Text>
                      </VStack>

                      <Box w="1px" h="30px" bg="rgba(255, 255, 255, 0.2)" />

                      <VStack spacing={1}>
                        <Text fontSize="xs" color="rgba(255, 255, 255, 0.7)" fontWeight="medium" textTransform="uppercase">
                          ROAS
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="rgba(34, 197, 94, 1)">
                          {client.metrics.roas}
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              </GridItem>
            ))
            ) : (
              <GridItem colSpan={3}>
                <Box textAlign="center" py={12}>
                  <Text color="white" fontSize="lg" mb={2}>
                    No clients found
                  </Text>
                  <Text color="blue.200" fontSize="md">
                    Try searching for "{searchTerm}" or clear your search
                  </Text>
                </Box>
              </GridItem>
            )}
          </Grid>
        </Box>

        {/* Footer */}
        <Box textAlign="center" mt={16}>
          <Text fontSize="sm" color="blue.200" opacity={0.8}>
            {filteredClients.length === clients.length 
              ? "Select a client to view their performance dashboard"
              : `Showing ${filteredClients.length} of ${clients.length} clients`
            }
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage;