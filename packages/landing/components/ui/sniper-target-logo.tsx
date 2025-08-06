'use client'

import { motion } from 'framer-motion'
import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SniperTargetLogoProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
  animated?: boolean
  color?: string
}

export const SniperTargetLogo = forwardRef<HTMLDivElement, SniperTargetLogoProps>(
  ({ className, size = 40, animated = true, color = 'currentColor', ...props }, ref) => {
    const animationVariants = {
      initial: { 
        scale: 1,
        rotate: 0
      },
      animate: { 
        scale: [1, 1.05, 1],
        rotate: [0, 180, 360]
      },
      hover: {
        scale: 1.1,
        rotate: 15
      }
    }

    const crosshairVariants = {
      initial: { 
        opacity: 0.7,
        scale: 1
      },
      animate: { 
        opacity: [0.7, 1, 0.7],
        scale: [1, 1.1, 1]
      }
    }

    const ringVariants = {
      initial: { 
        strokeDasharray: "0 314",
        rotate: 0
      },
      animate: { 
        strokeDasharray: ["0 314", "157 157", "314 0"],
        rotate: [0, 180, 360]
      }
    }

    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center justify-center", className)}
        {...props}
      >
        <motion.div
          variants={animationVariants}
          initial="initial"
          animate={animated ? "animate" : "initial"}
          whileHover="hover"
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer ring with animated stroke */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke={color}
              strokeWidth="2"
              fill="none"
              variants={ringVariants}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Middle ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="30"
              stroke={color}
              strokeWidth="1.5"
              fill="none"
              initial={{ opacity: 0.6 }}
              animate={animated ? { 
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.02, 1]
              } : {}}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Inner ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="15"
              stroke={color}
              strokeWidth="1.5"
              fill="none"
              initial={{ opacity: 0.8 }}
              animate={animated ? { 
                opacity: [0.8, 0.4, 0.8],
                scale: [1, 0.95, 1]
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Center dot */}
            <motion.circle
              cx="50"
              cy="50"
              r="3"
              fill={color}
              initial={{ scale: 1 }}
              animate={animated ? { 
                scale: [1, 1.3, 1],
                opacity: [1, 0.7, 1]
              } : {}}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Crosshairs */}
            <motion.g
              variants={crosshairVariants}
              animate={animated ? "animate" : "initial"}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Vertical crosshair */}
              <line
                x1="50"
                y1="5"
                x2="50"
                y2="95"
                stroke={color}
                strokeWidth="1"
                opacity="0.6"
              />
              
              {/* Horizontal crosshair */}
              <line
                x1="5"
                y1="50"
                x2="95"
                y2="50"
                stroke={color}
                strokeWidth="1"
                opacity="0.6"
              />
              

            </motion.g>
            

          </svg>
        </motion.div>
      </div>
    )
  }
)

SniperTargetLogo.displayName = 'SniperTargetLogo'