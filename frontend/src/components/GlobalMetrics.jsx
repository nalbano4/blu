import { Box, SimpleGrid, Text, VStack, HStack, Spinner, Alert, AlertIcon, Icon, Switch, FormControl, FormLabel } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

function GlobalMetrics({ period = 12 }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showYoY, setShowYoY] = useState(false) // Toggle state: false = P/P, true = YoY

  // Fetch data from backend
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:5000/api/media-performance/global-metrics?period=${period}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        console.error('Error fetching global metrics:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [period])

  // Format period-over-period change indicator
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
  
  const formatNumber = (num, type = 'number') => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A'
    
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(num)
      
      case 'currency-precise':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(num)
      
      case 'effectiveness':
        // Show effectiveness per thousand impressions for readability
        return `${(num * 1000).toFixed(2)}/K`
      
      case 'cpm':
        return `${num.toFixed(2)}`
      
      case 'percentage':
        return `${(num * 100).toFixed(1)}%`
      
      case 'decimal':
        return num.toFixed(2)
      
      case 'large':
        if (num >= 1000000) {
          return `${(num / 1000000).toFixed(1)}M`
        } else if (num >= 1000) {
          return `${(num / 1000).toFixed(0)}K`
        }
        return num.toLocaleString()
      
      default:
        return num.toLocaleString()
    }
  }

  // Prepare metrics array from API data
  const getMetrics = () => {
    if (!data?.summary) return []
    
    const { summary, insights, periodOverPeriod, yearOverYear } = data
    
    // Choose which comparison data to use based on toggle
    const comparisonData = showYoY ? yearOverYear : periodOverPeriod
    
    // Format date range for display
    const getDateRangeDescription = () => {
      if (!insights.dateRange) return `${insights.weeksIncluded} weeks`
      
      const startDate = new Date(insights.dateRange.start)
      const endDate = new Date(insights.dateRange.end)
      
      const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        })
      }
      
      return `${formatDate(startDate)} - ${formatDate(endDate)}`
    }
    
    return [
      { 
        label: 'ROAS', 
        value: formatNumber(summary.roas, 'currency-precise'),
        description: 'Return on Ad Spend',
        change: comparisonData?.changes?.roas,
        isPercentagePoints: false
      },
      { 
        label: 'Media Contribution', 
        value: formatNumber(
          summary['total-sales-period'] > 0 
            ? summary.sales / summary['total-sales-period'] 
            : 0, 
          'percentage'
        ),
        description: 'Media vs Total Sales',
        change: comparisonData?.changes?.mediaContributionPoints,
        isPercentagePoints: true
      },
      { 
        label: 'Media-Attributed Sales', 
        value: formatNumber(summary.sales, 'currency'),
        description: getDateRangeDescription(),
        change: comparisonData?.changes?.sales,
        isPercentagePoints: false
      },
      { 
        label: 'Total Impressions', 
        value: formatNumber(summary.impressions, 'large'),
        description: `Avg Effectiveness: ${formatNumber(summary.effectiveness, 'effectiveness')}`,
        change: comparisonData?.changes?.impressions,
        isPercentagePoints: false
      },
      { 
        label: 'Total Spend', 
        value: formatNumber(summary.spend, 'currency'),
        description: `Avg CPM: ${formatNumber(summary.cpm, 'currency-precise')}`,
        change: comparisonData?.changes?.spend,
        isPercentagePoints: false
      }
    ]
  }

  // Loading state
  if (loading) {
    return (
      <Box bg="bg-surface" p={4} rounded="xl" border="1px solid" borderColor="#374151" mb={4}>
        <Text color="text-primary" fontSize="lg" fontWeight="bold" mb={2}>
          Global Performance Overview
        </Text>
        <Box display="flex" justifyContent="center" alignItems="center" h="100px">
          <Spinner size="lg" color="blue.500" />
        </Box>
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box bg="bg-surface" p={4} rounded="xl" border="1px solid" borderColor="#374151" mb={4}>
        <Text color="text-primary" fontSize="lg" fontWeight="bold" mb={2}>
          Global Performance Overview
        </Text>
        <Alert status="error" bg="red.900" borderColor="red.600">
          <AlertIcon />
          <Text color="red.200">Failed to load metrics: {error}</Text>
        </Alert>
      </Box>
    )
  }

  const metrics = getMetrics()

  return (
    <Box bg="bg-surface" p={4} rounded="xl" border="1px solid" borderColor="#374151" mb={4}>
      <HStack justify="space-between" align="center" mb={2}>
        <HStack spacing={8} align="center">
          <Text color="text-primary" fontSize="lg" fontWeight="bold">
            Global Performance Overview
          </Text>
          
          {/* Toggle Switch for P/P vs YoY */}
          <FormControl display="flex" alignItems="center" w="auto">
            <FormLabel 
              htmlFor="comparison-toggle" 
              mb="0" 
              fontSize="sm" 
              color="text-muted"
              mr={2}
            >
              P/P
            </FormLabel>
            <Switch 
              id="comparison-toggle"
              size="sm"
              isChecked={showYoY}
              onChange={(e) => setShowYoY(e.target.checked)}
              colorScheme="blue"
            />
            <FormLabel 
              htmlFor="comparison-toggle" 
              mb="0" 
              fontSize="sm" 
              color="text-muted"
              ml={2}
            >
              YoY
            </FormLabel>
          </FormControl>
          
          {/* Comparison indicator */}
          <Text fontSize="xs" color="text-muted" fontStyle="italic">
            vs {showYoY ? 'same period last year' : 'previous period'}
          </Text>
        </HStack>
        
        <Text color="text-muted" fontSize="sm">
          {data?.period}
        </Text>
      </HStack>
      
      <SimpleGrid 
        columns={{ base: 2, sm: 3, md: 4, lg: 5 }} 
        spacing={2}
        overflowX="auto"
      >
        {metrics.map((metric, index) => (
          <Box
            key={index}
            bg="bg-card"
            p={3}
            rounded="lg"
            border="1px solid"
            borderColor="#4b5563"
            minW="0"
            flex="none"
            _hover={{
              borderColor: "#6b7280",
              transform: "translateY(-1px)",
              transition: "all 0.2s"
            }}
          >
            <VStack align="start" spacing={1}>
              <HStack w="full" justify="space-between" align="start">
                <Text 
                  fontSize="xs" 
                  color="text-muted" 
                  fontWeight="semibold" 
                  textTransform="uppercase"
                  mb={1}
                  display="block"
                  flex="1"
                >
                  {metric.label}
                </Text>
                {metric.change !== null && metric.change !== undefined && (
                  <Box>
                    {formatChange(metric.change, metric.isPercentagePoints)}
                  </Box>
                )}
              </HStack>
              <Text fontSize="lg" fontWeight="bold" color="text-primary" display="block">
                {metric.value}
              </Text>
              {metric.description && (
                <Text fontSize="xs" color="text-muted" display="block">
                  {metric.description}
                </Text>
              )}
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default GlobalMetrics