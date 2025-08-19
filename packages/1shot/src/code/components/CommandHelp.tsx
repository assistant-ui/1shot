import React from 'react'
import { Box, Text } from 'ink'

interface CommandHelpProps {
  isInteractive: boolean
}

export const CommandHelp: React.FC<CommandHelpProps> = ({ isInteractive }) => {
  return (
    <Box 
      paddingX={1}
      marginTop={1}
      justifyContent="center"
    >
      <Text color="gray">
        {isInteractive ? (
          <>Press <Text bold color="yellow">ESC</Text> to exit interactive mode</>
        ) : (
          <>Press <Text bold color="yellow">i</Text> to enter interactive mode</>
        )}
      </Text>
    </Box>
  )
}


