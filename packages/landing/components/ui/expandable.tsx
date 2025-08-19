"use client"

import React, { useState, useContext, createContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ExpandableContextType {
  isExpanded: boolean
  toggle: () => void
  setExpanded: (expanded: boolean) => void
}

const ExpandableContext = createContext<ExpandableContextType | undefined>(undefined)

interface ExpandableProps {
  children: React.ReactNode | ((props: { isExpanded: boolean }) => React.ReactNode)
  expanded?: boolean
  onToggle?: (expanded: boolean) => void
  expandDirection?: "vertical" | "horizontal" | "both"
  expandBehavior?: "push" | "replace"
  initialDelay?: number
  onExpandStart?: () => void
  onExpandEnd?: () => void
}

export function Expandable({
  children,
  expanded,
  onToggle,
  onExpandStart,
  onExpandEnd,
}: ExpandableProps) {
  const [internalExpanded, setInternalExpanded] = useState(false)
  
  const isControlled = expanded !== undefined
  const isExpanded = isControlled ? expanded : internalExpanded
  
  const toggle = () => {
    const newExpanded = !isExpanded
    if (newExpanded && onExpandStart) onExpandStart()
    
    if (isControlled) {
      onToggle?.(newExpanded)
    } else {
      setInternalExpanded(newExpanded)
    }
    
    if (newExpanded && onExpandEnd) {
      setTimeout(onExpandEnd, 300)
    }
  }
  
  const setExpanded = (expanded: boolean) => {
    if (isControlled) {
      onToggle?.(expanded)
    } else {
      setInternalExpanded(expanded)
    }
  }
  
  const contextValue = {
    isExpanded,
    toggle,
    setExpanded
  }
  
  return (
    <ExpandableContext.Provider value={contextValue}>
      {typeof children === 'function' ? children({ isExpanded }) : children}
    </ExpandableContext.Provider>
  )
}

interface ExpandableCardProps {
  children: React.ReactNode
  className?: string
  collapsedSize?: { width: number; height: number }
  expandedSize?: { width: number; height: number }
  hoverToExpand?: boolean
  expandDelay?: number
  collapseDelay?: number
}

export function ExpandableCard({
  children,
  className,
  collapsedSize = { width: 300, height: 200 },
  expandedSize = { width: 400, height: 400 },
  expandDelay = 0,
  collapseDelay = 0,
}: ExpandableCardProps) {
  const context = useContext(ExpandableContext)
  if (!context) throw new Error("ExpandableCard must be used within Expandable")
  
  const { isExpanded } = context
  
  return (
    <motion.div
      className={cn(
        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm overflow-hidden",
        className
      )}
      animate={{
        width: isExpanded ? expandedSize.width : collapsedSize.width,
        height: isExpanded ? expandedSize.height : collapsedSize.height,
      }}
      transition={{ 
        duration: isExpanded ? expandDelay / 1000 : collapseDelay / 1000,
        ease: "easeInOut" 
      }}
    >
      {children}
    </motion.div>
  )
}

export function ExpandableTrigger({ children }: { children: React.ReactNode }) {
  const context = useContext(ExpandableContext)
  if (!context) throw new Error("ExpandableTrigger must be used within Expandable")
  
  return (
    <div onClick={context.toggle} className="cursor-pointer">
      {children}
    </div>
  )
}

export function ExpandableCardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("p-4 border-b border-zinc-200 dark:border-zinc-700", className)}>
      {children}
    </div>
  )
}

export function ExpandableCardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("p-4 flex-1", className)}>
      {children}
    </div>
  )
}

export function ExpandableCardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("p-4 border-t border-zinc-200 dark:border-zinc-700 mt-auto", className)}>
      {children}
    </div>
  )
}

interface ExpandableContentProps {
  children: React.ReactNode
  preset?: "fade" | "slide-up" | "slide-down" | "blur-sm" | "blur-md"
  stagger?: boolean
  staggerChildren?: number
  keepMounted?: boolean
  animateIn?: {
    initial: Record<string, number | string>
    animate: Record<string, number | string>
    exit?: Record<string, number | string>
    transition?: Record<string, number | string>
  }
}

export function ExpandableContent({
  children,
  preset = "fade",
  stagger = false,
  staggerChildren = 0.1,
  keepMounted = false,
  animateIn,
}: ExpandableContentProps) {
  const context = useContext(ExpandableContext)
  if (!context) throw new Error("ExpandableContent must be used within Expandable")
  
  const { isExpanded } = context
  
  const presetAnimations = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: {},
    },
    "slide-up": {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
      transition: {},
    },
    "slide-down": {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: {},
    },
    "blur-sm": {
      initial: { opacity: 0, filter: "blur(4px)" },
      animate: { opacity: 1, filter: "blur(0px)" },
      exit: { opacity: 0, filter: "blur(4px)" },
      transition: {},
    },
    "blur-md": {
      initial: { opacity: 0, filter: "blur(8px)" },
      animate: { opacity: 1, filter: "blur(0px)" },
      exit: { opacity: 0, filter: "blur(8px)" },
      transition: {},
    },
  }
  
  const animation = animateIn || presetAnimations[preset]
  
  if (keepMounted) {
    return (
      <motion.div
        initial={animation.initial}
        animate={isExpanded ? animation.animate : animation.initial}
        transition={{
          duration: 0.3,
          staggerChildren: stagger ? staggerChildren : 0,
          ...(animation.transition || {}),
        }}
      >
        {children}
      </motion.div>
    )
  }
  
  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={animation.initial}
          animate={animation.animate}
          exit={animation.exit}
          transition={{
            duration: 0.3,
            staggerChildren: stagger ? staggerChildren : 0,
            ...(animation.transition || {}),
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}