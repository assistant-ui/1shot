'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Check, Terminal, Code, Sparkles, Zap, Shield, Database, Cloud, TestTube, Gauge, ExternalLink, GitPullRequest, FileText, Settings, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Card } from '@/components/ui/card'
import { AnimatedTabs } from '@/components/ui/animated-tabs'
import {
  Expandable,
  ExpandableCard,
  ExpandableCardContent,
  ExpandableCardFooter,
  ExpandableCardHeader,
  ExpandableContent,
  ExpandableTrigger,
} from '@/components/ui/expandable'
import { CopyIcon } from '@/components/ui/copy-icon'
import { SharedHeader } from '@/components/shared-header'
import { commands, commandCategories, type Command } from '@/lib/commands'


const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'API Integrations': Zap,
  'Authentication': Shield,
  'Database': Database,
  'DevOps': Cloud,
  'UI Components': Code,
  'Testing': TestTube,
  'Performance': Gauge,
  'Framework': Layers,
  'Documentation': FileText,
  'Development': Settings,
  'General': Terminal,
}



function PromptCard({ 
  command, 
  isExpanded, 
  onToggle 
}: { 
  command: Command
  isExpanded: boolean
  onToggle: () => void
}) {
  const [copied, setCopied] = useState<'command' | 'prompt' | null>(null)
  const Icon = categoryIcons[command.category] || Code

  const copyToClipboard = (text: string, type: 'command' | 'prompt') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Expandable
      expanded={isExpanded}
      onToggle={onToggle}
      expandDirection="both"
      expandBehavior="replace"
      initialDelay={0.1}
    >
      {() => (
        <div className={`${isExpanded ? 'z-50 relative' : 'z-10'}`}>
          <ExpandableTrigger>
            <ExpandableCard
              className={`w-full relative group hover:shadow-md transition-all duration-300 ${
                isExpanded ? 'shadow-2xl border-2 border-blue-200 ' : ''
              }`}
              collapsedSize={{ width: 350, height: 220 }}
              expandedSize={{ width: 500, height: 420 }}
              hoverToExpand={false}
              expandDelay={200}
              collapseDelay={300}
            >
            <ExpandableCardHeader>
              <div className="flex justify-between items-start w-full">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 ">
                    <Icon className="h-5 w-5 text-gray-600 " />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800  mb-3">
                      {command.name}
                    </h3>
                                          {/* Command section - only visible in non-expanded state */}
                     
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500 ">
                        <Code className="h-3 w-3" />
                        <span>Command</span>
                        </div>
                        <div className="bg-gray-50  rounded-md px-3 py-2 font-mono text-xs border border-gray-200 ">
                        <code className="text-blue-600 ">
                            {command.example}
                        </code>
                        </div>
                    </div>
                    
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(command.example, 'command')
                  }}
                >
                  {copied === 'command' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <CopyIcon size={16} />
                  )}
                </Button>
              </div>
            </ExpandableCardHeader>

            <ExpandableCardContent className={isExpanded ? "p-6 overflow-y-auto max-h-80" : "p-4"}>
              <p className="text-sm text-gray-600  mb-6 leading-relaxed">
                {command.description}
              </p>

              <ExpandableContent preset="fade" stagger staggerChildren={0.1}>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-sm text-gray-800  mb-3 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      System Prompt
                    </h4>
                    <div className="bg-gray-50  rounded-md p-4 relative group">
                      <p className="text-xs text-gray-600  leading-relaxed">
                        {command.systemPrompt}
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(command.systemPrompt, 'prompt')
                        }}
                      >
                        {copied === 'prompt' ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <CopyIcon size={12} />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-800  mb-3">
                      Detailed Prompt
                    </h4>
                    <div className="bg-gray-50  rounded-md p-4 max-h-36 overflow-y-auto">
                      <pre className="text-xs text-gray-600  leading-relaxed whitespace-pre-wrap">
                        {command.prompt}
                      </pre>
                    </div>
                  </div>
                </div>
              </ExpandableContent>
            </ExpandableCardContent>
            
            <ExpandableContent preset="slide-up">
              <ExpandableCardFooter className="p-6 pt-4">
                <div className="flex items-center justify-between w-full">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyToClipboard(command.example, 'command')
                    }}
                  >
                    <Terminal className="h-3 w-3 mr-2" />
                    {copied === 'command' ? 'Copied!' : 'Copy Command'}
                  </Button>
                  <span className="text-xs text-gray-500 ">
                    ID: {command.id}
                  </span>
                </div>
              </ExpandableCardFooter>
            </ExpandableContent>
          </ExpandableCard>
        </ExpandableTrigger>
        </div>
      )}
    </Expandable>
  )
}

export default function RegistryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)
  
  // Reset expanded card when search changes
  useEffect(() => {
    setExpandedCardId(null)
  }, [searchQuery])
  
  const tabs = [
    { label: 'All', value: 'all' },
    ...commandCategories.map(category => ({
      label: category,
      value: category.toLowerCase().replace(/\s+/g, '-')
    }))
  ]

  const filteredCommands = useMemo(() => {
    return (selectedTab: { value: string; label: string }) => {
      let filtered = commands
      
      // Filter by category
      if (selectedTab.value !== 'all') {
        const category = commandCategories.find(cat => 
          cat.toLowerCase().replace(/\s+/g, '-') === selectedTab.value
        )
        if (category) {
          filtered = filtered.filter(cmd => cmd.category === category)
        }
      }
      
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(cmd =>
          cmd.name.toLowerCase().includes(query) ||
          cmd.description.toLowerCase().includes(query) ||
          cmd.category.toLowerCase().includes(query) ||
          cmd.id.toLowerCase().includes(query)
        )
      }
      
      return filtered
    }
  }, [searchQuery])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100  text-gray-900 ">
      <SharedHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-none tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600  bg-clip-text text-transparent">
              Prompt Registry
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600  max-w-3xl mx-auto leading-relaxed">
            Discover and use pre-built prompts for common development tasks.
            <br />
            From API integrations to testing setups, find the perfect prompt for your project.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search prompts by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg bg-white/80  border-gray-200  backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Tabs and Content */}
        <AnimatedTabs tabs={tabs}>
          {(selectedTab) => {
            const filtered = filteredCommands(selectedTab)
            
            // Reset expanded card when switching tabs or search changes
            if (expandedCardId && !filtered.find(cmd => cmd.id === expandedCardId)) {
              setExpandedCardId(null)
            }
            
            return (
              <div>
                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 ">
                    {filtered.length} prompt{filtered.length !== 1 ? 's' : ''} found
                    {selectedTab.value !== 'all' && (
                      <span> in {selectedTab.label}</span>
                    )}
                    {searchQuery && (
                      <span> matching &ldquo;{searchQuery}&rdquo;</span>
                    )}
                  </p>
                </div>

                {/* Cards Grid */}
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((command) => (
                      <PromptCard 
                        key={command.id} 
                        command={command}
                        isExpanded={expandedCardId === command.id}
                        onToggle={() => {
                          setExpandedCardId(expandedCardId === command.id ? null : command.id)
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center bg-white/60  border-gray-200  backdrop-blur-sm">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800  mb-2">
                      No prompts found
                    </h3>
                    <p className="text-gray-600 ">
                      Try adjusting your search terms or browse a different category.
                    </p>
                  </Card>
                )}
              </div>
            )
          }}
        </AnimatedTabs>

        {/* Contribution Section */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-white/60  border-gray-200  backdrop-blur-sm">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600  bg-clip-text text-transparent">
                Contribute Your Own Prompts
              </h2>
              <p className="text-lg text-gray-600  mb-6 leading-relaxed">
                Help the community by adding your own expertly crafted prompts to the registry.
                <br />
                Share your knowledge and make development easier for everyone.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6 bg-white/80  border-gray-200 ">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 ">
                      <ExternalLink className="h-6 w-6 text-blue-600 " />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg mb-2">Registry File</h3>
                      <p className="text-sm text-gray-600  mb-3">
                        View the source registry file where all prompts are defined
                      </p>
                      <a
                        href="https://github.com/assistant-ui/1shot/blob/main/packages/1shot/src/registry.ts"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600  hover:text-blue-700  transition-colors"
                      >
                        View registry.ts
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white/80  border-gray-200 ">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-green-100 ">
                      <GitPullRequest className="h-6 w-6 text-green-600 " />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg mb-2">Submit a PR</h3>
                      <p className="text-sm text-gray-600  mb-3">
                        Create a pull request with your new prompt following the existing format
                      </p>
                      <a
                        href="https://github.com/assistant-ui/1shot/pulls"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-green-600  hover:text-green-700  transition-colors"
                      >
                        Create Pull Request
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="bg-gray-50  rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  How to Contribute
                </h3>
                <div className="text-left max-w-3xl mx-auto">
                  <ol className="list-decimal list-inside space-y-3 text-gray-600 ">
                    <li>
                      <strong>Fork the repository:</strong> Start by forking the{' '}
                      <a href="https://github.com/assistant-ui/1shot" target="_blank" rel="noopener noreferrer" className="text-blue-600  hover:underline">
                        1shot repository
                      </a>
                    </li>
                    <li>
                      <strong>Edit the registry:</strong> Add your prompt to{' '}
                      <code className="bg-gray-200  px-2 py-1 rounded text-sm">packages/1shot/src/registry.ts</code>
                    </li>
                    <li>
                      <strong>Follow the format:</strong> Use the existing prompt structure with proper categories and clear descriptions
                    </li>
                    <li>
                      <strong>Test locally:</strong> Ensure your prompt works correctly and follows the established patterns
                    </li>
                    <li>
                      <strong>Submit PR:</strong> Create a pull request with a clear description of your prompt and its use case
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
    </div>
  )
}