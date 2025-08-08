// Metric options for secondary axis// components/deepdive/DeepDiveContent.jsx
import { Box, Text, VStack, HStack, Grid, Spinner, Alert, AlertIcon, Select, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react'
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useState, useEffect } from 'react'

function DeepDiveContent({ activeTab, selectedPartner, period, selectedChannel }) {
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [secondaryMetric, setSecondaryMetric] = useState('none')
  const [sortConfig, setSortConfig] = useState({ key: 'rawDate', direction: 'asc' })

  // Sorting functionality
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortedData = () => {
    const sortableData = [...trendData]
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]
        
        // Handle date sorting
        if (sortConfig.key === 'rawDate') {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        }
        
        if (sortConfig.direction === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })
    }
    return sortableData
  }

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return ''
    }
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }
  const metricOptions = [
    { value: 'none', label: 'None', format: () => '' },
    { value: 'spend', label: 'Spend', format: (val) => `${(val / 1000).toFixed(0)}K` },
    { value: 'impressions', label: 'Impressions', format: (val) => `${(val / 1000000).toFixed(1)}M` },
    { value: 'cpm', label: 'CPM', format: (val) => `${val.toFixed(2)}` },
    { value: 'effectiveness', label: 'Effectiveness', format: (val) => `${(val * 1000).toFixed(2)}` }
  ]

  // Fetch trend data when we need it
  useEffect(() => {
    if (activeTab === 'timeseries' && selectedPartner?.partner) {
      fetchTrendData()
    }
  }, [activeTab, selectedPartner?.partner, period])

  const fetchTrendData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(
        `http://localhost:5000/api/media-performance/trends?period=${period}&groupBy=partner`
      )
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trend data: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Filter for selected partner and process for chart
      const partnerData = result.data
        .filter(row => row.partner === selectedPartner.partner)
        .map(row => {
          const date = new Date(row['week-date'])
          return {
            weekDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            weekLabel: `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            roas: parseFloat((row.roas || 0).toFixed(2)),
            spend: row.spend || 0,
            sales: row.sales || 0,
            impressions: row.impressions || 0,
            cpm: parseFloat((row.cpm || 0).toFixed(2)),
            effectiveness: parseFloat((row.effectiveness || 0).toFixed(4)),
            rawDate: row['week-date']
          }
        })
        .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate))
      
      setTrendData(partnerData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Custom tooltip for dual metrics
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const selectedMetricOption = metricOptions.find(m => m.value === secondaryMetric)
      
      return (
        <Box bg="bg-surface" p={3} border="1px solid" borderColor="border-main" rounded="md" shadow="lg">
          <Text color="text-primary" fontSize="sm" fontWeight="medium" mb={2}>
            {data.weekLabel}
          </Text>
          <VStack spacing={1} align="start">
            <Text color="blue.400" fontSize="sm" fontWeight="bold">
              ROAS: ${data.roas.toFixed(2)}
            </Text>
            {secondaryMetric !== 'none' && (
              <Text color="green.400" fontSize="sm" fontWeight="bold">
                {selectedMetricOption.label}: {selectedMetricOption.format(data[secondaryMetric])}
              </Text>
            )}
          </VStack>
        </Box>
      )
    }
    return null
  }

  const renderTimeSeriesPerformance = () => {
    if (!selectedPartner) {
      return (
        <Box>
          <Text color="text-muted" fontSize="sm">
            Select a partner to view time series data
          </Text>
        </Box>
      )
    }

    const selectedMetricOption = metricOptions.find(m => m.value === secondaryMetric)

    return (
      <Box>
        <HStack justify="space-between" align="center" mb={4}>
          <Text color="text-primary" fontSize="lg" fontWeight="bold">
            ROAS Performance Over Time
          </Text>
          <HStack spacing={2}>
            <Text color="text-muted" fontSize="sm">Secondary Metric:</Text>
            <Select
              value={secondaryMetric}
              onChange={(e) => setSecondaryMetric(e.target.value)}
              size="sm"
              w="140px"
              bg="bg-card"
              borderColor="border-main"
              color="text-primary"
            >
              {metricOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </HStack>
        </HStack>
        
        <Text color="text-muted" fontSize="sm" mb={6}>
          {secondaryMetric === 'none' 
            ? ` Last ${period} weeks`
            : `ROAS vs ${selectedMetricOption.label} trends for ${selectedPartner.partner} over the last ${period} weeks`
          }
        </Text>
        
        {loading && (
          <Box display="flex" justifyContent="center" p={8}>
            <Spinner size="lg" color="blue.400" />
          </Box>
        )}

        {error && (
          <Alert status="error" bg="red.900" border="1px solid" borderColor="red.700" mb={4}>
            <AlertIcon color="red.400" />
            <Text color="red.200" fontSize="sm">
              {error}
            </Text>
          </Alert>
        )}
        
        {!loading && !error && trendData.length > 0 && (
          <VStack spacing={6} align="stretch">
            {/* Dual Axis Chart */}
            <Box h="300px" w="full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
                  <XAxis 
                    dataKey="weekDate" 
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#4B5563', strokeWidth: 1 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  {/* Left Y-Axis for ROAS */}
                  <YAxis 
                    yAxisId="left"
                    stroke="#60A5FA"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#4B5563', strokeWidth: 1 }}
                    tickFormatter={(value) => "$" + value.toFixed(0)}
                  />
                  {/* Right Y-Axis for Secondary Metric */}
                  {secondaryMetric !== 'none' && (
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#A855F7"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#4B5563', strokeWidth: 1 }}
                      tickFormatter={selectedMetricOption.format}
                    />
                  )}
                  <Tooltip content={<CustomTooltip />} />
                  {/* ROAS Area Chart */}
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="roas" 
                    stroke="#60A5FA" 
                    strokeWidth={2}
                    fill="#60A5FA"
                    fillOpacity={0.2}
                    dot={false}
                  />
                  {/* Secondary Metric Line */}
                  {secondaryMetric !== 'none' && (
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey={secondaryMetric}
                      stroke="#A855F7" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, stroke: '#A855F7', strokeWidth: 2, fill: '#7C3AED' }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </Box>

            {/* Metric Legend */}
            {secondaryMetric !== 'none' ? (
              <HStack spacing={6} justify="center">
                <HStack spacing={2}>
                  <Box w={4} h={4} bg="blue.400" opacity={0.6} rounded="sm" />
                  <Text color="text-muted" fontSize="sm">ROAS (Left Axis)</Text>
                </HStack>
                <HStack spacing={2}>
                  <Box w={4} h={4} bg="purple.400" rounded="sm" />
                  <Text color="text-muted" fontSize="sm">{selectedMetricOption.label} (Right Axis)</Text>
                </HStack>
              </HStack>
            ) : (
              <HStack spacing={6} justify="center">
                <HStack spacing={2}>
                  <Box w={4} h={4} bg="blue.400" opacity={0.6} rounded="sm" />
                  <Text color="text-muted" fontSize="sm">ROAS</Text>
                </HStack>
              </HStack>
            )}

            {/* Summary Cards */}
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <Box p={3} bg="bg-card" rounded="md">
                <Text color="text-muted" fontSize="xs" mb={1}>Period ROAS</Text>
                <Text color="text-primary" fontSize="lg" fontWeight="bold">
                  ${selectedPartner.roas?.toFixed(2) || '0.00'}
                </Text>
              </Box>
              <Box p={3} bg="bg-card" rounded="md">
                <Text color="text-muted" fontSize="xs" mb={1}>Peak ROAS</Text>
                <Text color="text-primary" fontSize="lg" fontWeight="bold">
                  ${Math.max(...trendData.map(d => d.roas)).toFixed(2)}
                </Text>
              </Box>
            </Grid>

            {/* Weekly Performance Table */}
            <Box>
              <Text color="text-primary" fontSize="md" fontWeight="bold" mb={3}>
                Weekly Performance Details
              </Text>
              <Box overflowX="auto" bg="bg-card" rounded="md" border="1px solid" borderColor="border-main">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th 
                        color="text-muted" 
                        fontSize="xs" 
                        fontWeight="medium" 
                        borderColor="border-main"
                        cursor="pointer"
                        _hover={{ color: "text-primary" }}
                        onClick={() => handleSort('rawDate')}
                      >
                        Week Date {getSortIcon('rawDate')}
                      </Th>
                      <Th 
                        color="text-muted" 
                        fontSize="xs" 
                        fontWeight="medium" 
                        borderColor="border-main" 
                        isNumeric
                        cursor="pointer"
                        _hover={{ color: "text-primary" }}
                        onClick={() => handleSort('roas')}
                      >
                        ROAS {getSortIcon('roas')}
                      </Th>
                      <Th 
                        color="text-muted" 
                        fontSize="xs" 
                        fontWeight="medium" 
                        borderColor="border-main" 
                        isNumeric
                        cursor="pointer"
                        _hover={{ color: "text-primary" }}
                        onClick={() => handleSort('spend')}
                      >
                        Spend {getSortIcon('spend')}
                      </Th>
                      <Th 
                        color="text-muted" 
                        fontSize="xs" 
                        fontWeight="medium" 
                        borderColor="border-main" 
                        isNumeric
                        cursor="pointer"
                        _hover={{ color: "text-primary" }}
                        onClick={() => handleSort('impressions')}
                      >
                        Impressions {getSortIcon('impressions')}
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {getSortedData().map((week, index) => {
                        const periodRoas = selectedPartner.roas || 0
                        const weekRoas = week.roas
                        const roasColor = weekRoas > periodRoas ? "green.300" : weekRoas < periodRoas ? "red.300" : "text-primary"
                        
                        return (
                          <Tr key={week.rawDate} _hover={{ bg: "gray.700" }}>
                            <Td color="text-primary" fontSize="sm" borderColor="border-main">
                              {week.weekDate}
                            </Td>
                            <Td color={roasColor} fontSize="sm" fontWeight="medium" borderColor="border-main" isNumeric>
                              ${week.roas.toFixed(2)}
                            </Td>
                            <Td color="text-primary" fontSize="sm" borderColor="border-main" isNumeric>
                              ${week.spend >= 1000000 
                                ? `${(week.spend / 1000000).toFixed(1)}M` 
                                : `${(week.spend / 1000).toFixed(0)}K`}
                            </Td>
                            <Td color="text-primary" fontSize="sm" borderColor="border-main" isNumeric>
                              {week.impressions >= 1000000 
                                ? `${(week.impressions / 1000000).toFixed(1)}M` 
                                : `${(week.impressions / 1000).toFixed(0)}K`}
                            </Td>
                          </Tr>
                        )
                      })
                    }
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </VStack>
        )}

        {!loading && !error && trendData.length === 0 && (
          <Box textAlign="center" py={8}>
            <Text color="text-muted" fontSize="sm">
              No trend data found for {selectedPartner.partner} in the last {period} weeks
            </Text>
          </Box>
        )}
      </Box>
    )
  }

  const renderAudienceInsights = () => (
    <Box>
      <Text color="text-primary" fontSize="lg" fontWeight="bold" mb={4}>
        Audience Insights
      </Text>
      <Text color="text-muted" fontSize="sm">
        Audience insights content will be implemented with real backend data
      </Text>
    </Box>
  )

  const renderTacticsAndPlacements = () => (
    <Box>
      <Text color="text-primary" fontSize="lg" fontWeight="bold" mb={4}>
        Tactics & Placements Analysis  
      </Text>
      <Text color="text-muted" fontSize="sm">
        Tactics and placements content will be implemented with real backend data
      </Text>
    </Box>
  )

  // Content router
  switch(activeTab) {
    case 'timeseries':
      return renderTimeSeriesPerformance()
    case 'audience':
      return renderAudienceInsights()
    case 'tactics':
      return renderTacticsAndPlacements()
    default:
      return renderTimeSeriesPerformance()
  }
}

export default DeepDiveContent