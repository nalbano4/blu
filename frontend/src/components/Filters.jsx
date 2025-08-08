// components/Filters.jsx
import { Box, HStack, Select, Text, Spinner } from '@chakra-ui/react'
import { useState, useEffect } from 'react'

function Filters({ selectedPeriod, onPeriodChange, selectedChannel, onChannelChange }) {
  const [metadata, setMetadata] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(null)

  // Fetch filter options from backend
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/metadata')
        if (response.ok) {
          const data = await response.json()
          setMetadata(data)
        }
      } catch (error) {
        console.error('Error fetching metadata:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetadata()
  }, [])

  // Fetch date range when period changes
  useEffect(() => {
    const fetchDateRange = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/media-performance/global-metrics?period=${selectedPeriod}`)
        if (response.ok) {
          const data = await response.json()
          if (data.insights?.dateRange) {
            setDateRange(data.insights.dateRange)
          }
        }
      } catch (error) {
        console.error('Error fetching date range:', error)
      }
    }

    if (selectedPeriod) {
      fetchDateRange()
    }
  }, [selectedPeriod])

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange) return null
    
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      })
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const FilterSelector = ({ title, options, value, onChange, disabled = false }) => (
    <Box position="relative" minW="200px">
      <Text fontSize="xs" color="text-muted" mb={1} fontWeight="semibold">
        {title}
      </Text>
      <Select
        bg="bg-card"
        color="text-primary"
        border="1px solid"
        borderColor="border-main"
        size="sm"
        rounded="lg"
        value={value}
        onChange={onChange}
        disabled={disabled}
        _hover={{ 
          borderColor: 'gray.500',
          bg: 'gray.600'
        }}
        _focus={{ 
          borderColor: 'gray.500', 
          boxShadow: 'none',
          bg: 'gray.600'
        }}
        _disabled={{
          opacity: 0.6,
          cursor: 'not-allowed'
        }}
        sx={{
          '& option': {
            bg: 'bg-card',
            color: 'text-primary'
          }
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      
      {/* Loading spinner for Time Period only */}
      {loading && title === "Time Period" && (
        <Box 
          position="absolute" 
          right="8" 
          top="50%" 
          transform="translateY(-50%)" 
          pointerEvents="none"
        >
          <Spinner size="xs" color="text-muted" />
        </Box>
      )}
    </Box>
  )

  // Default options while loading
  const defaultPeriodOptions = [
    { value: 4, label: 'Last 4 weeks', description: 'Recent monthly performance' },
    { value: 12, label: 'Last 12 weeks', description: 'Quarterly view' },
    { value: 24, label: 'Last 24 weeks', description: 'Semi-annual analysis' },
    { value: 36, label: 'Last 36 weeks', description: 'Full year perspective' }
  ]

  const defaultChannelOptions = [
    { value: 'all', label: 'All Channels' }
  ]

  // Get period options from metadata or use defaults
  const periodOptions = metadata?.periodOptions || defaultPeriodOptions

  // Get channel options from metadata
  const channelOptions = metadata ? [
    { value: 'all', label: 'All Channels' },
    ...metadata.channels.map(channel => ({ 
      value: channel, 
      label: channel 
    }))
  ] : defaultChannelOptions

  const handlePeriodChange = (e) => {
    const newPeriod = parseInt(e.target.value)
    onPeriodChange(newPeriod)
  }

  const handleChannelChange = (e) => {
    const newChannel = e.target.value
    onChannelChange?.(newChannel)
  }

  return (
    <Box bg="bg-surface" p={4} rounded="xl" border="1px solid" borderColor="#374151" mb={4}>
      <HStack spacing={6} align="end" wrap="wrap">
        <FilterSelector
          title="Time Period"
          options={periodOptions}
          value={selectedPeriod}
          onChange={handlePeriodChange}
          disabled={loading}
        />
        <FilterSelector
          title="Channel Filter"
          options={channelOptions}
          value={selectedChannel || 'all'}
          onChange={handleChannelChange}
          disabled={loading}
        />
        
        {/* Show selected period info */}
        {metadata && selectedPeriod && (
          <Box ml={4}>
            <Text fontSize="xs" color="text-muted" mb={1}>
              Selected Period
            </Text>
            <Text fontSize="sm" color="text-primary" fontWeight="medium">
              {periodOptions.find(p => p.value === selectedPeriod)?.description || `${selectedPeriod} weeks`}
            </Text>
          </Box>
        )}

        {/* Show selected data range */}
        {dateRange && (
          <Box ml={4}>
            <Text fontSize="xs" color="text-muted" mb={1}>
              Selected Data Range
            </Text>
            <Text fontSize="sm" color="text-primary" fontWeight="medium">
              {formatDateRange()}
            </Text>
          </Box>
        )}

        {/* Show data range info */}
        {metadata?.dateRange && (
          <Box ml={4}>
            <Text fontSize="xs" color="text-muted" mb={1}>
              Data Available
            </Text>
            <Text fontSize="sm" color="text-primary">
              {metadata.dateRange.totalWeeks} weeks total
            </Text>
          </Box>
        )}
      </HStack>
    </Box>
  )
}

export default Filters