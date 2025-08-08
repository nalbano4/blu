// components/PartnersSummary.jsx
import { 
  Box, Text, VStack, HStack, Flex, Icon, 
  Switch, Spinner, Alert, AlertIcon 
} from '@chakra-ui/react'
import { Search, Sliders, Menu, ArrowUp, ArrowDown } from 'lucide-react'
import { useState, useEffect } from 'react'

function PartnersSummary({ selectedPeriod = 12, selectedChannel, selectedPartner, onPartnerSelect }) {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [comparisonMode, setComparisonMode] = useState('pop') // 'pop' or 'yoy'

  useEffect(() => {
    fetchPartners()
  }, [selectedPeriod, comparisonMode])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      console.log('Fetching partners for period:', selectedPeriod, 'comparison:', comparisonMode)
      
      const response = await fetch(
        `http://localhost:5000/api/media-performance/partners?period=${selectedPeriod}&comparison=${comparisonMode}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch partners data`)
      }
      
      const result = await response.json()
      console.log('Backend response:', result)
      
      // Your backend returns: { period: "...", totalPartners: X, data: [...] }
      const partnersData = result.data || []
      
      // Transform backend data to component format
      const transformedPartners = partnersData.map(partner => ({
        partner: partner.partner,
        ticker: partner.ticker, // Now comes from backend
        spend: partner.spend || 0,
        sales: partner.sales || 0,
        impressions: partner.impressions || 0,
        clicks: partner.clicks || 0,
        roas: partner.roas || 0,
        ctr: partner.ctr || 0,
        cpm: partner.cpm || 0, // Add CPM from backend
        effectiveness: partner.effectiveness || 0, // Add effectiveness from backend
        campaign_count: partner.uniqueCampaigns || 0,
        // Backend now calculates contribution
        contribution: partner.contribution || 0,
        // Add comparison data for ROAS change (will come from enhanced backend)
        roasChange: partner.comparison?.roas_change || (Math.random() * 20 - 10) // Placeholder for now - percentage change
      }))
      
      setPartners(transformedPartners)
      setError(null)
      
    } catch (err) {
      console.error('Error fetching partners:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'N/A'
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    } else {
      return `$${value.toFixed(0)}`
    }
  }

  const formatPercentage = (value) => {
    if (!value && value !== 0) return 'N/A'
    return `${value.toFixed(1)}%`
  }

  const formatChange = (value, isPercentagePoints = false) => {
    if (value === null || value === undefined || isNaN(value)) return null
    
    const isPositive = value >= 0
    const color = isPositive ? 'green.400' : 'red.400'
    const IconComponent = isPositive ? ArrowUp : ArrowDown
    
    // For percentage points, show different formatting
    const displayValue = isPercentagePoints 
      ? `${Math.abs(value).toFixed(1)}pts`  // e.g., "2.1pts"
      : `${Math.abs(value).toFixed(1)}%`     // e.g., "34.8%"
    
    return (
      <HStack spacing={1} justify="flex-end">
        <Icon as={IconComponent} w={3} h={3} color={color} />
        <Text fontSize="xs" color={color} fontWeight="medium">
          {displayValue}
        </Text>
      </HStack>
    )
  }

  const handlePartnerClick = (partner) => {
    const newSelection = selectedPartner?.partner === partner.partner ? null : partner
    onPartnerSelect(newSelection)
  }

  const getComparisonLabel = () => {
    return comparisonMode === 'pop' ? 'vs previous period' : 'vs same period last year'
  }

  if (loading) {
    return (
      <Box 
        bg="bg-surface" 
        p={4} 
        border="1px solid" 
        borderColor="border-main" 
        rounded="xl"
        h="full"
        w="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="lg" color="blue.400" />
          <Text color="text-muted" fontSize="sm">Loading partners...</Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box 
        bg="bg-surface" 
        p={4} 
        border="1px solid" 
        borderColor="border-main" 
        rounded="xl"
        h="full"
        w="full"
      >
        <Alert status="error" bg="red.900" border="1px solid" borderColor="red.700">
          <AlertIcon color="red.400" />
          <Text color="red.200" fontSize="sm">
            Error loading partners: {error}
          </Text>
        </Alert>
      </Box>
    )
  }

  return (
    <Box 
      bg="bg-surface" 
      p={4} 
      border="1px solid" 
      borderColor="border-main" 
      rounded="xl"
      h="full" 
      overflowY="auto"
      w="full"
    >
      {/* Header with comparison toggle */}
      <Flex justify="space-between" align="center" mb={4}>
        <VStack align="start" spacing={1}>
          <Text color="text-primary" fontSize="lg" fontWeight="bold">
            Media Partners
          </Text>
          <Text color="text-muted" fontSize="xs">
            {getComparisonLabel()}
          </Text>
        </VStack>
        <HStack spacing={3}>
          {/* Comparison Mode Toggle */}
          <HStack spacing={2}>
            <Text fontSize="xs" color="text-muted">P/P</Text>
            <Switch
              size="sm"
              colorScheme="blue"
              isChecked={comparisonMode === 'yoy'}
              onChange={(e) => setComparisonMode(e.target.checked ? 'yoy' : 'pop')}
            />
            <Text fontSize="xs" color="text-muted">YoY</Text>
          </HStack>
          
          {/* Action Icons */}
          <HStack spacing={2} color="text-muted">
            <Icon 
              as={Search} 
              w={4} 
              h={4} 
              cursor="pointer" 
              _hover={{ color: 'text-secondary' }}
              transition="color 0.2s"
            />
            <Icon 
              as={Sliders} 
              w={4} 
              h={4} 
              cursor="pointer" 
              _hover={{ color: 'text-secondary' }}
              transition="color 0.2s"
            />
            <Icon 
              as={Menu} 
              w={4} 
              h={4} 
              cursor="pointer" 
              _hover={{ color: 'text-secondary' }}
              transition="color 0.2s"
            />
          </HStack>
        </HStack>
      </Flex>

      <VStack spacing={2} align="stretch">
        {partners.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Text color="text-muted" fontSize="sm">
              No partners data available for the selected period
            </Text>
          </Box>
        ) : (
          partners.map((partner, index) => {
            const isSelected = selectedPartner?.partner === partner.partner

            return (
              <Box
                key={partner.partner}
                p={3}
                bg={isSelected ? 'blue.600' : 'bg-card'}
                _hover={!isSelected ? { bg: 'gray.600' } : { bg: 'blue.500' }}
                cursor="pointer"
                rounded="lg"
                transition="all 0.2s"
                border={isSelected ? '1px solid' : 'none'}
                borderColor={isSelected ? 'blue.400' : 'transparent'}
                onClick={() => handlePartnerClick(partner)}
              >
                <Flex align="center">
                  <Box flex="1">
                    <Text 
                      color={isSelected ? 'white' : 'text-primary'} 
                      fontWeight="bold"
                      fontSize="sm"
                      lineHeight="1.2"
                    >
                      {partner.ticker}
                    </Text>
                    <Text 
                      color={isSelected ? 'blue.100' : 'text-muted'} 
                      fontSize="xs"
                      lineHeight="1.2"
                      mt={0.5}
                    >
                      {partner.partner}
                    </Text>
                  </Box>
                  <Box textAlign="right" minW="80px">
                    <Text 
                      color={isSelected ? 'white' : 'text-primary'} 
                      fontWeight="bold"
                      fontSize="sm"
                      lineHeight="1.2"
                    >
                      ${partner.roas ? partner.roas.toFixed(2) : '0.00'}
                    </Text>
                    <Box mt={0.5}>
                      {formatChange(partner.roasChange, false)}
                    </Box>
                  </Box>
                </Flex>

                {/* Expanded details when selected */}
                {isSelected && (
                  <Box mt={3} pt={3} borderTop="1px solid" borderColor="blue.400">
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="blue.100">Total Spend:</Text>
                        <Text fontSize="xs" color="white" fontWeight="medium">
                          {formatCurrency(partner.spend)}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="blue.100">Media Contributed Sales:</Text>
                        <Text fontSize="xs" color="white" fontWeight="medium">
                          {formatCurrency(partner.sales)}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="blue.100">Total Impressions:</Text>
                        <Text fontSize="xs" color="white" fontWeight="medium">
                          {partner.impressions.toLocaleString()}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="blue.100">CPM:</Text>
                        <Text fontSize="xs" color="white" fontWeight="medium">
                          ${partner.cpm ? partner.cpm.toFixed(2) : '0.00'}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="blue.100">Effectiveness:</Text>
                        <Text fontSize="xs" color="white" fontWeight="medium">
                          ${partner.effectiveness ? (partner.effectiveness * 1000).toFixed(2) : '0.00'}/K
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="blue.100">Media Contribution:</Text>
                        <Text fontSize="xs" color="white" fontWeight="medium">
                          {formatPercentage(partner.contribution)}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="blue.100">Campaigns:</Text>
                        <Text fontSize="xs" color="white" fontWeight="medium">
                          {partner.campaign_count || 0}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                )}
              </Box>
            )
          })
        )}
      </VStack>

      {/* Summary footer */}
      {partners.length > 0 && (
        <Box mt={4} pt={3} borderTop="1px solid" borderColor="border-main">
          <Text fontSize="xs" color="text-muted" textAlign="center">
            {partners.length} active partners • Last {selectedPeriod} weeks
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default PartnersSummary