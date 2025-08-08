// components/DeepDive.jsx
import { Box, VStack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import DeepDiveHeader from './deepdive/DeepDiveHeader'
import DeepDiveTabs from './deepdive/DeepDiveTabs'
import DeepDiveContent from './deepdive/DeepDiveContent'

function DeepDive({ period, selectedPartner, selectedChannel }) {
  const [activeTab, setActiveTab] = useState('timeseries')
  
  const tabs = [
    { id: 'timeseries', label: 'Time Series Performance' },
    { id: 'audience', label: 'Audience Insights' },
    { id: 'tactics', label: 'Tactics & Placements' }
  ]

  // Show empty state when no partner is selected
  if (!selectedPartner) {
    return (
      <Box 
        bg="bg-surface" 
        p={6} 
        border="1px solid" 
        borderColor="border-main" 
        rounded="xl"
        h="full"
        w="full"
      >
        <VStack spacing={3} align="stretch">
          <Text color="text-primary" fontSize="lg" fontWeight="bold">
            Partner Deep Dive
          </Text>
          <Box pt={4}>
            <Text color="text-muted" fontSize="lg" fontWeight="medium" mb={2}>
              Select a partner to view detailed analytics
            </Text>
            <Text color="text-muted" fontSize="sm">
              Click on any partner from the left panel to see their deep dive analysis
            </Text>
          </Box>
        </VStack>
      </Box>
    )
  }

  return (
    <Box 
      bg="bg-surface" 
      p={6} 
      border="1px solid" 
      borderColor="border-main" 
      rounded="xl"
      h="full"
      w="full"
    >
      <VStack align="stretch" spacing={6}>
        <DeepDiveHeader 
          partnerName={selectedPartner.partner}
          ticker={selectedPartner.ticker}
          roas={selectedPartner.roas?.toFixed(2) || '0.00'}
        />
        
        <DeepDiveTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabs}
        />
        
        <DeepDiveContent 
          activeTab={activeTab} 
          selectedPartner={selectedPartner}
          period={period}
          selectedChannel={selectedChannel}
        />
      </VStack>
    </Box>
  )
}

export default DeepDive