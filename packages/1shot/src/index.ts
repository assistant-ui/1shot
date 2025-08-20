#!/usr/bin/env node

// Filter out npm warnings and other noise early in the process
const originalConsoleWarn = console.warn;
const originalStderrWrite = process.stderr.write;

const shouldFilterEarly = (message: string) => {
  return (
    message.includes("npm warn Unknown project config") ||
    message.includes("link-workspace-packages") ||
    message.includes("prefer-workspace-packages") ||
    message.includes("This will stop working in the next major version of npm")
  );
};

console.warn = (...args: any[]) => {
  const message = args.join(" ");
  if (!shouldFilterEarly(message)) {
    originalConsoleWarn(...args);
  }
};

// Also hijack stderr for npm warnings that might come through that way
process.stderr.write = function (chunk: any, encoding?: any, callback?: any) {
  const message = chunk.toString();
  if (!shouldFilterEarly(message)) {
    return originalStderrWrite.call(this, chunk, encoding, callback);
  }
  return true;
};

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { render, useInput } from "ink";
import {
  useAssistantActions,
} from "@assistant-ui/react-core";
import { renderAssistantCode } from "./code";
import { registry } from "./registry";
import SelectInput from "ink-select-input";
import { Box, Text } from "ink";
import { PostHog } from 'posthog-node'


const useOnceEffect = (effect: () => void) => {
  const executed = useRef(false);

  useEffect(() => {
    if (!executed.current) {
      effect();
      executed.current = true;
    }
  }, [effect]);
};

// Function to check git status and warn user if needed
// async function checkGitStatus(): Promise<void> {
//   try {
//     // Check if we're in a git repository
//     const gitStatus = spawn("git", ["status"], { stdio: "pipe" });
//     const gitStatusPromise = new Promise<boolean>((resolve) => {
//       gitStatus.on("exit", (code: number | null) => resolve(code === 0));
//       gitStatus.on("error", () => resolve(false));
//     });

//     if (!(await gitStatusPromise)) {
//       console.log("⚠️  Warning: Not in a git repository 📁");
//       console.log(
//         "   This means your changes won't be tracked by version control 🚫"
//       );
//       console.log("   Consider initializing a git repository first 🔧\n");

//       const rl = createInterface({
//         input: process.stdin,
//         output: process.stdout,
//       });

//       return new Promise((resolve) => {
//         rl.question("Press Enter to continue anyway... ⏎ ", () => {
//           rl.close();
//           resolve();
//         });
//       });
//     }

//     // Check if git working directory is clean
//     const gitDiff = spawn("git", ["diff", "--quiet"], { stdio: "pipe" });
//     const gitDiffPromise = new Promise<boolean>((resolve) => {
//       gitDiff.on("exit", (code: number | null) => resolve(code === 0));
//       gitDiff.on("error", () => resolve(true)); // Assume clean on error
//     });

//     if (!(await gitDiffPromise)) {
//       console.log("⚠️  Warning: Git working directory is not clean 🔀");
//       console.log("   You have uncommitted changes in your repository 📝");
//       console.log(
//         "   Consider committing or stashing your changes before proceeding 💾\n"
//       );

//       const rl = createInterface({
//         input: process.stdin,
//         output: process.stdout,
//       });

//       return new Promise((resolve) => {
//         rl.question("Press Enter to continue anyway... ⏎ ", () => {
//           rl.close();
//           resolve();
//         });
//       });
//     }

//     // Check if there are untracked files
//     const gitLsFiles = spawn(
//       "git",
//       ["ls-files", "--others", "--exclude-standard"],
//       { stdio: "pipe" }
//     );
//     let untrackedFiles = "";
//     gitLsFiles.stdout?.on("data", (data: Buffer) => {
//       untrackedFiles += data.toString();
//     });

//     const gitLsFilesPromise = new Promise<boolean>((resolve) => {
//       gitLsFiles.on("exit", (code: number | null) => resolve(code === 0));
//       gitLsFiles.on("error", () => resolve(true)); // Assume no untracked files on error
//     });

//     await gitLsFilesPromise;

//     if (untrackedFiles.trim()) {
//       console.log(
//         "⚠️  Warning: You have untracked files in your repository 📄"
//       );
//       console.log(
//         "   Consider adding them to .gitignore or committing them 📋\n"
//       );

//       const rl = createInterface({
//         input: process.stdin,
//         output: process.stdout,
//       });

//       return new Promise((resolve) => {
//         rl.question("Press Enter to continue anyway... ⏎ ", () => {
//           rl.close();
//           resolve();
//         });
//       });
//     }
//   } catch (error) {
//     console.log("⚠️  Warning: Could not check git status ❓");
//     console.log("   Continuing anyway... 🚀\n");
//   }
// }
const posthog = new PostHog(
  'phc_q0VlsNWDQfMz4TYydlKq9sI74svKZLGJv6KXjqvnB6B',
  { host: 'https://us.i.posthog.com' }
);

const entryName = process.argv[2];

// Check for API key
const apiKey =
  process.env["ANTHROPIC_API_KEY"] ||
  process.env["ASSISTANT_CODE_API_KEY"] ||
  "";
// if (!apiKey) {
//   console.error("❌ Error: No API key found.");
//   console.error("\n To use 1shot, you need to set your API key:");
//   console.error("  export ANTHROPIC_API_KEY=your-api-key");
//   console.error("  # or");
//   console.error("  export ASSISTANT_CODE_API_KEY=your-api-key");
//   console.error("\n You can get an API key from: https://claude.ai/settings/keys");
//   // process.exit(1);
// }

// Handle commands selector
if (entryName === "commands" || !entryName) {
  // Command categories for better organization
  const commandCategories = {
    "Development": ["assistant-ui", "bug", "fix-next-build"],
    "Documentation": ["readme", "prd"],
    "Upgrades": ["upgrade-next", "upgrade-react", "upgrade-typescript"],
    "Databases": ["sqlite", "postgresql", "mysql", "mongodb"],
    "Backend": ["convex", "elysia", "express", "fastify", "hono", "nextjs-backend"],
    "Other": ["hello-world", "frenchify"],
  };

  const CommandSelector = () => {
    const [showFullPrompts, setShowFullPrompts] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showHelp, setShowHelp] = useState(false);

    const commands = Object.entries(registry).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    // Filter commands based on search and category
    const filteredCommands = commands.filter(([key, entry]) => {
      const matchesSearch = searchTerm === "" || 
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.systemPrompt && entry.systemPrompt.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (selectedCategory === "all") return matchesSearch;
      
      const categoryCommands = commandCategories[selectedCategory as keyof typeof commandCategories] || [];
      return matchesSearch && categoryCommands.includes(key);
    });

    // Table dimensions
    const COL_COMMAND = 20;
    const COL_CATEGORY = 16;
    const COL_DESCRIPTION = 46;



    // Create items for display
    const items = filteredCommands.map(([key, entry]) => {
      // Get category name (without emoji)
      const categoryEntry = Object.entries(commandCategories).find(([, commands]) => 
        commands.includes(key)
      );
      const categoryName = categoryEntry ? categoryEntry[0] : "Other";
      
      // Clean prompt text for preview
      const cleanPrompt = entry.prompt;
      
      // Determine if this is a long prompt
      const isLongPrompt = cleanPrompt.length > 300;
      const isLongSystemPrompt = entry.systemPrompt && entry.systemPrompt.length > 1000;

      // Create display prompt with length limit for table
      let displayPrompt = cleanPrompt;
      const maxDescLength = COL_DESCRIPTION - 5; // Reserve space for indicators
      
      if (!showFullPrompts && isLongPrompt) {
        displayPrompt = cleanPrompt.slice(0, maxDescLength - 3) + "...";
      } else if (showFullPrompts) {
        displayPrompt = cleanPrompt.slice(0, maxDescLength);
      } else {
        displayPrompt = cleanPrompt.slice(0, maxDescLength);
      }

      // Add indicators
      const indicators = [];
      if (isLongPrompt) indicators.push("L");
      if (isLongSystemPrompt) indicators.push("S");
      const indicatorStr = indicators.length > 0 ? `[${indicators.join(",")}]` : "";
      
      // Combine description with indicators
      const fullDescription = displayPrompt + (indicatorStr ? ` ${indicatorStr}` : "");
      
      // Create table row with borders
      const paddedKey = key.padEnd(COL_COMMAND);
      const paddedCategory = categoryName.padEnd(COL_CATEGORY);
      const paddedDescription = fullDescription.padEnd(COL_DESCRIPTION);
      
      const finalLabel = `│ ${paddedKey}│ ${paddedCategory}│ ${paddedDescription}│`;

      return {
        label: finalLabel,
        value: key,
      };
    });



    // For better UX, let's simplify and only show selectable items in the selector
    // but add visual context through better labeling
    
    // Enhanced category items with cleaner display
    const enhancedCategoryItems = searchTerm === "" ? [
      { label: "── CATEGORY FILTERS ──────────────────────────────────", value: "cat-spacer-1" },
      { label: "  All Categories", value: "category:all" },
      ...Object.keys(commandCategories).map(cat => ({
        label: `  ${cat}`,
        value: `category:${cat}`
      })),
      { label: "── COMMANDS ──────────────────────────────────────────", value: "cmd-spacer-1" },
      { label: "", value: "spacer-2" }
    ] : [];

    // Create table structure in item labels themselves
    const enhancedItems = filteredCommands.length > 0 ? [
      { 
        label: `┌${"─".repeat(COL_COMMAND + 1)}┬${"─".repeat(COL_CATEGORY + 1)}┬${"─".repeat(COL_DESCRIPTION + 1)}┐`,
        value: "table-header-visual"
      },
      { 
        label: `│ ${"COMMAND".padEnd(COL_COMMAND)}│ ${"CATEGORY".padEnd(COL_CATEGORY)}│ ${"DESCRIPTION".padEnd(COL_DESCRIPTION)}│`,
        value: "table-header-labels"
      },
      { 
        label: `├${"─".repeat(COL_COMMAND + 1)}┼${"─".repeat(COL_CATEGORY + 1)}┼${"─".repeat(COL_DESCRIPTION + 1)}┤`,
        value: "table-sep-visual"
      },
      ...items,
      { 
        label: `└${"─".repeat(COL_COMMAND + 1)}┴${"─".repeat(COL_CATEGORY + 1)}┴${"─".repeat(COL_DESCRIPTION + 1)}┘`,
        value: "table-footer-visual"
      }
    ] : items;

    const allItems = [
      ...enhancedCategoryItems,
      ...enhancedItems
    ];

    // Handle input
    useInput((input, key) => {
      // Help toggle
      if (key.ctrl && input === "h") {
        setShowHelp(!showHelp);
        return;
      }
      
      // Full prompts toggle
      if (key.ctrl && input === "f") {
        setShowFullPrompts(!showFullPrompts);
        return;
      }
      
      // Search functionality
      if (key.ctrl && input === "s") {
        // Toggle search mode - for now just clear search
        setSearchTerm("");
        return;
      }
      
      // Reset filters
      if (key.ctrl && input === "r") {
        setSearchTerm("");
        setSelectedCategory("all");
        return;
      }
      
      // Backspace for search
      if (key.backspace || key.delete) {
        setSearchTerm(prev => prev.slice(0, -1));
        return;
      }
    });

    const handleSelect = async (item: any) => {
      const selectedValue = item.value as string;
      
      // Handle non-selectable visual elements
      const nonSelectableItems = [
        "cat-spacer-1", "cmd-spacer-1", "spacer-2", 
        "table-header-visual", "table-header-labels", "table-sep-visual", "table-footer-visual"
      ];
      if (nonSelectableItems.includes(selectedValue)) return;
      
      // Handle category selection
      if (selectedValue.startsWith("category:")) {
        const category = selectedValue.replace("category:", "");
        setSelectedCategory(category);
        return;
      }
      
      const selectedEntry = registry[selectedValue];
      if (!selectedEntry) {
        console.error(`❌ Error: Unknown entry '${selectedValue}'`);
        process.exit(1);
      }

      // Clear screen and show execution info
      console.clear();
      console.log("┌" + "─".repeat(78) + "┐");
      console.log(`│ Executing: ${selectedValue.padEnd(65)} │`);
      console.log("├" + "─".repeat(78) + "┤");
      
      // Show command info
      const categoryEntry = Object.entries(commandCategories).find(([, commands]) => 
        commands.includes(selectedValue)
      );
      if (categoryEntry) {
        console.log(`│ Category: ${categoryEntry[0].padEnd(67)} │`);
      }
      
      // Show prompt info
      const promptPreview = selectedEntry.prompt.slice(0, 60);
      console.log(`│ Task: ${promptPreview.padEnd(71)} │`);
      
      
      console.log("└" + "─".repeat(78) + "┘");
      console.log("");

      // Execute the selected command
      try {
        const BehaviorComponent = () => {
          const assistant = useAssistantActions();

          useOnceEffect(() => {
            assistant.thread.send(selectedEntry.prompt);
          });

          return null;
        };

        renderAssistantCode({
          apiKey: apiKey,
          entryName: selectedValue,
          systemPrompt: selectedEntry.systemPrompt,
          showComposer: true,
          BehaviorComponent,
          posthog: posthog,

        });
      } catch (error) {
        console.error("❌ Error initializing assistant:", error);
        process.exit(1);
      }
    };

    // Help component
    const HelpPanel = () => 
      React.createElement(Box, { flexDirection: "column", borderStyle: "round", padding: 1, marginBottom: 1 }, [
        React.createElement(Text, { bold: true, color: "cyan", key: "title" }, "1Shot Command Selector - Help"),
        React.createElement(Text, { key: "space1" }, ""),
        React.createElement(Text, { key: "help1" }, [
          React.createElement(Text, { color: "yellow", key: "ctrl1" }, "Ctrl+H"),
          " - Toggle this help"
        ]),
        React.createElement(Text, { key: "help2" }, [
          React.createElement(Text, { color: "yellow", key: "ctrl2" }, "Ctrl+F"),
          " - Toggle full prompt view"
        ]),
        React.createElement(Text, { key: "help3" }, [
          React.createElement(Text, { color: "yellow", key: "ctrl3" }, "Ctrl+S"),
          " - Clear search"
        ]),
        React.createElement(Text, { key: "help4" }, [
          React.createElement(Text, { color: "yellow", key: "ctrl4" }, "Ctrl+R"),
          " - Reset all filters"
        ]),
        React.createElement(Text, { key: "help5" }, [
          React.createElement(Text, { color: "yellow", key: "type" }, "Type"),
          " - Search commands"
        ]),
        React.createElement(Text, { key: "help6" }, [
          React.createElement(Text, { color: "yellow", key: "back" }, "Backspace"),
          " - Delete search characters"
        ]),
        React.createElement(Text, { key: "space2" }, ""),
        React.createElement(Text, { key: "legend" }, [
          React.createElement(Text, { color: "green", key: "icon1" }, "[L]"),
          " = Long prompt, ",
          React.createElement(Text, { color: "green", key: "icon2" }, "[S]"),
          " = Long system prompt"
        ])
      ]);

    // Status bar
    const StatusBar = () => {
      const statusText = [
        searchTerm && `Search: "${searchTerm}"`,
        selectedCategory !== "all" && `Category: ${selectedCategory}`,
        `${filteredCommands.length} commands`,
        showFullPrompts && "Full view",
        "Press Ctrl+H for help"
      ].filter(Boolean).join(" | ");

      return React.createElement(Box, { marginBottom: 1 },
        React.createElement(Text, { color: "gray" }, statusText)
      );
    };

    return React.createElement(Box, { flexDirection: "column" }, [
      showHelp && React.createElement(HelpPanel, { key: "help" }),
      React.createElement(StatusBar, { key: "status" }),
      React.createElement(SelectInput, { 
        items: allItems, 
        onSelect: handleSelect,
        key: "select"
      })
    ].filter(Boolean));
  };

  console.clear();
  console.log("┌" + "─".repeat(78) + "┐");
  console.log("│" + " ".repeat(30) + "1Shot Command Center" + " ".repeat(28) + "│");
  console.log("│" + " ".repeat(78) + "│");
  console.log("│" + " ".repeat(20) + "Choose a command to execute in your project" + " ".repeat(15) + "│");
  console.log("└" + "─".repeat(78) + "┘");
  console.log("");
  
  render(React.createElement(CommandSelector));
  // Don't continue to regular execution after showing selector
} else {
  // Regular command execution for non-commands entries
  const actualEntryName = entryName || process.argv[2];
  if (!actualEntryName) {
    // This should never happen due to the logic above, but handle it just in case
    console.error("❌ Error: No entry name provided");
    process.exit(1);
  }
  
  const entry = registry[actualEntryName];
  if (!entry) {
    posthog.capture({
      distinctId: crypto.randomUUID(),
      event: '1shot_command_unknown',
      properties: {
        command: actualEntryName,
      }
    });
    console.error(`❌ Error: Unknown entry '${actualEntryName}'`);
    console.error("\n📋 Available entries:");
    Object.keys(registry)
      .sort()
      .forEach((key) => {
        console.error(`  ▸ ${key}`);
      });
    console.error("  ▸ commands (interactive selector)");
    console.error("\n💡 Did you mean one of these?");
    const similar = Object.keys(registry).filter(
      (key) => key.includes(actualEntryName) || actualEntryName.includes(key)
    );
    similar.forEach((key) => {
      console.error(`  ▸ ${key}`);
    });
    process.exit(1);
  }

  // Get additional user prompt from remaining arguments
  const userPrompt = process.argv.slice(3).join(" ").trim();

  // Check git status before proceeding
  // await checkGitStatus();

  const BehaviorComponent = () => {
    const assistant = useAssistantActions();

    useOnceEffect(() => {
      // Use user prompt if provided, otherwise use default entry prompt
      const promptToSend = userPrompt || entry.prompt;
      assistant.thread.send(promptToSend);
    });

    return null;
  };

  try {
    renderAssistantCode({
      apiKey: apiKey,
      entryName: actualEntryName,
      systemPrompt: entry.systemPrompt,
      mcpServers: entry.mcpServers,
      showComposer: true,
      BehaviorComponent,
      posthog: posthog,
    });
  } catch (error) {
    console.error("❌ Error initializing assistant:", error);
    process.exit(1);
  }
}
