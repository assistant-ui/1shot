import React from 'react'
import { Box, Text } from 'ink'
import { useTerminalSize } from '../hooks/useTerminalSize'

interface ProgressBarProps {
  title: string
  subtitle?: string
  percentage: number
  showPercentage?: boolean
  toolCalls?: string[]
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  title, 
  subtitle,
  percentage, 
  showPercentage = true,
  toolCalls = []
}) => {
  const { columns } = useTerminalSize()
  const clampedPercentage = Math.min(100, Math.max(0, percentage))
  
  // Calculate bar width based on terminal width
  // Reserve space for: [ ] (2 chars) and some padding
  const availableWidth = Math.max(10, columns - 4)
  const barWidth = Math.min(availableWidth, 80) // Cap at 80 for very wide terminals
  
  // Ensure minimum bar width for very narrow terminals
  const actualBarWidth = Math.max(10, barWidth)
  
  const filledWidth = Math.floor((clampedPercentage / 100) * actualBarWidth)
  const emptyWidth = actualBarWidth - filledWidth

  const progressColor = clampedPercentage < 30 ? 'yellow' : clampedPercentage < 70 ? 'blue' : 'green'
  
  // Truncate title if needed to fit in terminal width
  const maxTitleLength = Math.max(20, columns - 12) // Reserve space for icon and percentage
  const displayTitle = title.length > maxTitleLength 
    ? title.substring(0, maxTitleLength - 3) + '...'
    : title
  
  return (
    <Box flexDirection="column" marginY={1}>
      {/* Title and Percentage */}
     
      
      {/* Progress Bar */}
      <Box marginTop={1} width="100%" justifyContent="center">
        <Text color={progressColor}>{'█'.repeat(filledWidth)}</Text>
        <Text color="gray">{'░'.repeat(emptyWidth)}</Text>
      </Box>
      
      {/* Tool Calls Display */}
      <Box marginTop={1} width="100%" justifyContent="center" flexDirection="column">
        {clampedPercentage === 100 ? (
          <Box justifyContent="center">
            <Text color="green">✓ Complete!</Text>
          </Box>
        ) : toolCalls.length > 0 ? (
          <Box justifyContent="center" flexDirection="column">
            <Box justifyContent="center">
              <Text dimColor italic>Recent tools:</Text>
            </Box>
            <Box justifyContent="center" marginTop={0}>
              <Text color="cyan">
                {toolCalls.map((tool, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && ' → '}
                    {tool}
                  </React.Fragment>
                ))}
              </Text>
            </Box>
          </Box>
        ) : (
          <Box justifyContent="center" flexDirection="column">
             <Box width="100%" justifyContent="space-between">
              <Box>
                <Text bold color="cyan">⚡ </Text>
                <Text bold color="white">{displayTitle}</Text>
              </Box>
            </Box>
            
            {/* Subtitle */}
            {subtitle && (
              <Box marginTop={0} marginLeft={3}>
                <Text color="gray">└ </Text>
                <Text dimColor italic>{subtitle}</Text>
              </Box>
            )}
      
            {showPercentage && (
              <Text bold color={progressColor}>{clampedPercentage.toString().padStart(3, ' ')}% {" "}</Text>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
