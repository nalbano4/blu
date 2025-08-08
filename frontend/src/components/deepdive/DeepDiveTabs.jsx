// components/deepdive/DeepDiveTabs.jsx
import { Box, HStack, Button } from '@chakra-ui/react'

function DeepDiveTabs({ activeTab, onTabChange, tabs }) {
  return (
    <Box borderBottom="1px solid" borderColor="border-main">
      <HStack spacing={0}>
        {tabs.map((tab, index) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            color={activeTab === tab.id ? "blue.400" : "text-muted"}
            fontWeight="semibold"
            fontSize="sm"
            px={index === 0 ? 0 : 4}
            py={2}
            ml={index === 0 ? 0 : 6}
            rounded="none"
            borderBottom="2px solid"
            borderColor={activeTab === tab.id ? "blue.400" : "transparent"}
            _hover={{ 
              bg: 'transparent', 
              color: activeTab === tab.id ? 'blue.300' : 'text-secondary',
              borderColor: activeTab === tab.id ? 'blue.300' : 'border-main'
            }}
            _active={{ bg: 'transparent' }}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </HStack>
    </Box>
  )
}

export default DeepDiveTabs