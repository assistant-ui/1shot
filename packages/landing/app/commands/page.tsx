'use client'

import { commands, commandCategories, getCommandsByCategory } from '@/lib/commands'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Terminal, Copy, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CommandsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2">All Commands</h1>
          <p className="text-lg text-gray-600 dark:text-zinc-300">
            Explore all {commands.length} available commands across {commandCategories.length} categories
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {commandCategories.map((category) => {
            const categoryCommands = getCommandsByCategory(category)
            return (
              <section key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold">{category}</h2>
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                    {categoryCommands.length} commands
                  </Badge>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryCommands.map((command) => (
                    <Card 
                      key={command.id}
                      className="group bg-white/60 dark:bg-black/20 border-gray-200 dark:border-zinc-700/50 backdrop-blur-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {command.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {command.description}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </div>

                        <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg p-3 mb-4 font-mono text-sm relative group/code">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <code className="text-blue-600 dark:text-blue-300">{command.example}</code>
                          </div>
                          <Button
                            onClick={() => navigator.clipboard.writeText(command.example)}
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 opacity-0 group-hover/code:opacity-100 transition-opacity duration-200 h-6 w-6"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>

                        <Link href={`/commands/${command.id}`}>
                          <Button variant="outline" className="w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 transition-colors">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        {/* Stats */}
        <div className="mt-12 text-center">
          <Card className="inline-block bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-500/10 dark:to-indigo-500/10 border-blue-200 dark:border-blue-500/30 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{commands.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Commands</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{commandCategories.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">1</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Command to Rule</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}