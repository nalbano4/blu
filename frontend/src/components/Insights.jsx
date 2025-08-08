// components/Insights.jsx
import { Box, Text, VStack, HStack, Icon } from '@chakra-ui/react'
import { RefreshCcw } from 'lucide-react'

function Insights() {
  const insights = [
    "Google, as media investment partner, delivers solid 15.5% return on investment.",
    "Facebook's media investment performance currently registers an 8.23% ROI.", 
    "The Trade Desk posts respective 17% ROI amid market shifts.",
    "Snapchat yields 5.67% ROI as a media investment partner.",
    "TikTok Posts Solid 15.8% ROI, Signaling Strong Performance.",
    "Pinterest delivers 3.42% ROI as a media investment partner.",
    "Amazon Ads Reports Strong 9.87% Return on Investment",
    "Microsoft Ads demonstrates a solid current ROI of 4.2%."
  ]

  return (
    <Box 
      bg="bg-surface" 
      p={4} 
      border="1px solid" 
      borderColor="#374151" 
      rounded="xl"  // Add this line
      h="full"
      w="full"
      overflowY="auto"
    >
      <HStack justify="space-between" align="center" mb={4}>
        <Text color="text-primary" fontSize="lg" fontWeight="bold">
          Performance Headlines
        </Text>
        <Icon 
          as={RefreshCcw} 
          w={4} 
          h={4} 
          color="text-muted" 
          cursor="pointer"
          _hover={{ color: 'text-secondary' }}
        />
      </HStack>

      <VStack spacing={4} align="stretch">
        {insights.map((insight, index) => (
          <Box 
            key={index} 
            p={3} 
            bg="bg-card" 
            rounded="lg" 
            border="1px solid" 
            borderColor="#4b5563"
            _hover={{ bg: '#4b5563' }}
            cursor="pointer"
            transition="background-color 0.2s"
          >
            <Text 
              color="text-primary" 
              fontSize="sm" 
              fontWeight="semibold"
              mb={1}
            >
              {insight}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  )
}

export default Insights