import { notFound } from 'next/navigation'
import { getCommandById } from '@/lib/commands'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Terminal, BookOpen, Code2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface CommandPageProps {
  params: Promise<{ id: string }>
}

export default async function CommandPage({ params }: CommandPageProps) {
  const { id } = await params
  const command = getCommandById(id)

  if (!command) {
    notFound()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">{command.name}</h1>
              <p className="text-lg text-gray-600 dark:text-zinc-300 mb-4">{command.description}</p>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30">
                {command.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Command Example */}
        <Card className="mb-8 bg-white/60 dark:bg-black/20 border-gray-200 dark:border-zinc-700/50 backdrop-blur-xl">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold">Command</h2>
            </div>
            <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg p-4 font-mono text-lg relative group">
              <code className="text-blue-600 dark:text-blue-300">{command.example}</code>
              <Button
                onClick={() => copyToClipboard(command.example)}
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* System Prompt */}
        <Card className="mb-8 bg-white/60 dark:bg-black/20 border-gray-200 dark:border-zinc-700/50 backdrop-blur-xl">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-semibold">System Prompt</h2>
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/30 rounded-lg p-4 relative group">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {command.systemPrompt}
              </p>
              <Button
                onClick={() => copyToClipboard(command.systemPrompt)}
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Prompt */}
        <Card className="mb-8 bg-white/60 dark:bg-black/20 border-gray-200 dark:border-zinc-700/50 backdrop-blur-xl">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold">Implementation Prompt</h2>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/30 rounded-lg p-4 relative group">
              <pre className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                {command.prompt}
              </pre>
              <Button
                onClick={() => copyToClipboard(command.prompt)}
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Try It Section */}
        <Card className="bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-500/10 dark:to-indigo-500/10 border-blue-200 dark:border-blue-500/30 backdrop-blur-sm">
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Ready to try this command?</h3>
            <p className="text-gray-600 dark:text-zinc-300 mb-4">
              Copy the command above and run it in your project directory.
            </p>
            <Button
              onClick={() => copyToClipboard(command.example)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Command
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}