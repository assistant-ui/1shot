'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Copy, Check, Terminal, Code, GitPullRequest, FileText, Server, Sparkles, BookOpen, ExternalLink } from 'lucide-react'
import { SharedHeader } from '@/components/shared-header'
import Link from 'next/link'

const CodeBlock = ({ children, title, language = "typescript" }: { children: string; title?: string; language?: string }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="relative group bg-white/80 border-gray-200 backdrop-blur-xl hover:border-gray-300 transition-all duration-300">
      {title && (
        <div className="text-xs text-gray-600 mb-2 font-mono px-3 pt-2">{title}</div>
      )}
      <div className="relative">
        <pre className="text-sm overflow-x-auto px-3 pb-3">
          <code className={`font-mono ${language === 'bash' ? 'text-green-600' : 'text-blue-600'}`}>{children}</code>
        </pre>
        <Button
          onClick={copyToClipboard}
          variant="ghost"
          size="icon"
          className="absolute top-0 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-500 hover:text-gray-900 hover:bg-gray-200 h-7 w-7"
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
    </Card>
  )
}

export default function AddCommandGuidePage() {
  return (
    <>
      <SharedHeader />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-none tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Add Your Command
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Contribute to the 1shot ecosystem by adding your own commands to the registry.
              Support standard prompts or enhanced MCP server integrations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <Card className="p-6 bg-white/80 border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <GitPullRequest className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">GitHub Repository</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Fork and contribute to the registry
                  </p>
                  <a
                    href="https://github.com/assistant-ui/1shot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    View Repository
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/80 border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Registry File</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    View the source registry directly
                  </p>
                  <a
                    href="https://github.com/assistant-ui/1shot/blob/main/packages/1shot/src/registry.ts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
                  >
                    View registry.ts
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </Card>
          </div>

          {/* MCP Server Support Section */}
          <Card className="p-8 mb-12 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Server className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">MCP Server Support</h2>
              <span className="px-2 py-1 bg-purple-200 text-purple-700 text-xs font-semibold rounded-full">NEW</span>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              1shot now supports MCP (Model Context Protocol) servers for enhanced functionality. 
              MCP servers provide additional context and capabilities to your commands, enabling 
              richer integrations with documentation, APIs, and specialized tools.
            </p>
            <div className="bg-white/80 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Currently Supported
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <code className="text-sm font-mono text-purple-600">assistant-ui</code>
                    <p className="text-sm text-gray-600 mt-1">
                      Full support for assistant-ui MCP documentation server, providing comprehensive 
                      integration guides and component documentation.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 italic">
                More MCP server integrations coming soon! We're actively working on expanding support.
              </p>
            </div>
          </Card>

          {/* Step-by-Step Guide */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Step-by-Step Guide</h2>

            {/* Step 1 */}
            <Card className="p-6 bg-white/80 border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">1</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3">Edit the Registry</h3>
                  <p className="text-gray-600 mb-4">
                    Open <code className="bg-gray-100 px-2 py-1 rounded text-sm">packages/1shot/src/registry.ts</code> and add your command:
                  </p>
                  <CodeBlock title="Basic Command Structure">
{`export const registry: Record<string, RegistryEntry> = {
  // ... existing entries ...
  
  "your-command-name": {
    prompt: "Your main prompt that describes what the command does",
    systemPrompt: "Optional system prompt for additional context",
    // Optional: Add MCP server configuration
    mcpServers: {
      "server-name": {
        "command": "npx",
        "args": ["-y", "@your-org/mcp-server"]
      }
    }
  },
  
  // ... more entries ...
};`}
                  </CodeBlock>
                </div>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="p-6 bg-white/80 border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">2</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3">Command Examples</h3>
                  <p className="text-gray-600 mb-4">
                    Here are different types of commands you can create:
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Simple Command</h4>
                      <CodeBlock>
{`"readme": {
  prompt: "Generate a comprehensive README.md file for this project"
}`}
                      </CodeBlock>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Command with System Prompt</h4>
                      <CodeBlock>
{`"stripe-integration": {
  systemPrompt: "You are an expert in Stripe payment integration",
  prompt: "Integrate Stripe payment processing into this application"
}`}
                      </CodeBlock>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Command with MCP Server (Currently assistant-ui only)</h4>
                      <CodeBlock>
{`"assistant-ui": {
  systemPrompt: "You are helping integrate assistant-ui into a project",
  prompt: "Integrate assistant-ui chat into this project",
  mcpServers: {
    "assistant-ui": {
      "command": "npx",
      "args": ["-y", "@assistant-ui/mcp-docs-server"]
    }
  }
}`}
                      </CodeBlock>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="p-6 bg-white/80 border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">3</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3">Test Your Command</h3>
                  <p className="text-gray-600 mb-4">
                    Build and test your command locally before submitting:
                  </p>
                  <CodeBlock title="Build and test" language="bash">
{`# Install dependencies
npm install

# Build the project
npm run build

# Test your command
npx ./packages/1shot your-command-name`}
                  </CodeBlock>
                </div>
              </div>
            </Card>

            {/* Step 4 */}
            <Card className="p-6 bg-white/80 border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">4</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3">Submit a Pull Request</h3>
                  <p className="text-gray-600 mb-4">
                    Once your command is working, commit your changes and create a pull request:
                  </p>
                  <CodeBlock title="Submit your contribution" language="bash">
{`# Commit your changes
git add packages/1shot/src/registry.ts
git commit -m "Add [your-command-name] command to registry"

# Push to your fork
git push origin main

# Create a pull request on GitHub`}
                  </CodeBlock>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>PR Description Tips:</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                      <li>Describe what your command does</li>
                      <li>Include example use cases</li>
                      <li>Mention any dependencies or requirements</li>
                      <li>Note if you're using MCP servers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Best Practices */}
          <Card className="p-8 mt-12 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="h-7 w-7" />
              Best Practices
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Clear Naming</h3>
                  <p className="text-gray-600 text-sm">
                    Use descriptive, kebab-case names that clearly indicate the command's purpose (e.g., `stripe-checkout`, `jwt-auth`)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Comprehensive Prompts</h3>
                  <p className="text-gray-600 text-sm">
                    Write detailed prompts that provide clear context and expectations for the AI assistant
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Use System Prompts</h3>
                  <p className="text-gray-600 text-sm">
                    Add system prompts for specialized knowledge or when the command requires specific expertise
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Consider MCP Servers</h3>
                  <p className="text-gray-600 text-sm">
                    For complex integrations, consider adding MCP server support (currently assistant-ui only) to provide enhanced documentation and context
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Test Thoroughly</h3>
                  <p className="text-gray-600 text-sm">
                    Always test your command in different project contexts before submitting
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <Card className="p-8 bg-white/80 border-gray-200">
              <h2 className="text-2xl font-bold mb-4">Ready to Contribute?</h2>
              <p className="text-gray-600 mb-6">
                Join our community of developers building the future of AI-powered development tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://github.com/assistant-ui/1shot"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white">
                    <GitPullRequest className="w-5 h-5 mr-2" />
                    Fork on GitHub
                  </Button>
                </a>
                <Link href="/registry">
                  <Button size="lg" variant="outline">
                    <Terminal className="w-5 h-5 mr-2" />
                    Browse Registry
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}