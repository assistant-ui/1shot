"use client"

import { useEffect, useRef } from 'react'

interface AnimatedBackgroundProps {
  className?: string
}

export function AnimatedBackground({ className = "" }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    let time = 0

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Sniper circle class
    class SniperCircle {
      x: number
      y: number
      radius: number
      angle: number
      speed: number
      opacity: number

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.radius = Math.random() * 100 + 50
        this.angle = Math.random() * Math.PI * 2
        this.speed = 0.002
        this.opacity = 0.1
      }

      update() {
        this.angle += this.speed
        this.x += Math.cos(this.angle) * 0.5
        this.y += Math.sin(this.angle) * 0.5

        // Wrap around screen
        if (this.x < -this.radius) this.x = canvas!.width + this.radius
        if (this.x > canvas!.width + this.radius) this.x = -this.radius
        if (this.y < -this.radius) this.y = canvas!.height + this.radius
        if (this.y > canvas!.height + this.radius) this.y = -this.radius
      }

      draw() {
        ctx.save()
        ctx.globalAlpha = this.opacity
        
        // Draw outer ring
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.stroke()

        // Draw inner ring
        ctx.strokeStyle = '#1e40af'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius - 20, 0, Math.PI * 2)
        ctx.stroke()

        // Draw crosshair
        ctx.strokeStyle = '#60a5fa'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(this.x - 10, this.y)
        ctx.lineTo(this.x + 10, this.y)
        ctx.moveTo(this.x, this.y - 10)
        ctx.lineTo(this.x, this.y + 10)
        ctx.stroke()

        ctx.restore()
      }
    }

    // Floating particles class
    class FloatingParticle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.size = Math.random() * 3 + 1
        this.opacity = Math.random() * 0.3 + 0.1
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        // Wrap around screen
        if (this.x < 0) this.x = canvas!.width
        if (this.x > canvas!.width) this.x = 0
        if (this.y < 0) this.y = canvas!.height
        if (this.y > canvas!.height) this.y = 0
      }

      draw() {
        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = '#60a5fa'
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    // Create instances
    const sniperCircles = Array.from({ length: 3 }, () => new SniperCircle())
    const floatingParticles = Array.from({ length: 50 }, () => new FloatingParticle())

    const animate = () => {
      time += 0.01

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(0.5, '#1e293b')
      gradient.addColorStop(1, '#0f172a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw moving grid lines
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.3

      const gridSize = 100
      const offsetX = (time * 20) % gridSize
      const offsetY = (time * 15) % gridSize

      // Vertical lines
      for (let x = -gridSize + offsetX; x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = -gridSize + offsetY; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Update and draw sniper circles
      sniperCircles.forEach(circle => {
        circle.update()
        circle.draw()
      })

      // Update and draw floating particles
      floatingParticles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: -1 }}
    />
  )
} 