import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface ProgressContextType {
  title: string
  subtitle?: string
  percentage: number
  hasBeenShown: boolean
  toolCalls: string[]
  setProgress: (title: string, percentage: number) => void
  setSubtitle: (subtitle?: string) => void
  addToolCall: (toolName: string) => void
  clearToolCalls: () => void
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export const useProgress = () => {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}

interface ProgressProviderProps {
  children: ReactNode
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [title, setTitle] = useState('Ready to start...')
  const [subtitle, setSubtitleState] = useState<string | undefined>()
  const [percentage, setPercentage] = useState(0)
  const [hasBeenShown, setHasBeenShown] = useState(false)
  const [toolCalls, setToolCalls] = useState<string[]>([])

  const setProgress = useCallback((newTitle: string, newPercentage: number) => {
    setTitle(newTitle)
    const clampedPercentage = Math.min(100, Math.max(0, newPercentage))
    setPercentage(clampedPercentage)
    setHasBeenShown(true)
  }, [])

  const setSubtitle = useCallback((newSubtitle?: string) => {
    setSubtitleState(newSubtitle)
  }, [])

  const addToolCall = useCallback((toolName: string) => {
    setToolCalls(prev => {
      // Keep only the last 3 tool calls to avoid clutter
      const newCalls = [...prev, toolName].slice(-3)
      return newCalls
    })
  }, [])

  const clearToolCalls = useCallback(() => {
    setToolCalls([])
  }, [])

  const value: ProgressContextType = {
    title,
    percentage,
    hasBeenShown,
    toolCalls,
    setProgress,
    setSubtitle,
    addToolCall,
    clearToolCalls,
    ...(subtitle !== undefined ? { subtitle } : {})
  }

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}
