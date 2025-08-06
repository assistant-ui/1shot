import { registry } from '../../1shot/src/registry'

export interface Command {
  id: string
  name: string
  description: string
  category: string
  systemPrompt: string
  prompt: string
  example: string
}

// Function to convert registry id to display name
function formatCommandName(id: string): string {
  return id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Function to generate category from command characteristics
function getCommandCategory(id: string, entry: { systemPrompt?: string; prompt: string }): string {
  const { systemPrompt = '', prompt } = entry
  const combined = `${systemPrompt} ${prompt}`.toLowerCase()
  
  if (combined.includes('authentication') || combined.includes('oauth') || combined.includes('jwt')) {
    return 'Authentication'
  }
  if (combined.includes('database') || combined.includes('postgres') || combined.includes('redis') || combined.includes('sql')) {
    return 'Database'
  }
  if (combined.includes('api') || combined.includes('integration') || combined.includes('openai') || combined.includes('stripe')) {
    return 'API Integrations'
  }
  if (combined.includes('test') || combined.includes('jest') || combined.includes('cypress')) {
    return 'Testing'
  }
  if (combined.includes('performance') || combined.includes('optimization') || combined.includes('bundle')) {
    return 'Performance'
  }
  if (combined.includes('docker') || combined.includes('deploy') || combined.includes('ci/cd') || combined.includes('github actions')) {
    return 'DevOps'
  }
  if (combined.includes('component') || combined.includes('ui') || combined.includes('react') || combined.includes('form')) {
    return 'UI Components'
  }
  if (combined.includes('next') || combined.includes('build') || combined.includes('upgrade')) {
    return 'Framework'
  }
  if (combined.includes('readme') || combined.includes('documentation') || combined.includes('prd')) {
    return 'Documentation'
  }
  if (combined.includes('bug') || combined.includes('fix') || combined.includes('debug')) {
    return 'Development'
  }
  
  return 'General'
}

// Function to generate description from prompt
function generateDescription(prompt: string): string {
  // Take first sentence or first 100 characters, whichever is shorter
  const firstSentence = prompt.split('.')[0]
  if (firstSentence.length > 100) {
    return prompt.substring(0, 100) + '...'
  }
  return firstSentence
}

// Transform registry entries to Command format
export const commands: Command[] = Object.entries(registry).map(([id, entry]) => ({
  id,
  name: formatCommandName(id),
  description: generateDescription(entry.prompt),
  category: getCommandCategory(id, entry),
  systemPrompt: entry.systemPrompt || '',
  prompt: entry.prompt,
  example: `npx 1shot ${id}`
}))

// Extract unique categories from the commands
export const commandCategories = Array.from(
  new Set(commands.map(cmd => cmd.category))
).sort()

export function getCommandsByCategory(category: string): Command[] {
  return commands.filter(cmd => cmd.category === category)
}

export function getCommandById(id: string): Command | undefined {
  return commands.find(cmd => cmd.id === id)
}