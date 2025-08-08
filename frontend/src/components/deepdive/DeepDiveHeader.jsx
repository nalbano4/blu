// components/deepdive/DeepDiveHeader.jsx
import { Box, Text, HStack } from '@chakra-ui/react'

function DeepDiveHeader({ partnerName, ticker, roas }) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
      {/* Left side title */}
      <Text color="text-primary" fontSize="lg" fontWeight="bold">
        Partner Deep Dive
      </Text>
      
      {/* Right side partner info */}
      <Box textAlign="right">
        <Text color="text-primary" fontSize="2xl" fontWeight="bold" lineHeight="1.2">
          {partnerName}
        </Text>
        <HStack spacing={4} mt={2} align="baseline" justify="flex-start">
          <Text color="text-muted" fontSize="sm" fontWeight="medium">{ticker}</Text>
          <Text color="text-primary" fontSize="2xl" fontWeight="bold">
            ${roas}
          </Text>
        </HStack>
      </Box>
    </Box>
  )
}

export default DeepDiveHeader