'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Copy, Check, Terminal, Code, Github } from 'lucide-react'
import { SharedHeader } from '@/components/shared-header'
import Link from 'next/link'



const CodeBlock = ({ children, title }: { children: string; title?: string }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="relative group bg-white/80 dark:bg-black/60 border-gray-200 dark:border-zinc-700 backdrop-blur-xl hover:border-gray-300 dark:hover:border-zinc-600 transition-all duration-300">
      {title && (
        <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 font-mono px-3 pt-2">{title}</div>
      )}
      <div className="relative px-3 pb-3">
        <pre className="text-sm overflow-x-auto">
          <code className="text-blue-600 dark:text-blue-300 font-mono">{children}</code>
        </pre>
        <Button
          onClick={copyToClipboard}
          variant="ghost"
          size="icon"
          className="absolute top-0 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 h-7 w-7"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
    </Card>
  )
}

const ParticleField = () => {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; delay: number }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-px h-px bg-blue-500 opacity-30 animate-pulse-slow"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
    </div>
  )
}

export default function HomePage() {
  const [typedText, setTypedText] = useState('')
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0)
  const baseText = 'npx 1shot '

  useEffect(() => {
    const commands = ['readme', 'prd', 'stripe', 'clerk', 'aws-sdk']
    let index = 0
    let isTyping = true
    let timer: NodeJS.Timeout

    const typeCommand = () => {
      const currentCommand = commands[currentCommandIndex]
      const fullText = baseText + currentCommand

      if (isTyping) {
        // Typing phase
        if (index <= fullText.length) {
          setTypedText(fullText.slice(0, index))
          index++
          timer = setTimeout(typeCommand, 100)
        } else {
          // Pause before erasing
          timer = setTimeout(() => {
            isTyping = false
            typeCommand()
          }, 2000)
        }
      } else {
        // Erasing phase
        if (index > baseText.length) {
          setTypedText(fullText.slice(0, index))
          index--
          timer = setTimeout(typeCommand, 50)
        } else {
          // Move to next command
          setCurrentCommandIndex((prev) => (prev + 1) % commands.length)
          isTyping = true
          timer = setTimeout(() => {
            typeCommand()
          }, 500)
        }
      }
    }

    typeCommand()

    return () => clearTimeout(timer)
  }, [currentCommandIndex, baseText])

  return (
    <>
      <SharedHeader />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-500">
        <ParticleField />
      
      {/* Section 1: Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Floating elements */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500 dark:bg-blue-400 rounded-full opacity-20 dark:opacity-10 blur-3xl animate-float" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-500 dark:bg-indigo-400 rounded-full opacity-20 dark:opacity-10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-10 right-10 w-32 h-32 bg-purple-500 dark:bg-purple-400 rounded-full opacity-15 dark:opacity-5 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
          
          {/* Main headline */}
          <div className="opacity-0 animate-fade-in-delay">
            <h1 className="text-2xl lg:text-5xl font-black mb-6 leading-none tracking-tight">
              <span className="block text-gray-900 dark:text-white">Headshot Your Codebase</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="opacity-0 animate-fade-in-delay-2 mb-12">
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-zinc-300 max-w-3xl mx-auto leading-relaxed">
              Open Source CLI for accomplishing tasks.
              <br/> 1 line, 1 command, 1 shot. 
              {/* <br/> Built with assistant-ui and claude code.  */}
            </p>
          </div>

          {/* Interactive code block */}
          <div className="opacity-0 animate-fade-in-delay-3 mb-12">
            <Card className="glass rounded-2xl p-6 max-w-xl mx-auto hover:shadow-lg bg-white/60 dark:bg-black/20 border-gray-200 dark:border-zinc-700/50 backdrop-blur-xl transition-all duration-300 relative group">
              <div className="text-sm text-gray-600 dark:text-zinc-400 mb-4 font-mono flex items-center justify-center gap-2">
                <Terminal className="w-4 h-4" />
                Try it now
              </div>
              <div className="font-mono text-xl md:text-2xl text-gray-900 dark:text-white tracking-wide flex items-center justify-center">
                <span className="text-gray-500 dark:text-zinc-500">$ </span>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent ml-2">{typedText}</span>
                <span className="animate-pulse">|</span>
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(typedText)
                }}
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="opacity-0 animate-fade-in-delay-3 mb-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/registry">
                <Button 
                  size="lg" 
                  className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 border-0"
                >
                  <Github className="w-5 h-5 mr-2" />
                  View Prompt Registry
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-3 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800/50 backdrop-blur-sm rounded-xl transition-all duration-300"
              >
                <Code className="w-5 h-5 mr-2" />
                Add Your Own Command
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 animate-fade-in-delay-3">
          <div className="w-8 h-12 border-2 border-zinc-600 rounded-full flex justify-center hover:border-zinc-500 transition-colors cursor-pointer">
            <div className="w-2 h-4 bg-white rounded-full mt-3 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Section 2: Power Showcase */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Visual */}
            <div className="relative">
              <Card className="glass rounded-2xl p-6 relative overflow-hidden bg-white/60 dark:bg-black/30 border-gray-200 dark:border-zinc-700/50 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 dark:from-blue-500/10 to-indigo-500/5 dark:to-indigo-500/10" />
                
                {/* Terminal window */}
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <div className="ml-4 text-sm text-gray-600 dark:text-zinc-400 font-mono flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      npx 1shot stripe 
                    </div>
                  </div>
                  
                  <div className="space-y-4 font-mono text-sm">
                    <div className="opacity-0 animate-fade-in flex items-center">
                      <span className="text-green-500 text-lg">✓</span>
                      <span className="text-gray-700 dark:text-zinc-300 ml-3">Analyzing codebase...</span>
                    </div>
                    <div className="opacity-0 animate-fade-in-delay flex items-center">
                      <span className="text-green-500 text-lg">✓</span>
                      <span className="text-gray-700 dark:text-zinc-300 ml-3">Installing dependencies...</span>
                    </div>
                    <div className="opacity-0 animate-fade-in-delay-2 flex items-center">
                      <span className="text-green-500 text-lg">✓</span>
                      <span className="text-gray-700 dark:text-zinc-300 ml-3">Generating components...</span>
                    </div>
                    <div className="opacity-0 animate-fade-in-delay-3 flex items-center">
                      <span className="text-blue-600 dark:text-blue-400 text-lg">→</span>
                      <span className="text-gray-700 dark:text-zinc-300 ml-3">Stripe integration complete</span>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Floating code snippets */}
              <Card className="absolute -top-4 -right-4 opacity-0 animate-fade-in-delay-2 bg-white/80 dark:bg-black/60 border-gray-200 dark:border-zinc-700 backdrop-blur-xl">
                <div className="p-3 text-xs font-mono text-gray-700 dark:text-zinc-300">
                  <div className="text-blue-600 dark:text-blue-400">stripe.paymentIntents.create()</div>
                </div>
              </Card>
              <Card className="absolute -bottom-1 -right-4 opacity-0 animate-fade-in-delay-3 bg-white/80 dark:bg-black/60 border-gray-200 dark:border-zinc-700 backdrop-blur-xl">
                <div className="p-3 text-xs font-mono text-gray-700 dark:text-zinc-300">
                  <div className="text-green-600 dark:text-green-400">webhook setup ✓</div>
                </div>
              </Card>
            </div>

            {/* Right: Content */}
            <div className="space-y-8">
              <div className="opacity-0 animate-fade-in">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-none tracking-tight">
                  One Command.<br />
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-500 dark:to-indigo-400 bg-clip-text text-transparent">Any Integration.</span><br />
                  <span className="text-gray-500 dark:text-zinc-400 text-xl md:text-3xl lg:text-4xl font-light">Zero Setup.</span>
                </h2>
              </div>

              <div className="opacity-0 animate-fade-in-delay space-y-6">
                <div className="space-y-4">
                  <Card className="flex items-start gap-4 p-4 bg-white/60 dark:bg-black/20 border-gray-200 dark:border-zinc-700/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">1</div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1">Pick it</h3>
                      <p className="text-gray-600 dark:text-zinc-400">Choose from hundreds of premade commands in our registry</p>
                    </div>
                  </Card>
                  
                  <Card className="flex items-start gap-4 p-4 bg-white/60 dark:bg-black/20 border-gray-200 dark:border-zinc-700/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">2</div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1">Run it</h3>
                      <p className="text-gray-600 dark:text-zinc-400"><code className="text-blue-600 dark:text-blue-300 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-sm">npx 1shot [command-name] &lsquo;[custom instructions]&rsquo;</code></p>
                    </div>
                  </Card>
                  
                  <Card className="flex items-start gap-4 p-4 bg-white/60 dark:bg-black/20 border-gray-200 dark:border-zinc-700/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">3</div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1">Ship it</h3>
                      <p className="text-gray-600 dark:text-zinc-400">Code gets written, files get created, dependencies get added</p>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="opacity-0 animate-fade-in-delay-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link href="/commands/openai">
                    <CodeBlock title="API Integrations">npx 1shot openai</CodeBlock>
                  </Link>
                  <Link href="/commands/jwt-auth">
                    <CodeBlock title="Authentication">npx 1shot jwt-auth</CodeBlock>
                  </Link>
                  <Link href="/commands/postgres-prisma">
                    <CodeBlock title="Database">npx 1shot postgres-prisma</CodeBlock>
                  </Link>
                  <Link href="/commands/stripe">
                    <CodeBlock title="Payments">npx 1shot stripe</CodeBlock>
                  </Link>
                </div>
              </div>

              <div className="opacity-0 animate-fade-in-delay-3">
                <Card className="p-6 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-500/10 dark:to-indigo-500/10 border-blue-200 dark:border-blue-500/30 backdrop-blur-sm">
                  <p className="text-gray-700 dark:text-zinc-300 text-lg leading-relaxed">
                    Powered by <span className="text-blue-600 dark:text-blue-400 font-bold">Claude Code</span> and <span className="text-indigo-600 dark:text-indigo-400 font-bold">Assistant-UI</span>—the same AI technology that powers professional development workflows.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  )
}