'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { commands, commandCategories, getCommandsByCategory } from '@/lib/commands'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar'
import { 
  Home, 
  Terminal, 
  Menu,
  Search,
  ChevronRight
} from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function CommandsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCommands = commands.filter(command =>
    command.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    command.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-gray-200 dark:border-zinc-800">
          <SidebarHeader className="p-4">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Terminal className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-lg">1Shot Commands</span>
            </Link>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search commands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/60 dark:bg-black/20 border-gray-200 dark:border-zinc-700"
              />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === '/'}>
                          <Link href="/" className="flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            <span>Home</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <Separator />

                {searchQuery ? (
                  <SidebarGroup>
                    <SidebarGroupLabel>
                      Search Results ({filteredCommands.length})
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {filteredCommands.map((command) => (
                          <SidebarMenuItem key={command.id}>
                            <SidebarMenuButton 
                              asChild 
                              isActive={pathname === `/commands/${command.id}`}
                            >
                              <Link 
                                href={`/commands/${command.id}`}
                                className="flex items-start gap-2 py-2"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{command.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {command.description}
                                  </div>
                                </div>
                                <ChevronRight className="w-3 h-3 mt-1 opacity-50" />
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                ) : (
                  commandCategories.map((category) => {
                    const categoryCommands = getCommandsByCategory(category)
                    return (
                      <SidebarGroup key={category}>
                        <SidebarGroupLabel className="flex items-center justify-between">
                          <span>{category}</span>
                          <Badge variant="secondary" className="text-xs">
                            {categoryCommands.length}
                          </Badge>
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                          <SidebarMenu>
                            {categoryCommands.map((command) => (
                              <SidebarMenuItem key={command.id}>
                                <SidebarMenuButton 
                                  asChild 
                                  isActive={pathname === `/commands/${command.id}`}
                                >
                                  <Link 
                                    href={`/commands/${command.id}`}
                                    className="flex items-start gap-2 py-2"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">{command.name}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {command.description}
                                      </div>
                                    </div>
                                    <ChevronRight className="w-3 h-3 mt-1 opacity-50" />
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </SidebarGroup>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="border-b border-gray-200 dark:border-zinc-800 p-4 bg-white/60 dark:bg-black/20 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <SidebarTrigger>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SidebarTrigger>
              <div className="flex-1">
                <h1 className="text-xl font-semibold">Command Registry</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Browse and explore all available 1Shot commands
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}