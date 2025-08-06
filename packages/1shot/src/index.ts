#!/usr/bin/env node

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { render, useInput } from "ink";
import {
  useAssistantActions,
  useThreadStoreApi,
} from "@assistant-ui/react-core";
import { renderAssistantCode } from "./code";
import { registry } from "./registry";
import { spawn } from "cross-spawn";
import { createInterface } from "node:readline";
import SelectInput from "ink-select-input";

const useOnceEffect = (effect: () => void) => {
  const executed = useRef(false);

  useEffect(() => {
    if (!executed.current) {
      effect();
      executed.current = true;
    }
  }, []); // Add empty dependency array
};

// Function to check git status and warn user if needed
async function checkGitStatus(): Promise<void> {
  try {
    // Check if we're in a git repository
    const gitStatus = spawn("git", ["status"], { stdio: "pipe" });
    const gitStatusPromise = new Promise<boolean>((resolve) => {
      gitStatus.on("exit", (code: number | null) => resolve(code === 0));
      gitStatus.on("error", () => resolve(false));
    });

    if (!(await gitStatusPromise)) {
      console.log("⚠️  Warning: Not in a git repository 📁");
      console.log(
        "   This means your changes won't be tracked by version control 🚫"
      );
      console.log("   Consider initializing a git repository first 🔧\n");

      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve) => {
        rl.question("Press Enter to continue anyway... ⏎ ", () => {
          rl.close();
          resolve();
        });
      });
    }

    // Check if git working directory is clean
    const gitDiff = spawn("git", ["diff", "--quiet"], { stdio: "pipe" });
    const gitDiffPromise = new Promise<boolean>((resolve) => {
      gitDiff.on("exit", (code: number | null) => resolve(code === 0));
      gitDiff.on("error", () => resolve(true)); // Assume clean on error
    });

    if (!(await gitDiffPromise)) {
      console.log("⚠️  Warning: Git working directory is not clean 🔀");
      console.log("   You have uncommitted changes in your repository 📝");
      console.log(
        "   Consider committing or stashing your changes before proceeding 💾\n"
      );

      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve) => {
        rl.question("Press Enter to continue anyway... ⏎ ", () => {
          rl.close();
          resolve();
        });
      });
    }

    // Check if there are untracked files
    const gitLsFiles = spawn(
      "git",
      ["ls-files", "--others", "--exclude-standard"],
      { stdio: "pipe" }
    );
    let untrackedFiles = "";
    gitLsFiles.stdout?.on("data", (data: Buffer) => {
      untrackedFiles += data.toString();
    });

    const gitLsFilesPromise = new Promise<boolean>((resolve) => {
      gitLsFiles.on("exit", (code: number | null) => resolve(code === 0));
      gitLsFiles.on("error", () => resolve(true)); // Assume no untracked files on error
    });

    await gitLsFilesPromise;

    if (untrackedFiles.trim()) {
      console.log(
        "⚠️  Warning: You have untracked files in your repository 📄"
      );
      console.log(
        "   Consider adding them to .gitignore or committing them 📋\n"
      );

      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve) => {
        rl.question("Press Enter to continue anyway... ⏎ ", () => {
          rl.close();
          resolve();
        });
      });
    }
  } catch (error) {
    console.log("⚠️  Warning: Could not check git status ❓");
    console.log("   Continuing anyway... 🚀\n");
  }
}

const entryName = process.argv[2];
if (!entryName) {
  console.error("📖 Usage: 1shot <entry-name> [user request]");
  console.error("\n📋 Available entries:");
  Object.keys(registry)
    .sort()
    .forEach((key) => {
      console.error(`  ▸ ${key}`);
    });
  console.error("  ▸ commands (interactive selector)");
  process.exit(1);
}

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
if (entryName === "commands") {
  const CommandSelector = () => {
    const [showFullPrompts, setShowFullPrompts] = useState(false);

    const commands = Object.entries(registry).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    const items = commands.map(([key, entry]) => {
      // Extract emoji from prompt if available
      const emoji =
        entry.prompt.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u)?.[0] ||
        "▸";
      // Clean prompt text for preview
      const cleanPrompt = entry.prompt.replace(
        /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*/u,
        ""
      );

      // Determine if this is a long prompt
      const isLongPrompt = cleanPrompt.length > 1000;
      const isLongSystemPrompt =
        entry.systemPrompt && entry.systemPrompt.length > 1000;

      // Show truncated or full prompt based on toggle state and length
      let displayPrompt = cleanPrompt;
      let maxDisplayLength = 350;

      if (showFullPrompts && isLongPrompt) {
        // Show the full prompt when toggled to full view
        maxDisplayLength = Infinity;
        displayPrompt = cleanPrompt;
      } else if (!showFullPrompts && isLongPrompt) {
        displayPrompt =
          cleanPrompt.slice(0, 300) + `... (${cleanPrompt.length} chars)`;
      } else {
        // For shorter prompts, show first 300 chars by default
        displayPrompt = cleanPrompt.slice(0, 300);
      }

      // Add indicators for long prompts/system prompts
      let indicators = "";
      if (isLongPrompt || isLongSystemPrompt) {
        indicators = showFullPrompts ? " 📜 [expanded]" : " 📜 [Ctrl+F]";
      }

      const finalLabel = `${emoji} ${key} - ${displayPrompt.slice(
        0,
        maxDisplayLength
      )}${displayPrompt.length > maxDisplayLength ? "..." : ""}${indicators}`;

      return {
        label: finalLabel,
        value: key,
      };
    });

    // Handle toggle functionality and navigation
    useInput((input, key) => {
      if (key.ctrl && (input === "f" || input === "F")) {
        setShowFullPrompts(!showFullPrompts);
        return;
      }
    });

    const handleSelect = async (item: any) => {
      const selectedKey = item.value as string;
      const selectedEntry = registry[selectedKey];

      if (!selectedEntry) {
        console.error(`❌ Error: Unknown entry '${selectedKey}'`);
        process.exit(1);
      }

      // Clear the screen and show clean execution
      console.clear();
      console.log(`🎯 Executing Command: ${selectedKey}`);

      // Show full prompt/system prompt info if they're long
      const promptInfo = [];
      if (selectedEntry.prompt.length > 1000) {
        promptInfo.push(
          `📝 Prompt (${
            selectedEntry.prompt.length
          } chars): ${selectedEntry.prompt.slice(0, 200)}...`
        );
      }
      if (
        selectedEntry.systemPrompt &&
        selectedEntry.systemPrompt.length > 1000
      ) {
        promptInfo.push(
          `🔧 System Prompt (${
            selectedEntry.systemPrompt.length
          } chars): ${selectedEntry.systemPrompt.slice(0, 200)}...`
        );
      }

      if (promptInfo.length > 0) {
        console.log(promptInfo.join("\n"));
        console.log("");
      }

      // Execute the selected command immediately
      try {
        const BehaviorComponent = () => {
          const assistant = useAssistantActions();

          useOnceEffect(() => {
            assistant.thread.send(selectedEntry.prompt);

            // assistant.thread.subscribe(() => {
            //   const state = assistant.thread.getState();
            //   if (!state.isRunning) {
            //     // Show summary before exiting
            //     console.log("\n" + "=".repeat(30));
            //     console.log("✅ Task Complete! 🎉");
            //     console.log("=".repeat(30));
            //     console.log(` Entry: ${selectedKey}`);
            //     console.log(` Original prompt: ${selectedEntry.prompt}`);
            //     if (selectedEntry.systemPrompt) {
            //       console.log(` System prompt: ${selectedEntry.systemPrompt}`);
            //     }
            //     console.log(` Assistant responses: ${state.messages.filter(msg => msg.role === "assistant").length}`);

            //     setTimeout(() => {
            //       process.exit(0);
            //     }, 3000); // Give user 3 seconds to see the summary
            //   }
            // });
          });

          return null;
        };

        renderAssistantCode({
          apiKey: apiKey,
          systemPrompt: selectedEntry.systemPrompt,
          showComposer: true,
          BehaviorComponent,
        });
      } catch (error) {
        console.error("❌ Error initializing assistant:", error);
        process.exit(1);
      }
    };

    return React.createElement(SelectInput, { items, onSelect: handleSelect });
  };

  console.log("🎯 Select a 1shot command:");
  render(React.createElement(CommandSelector));
  // Don't continue to regular execution after showing selector
} else {
  // Regular command execution for non-commands entries
  const entry = registry[entryName];
  if (!entry) {
    console.error(`❌ Error: Unknown entry '${entryName}'`);
    console.error("\n📋 Available entries:");
    Object.keys(registry)
      .sort()
      .forEach((key) => {
        console.error(`  ▸ ${key}`);
      });
    console.error("  ▸ commands (interactive selector)");
    console.error("\n💡 Did you mean one of these?");
    const similar = Object.keys(registry).filter(
      (key) => key.includes(entryName) || entryName.includes(key)
    );
    similar.forEach((key) => {
      console.error(`  ▸ ${key}`);
    });
    process.exit(1);
  }

  // Get additional user prompt from remaining arguments
  const userPrompt = process.argv.slice(3).join(" ").trim();

  // Check git status before proceeding
  await checkGitStatus();

  const BehaviorComponent = () => {
    const assistant = useAssistantActions();
    const threadApi = useThreadStoreApi();

    useOnceEffect(() => {
      // Use user prompt if provided, otherwise use default entry prompt
      const promptToSend = userPrompt || entry.prompt;
      assistant.thread.send(promptToSend);

      threadApi.subscribe(() => {
        const state = threadApi.getState();
        if (!state.isRunning) {
          // Show summary before exiting
          console.log("\n" + "=".repeat(30));
          console.log("✅ Task Complete! 🎉");
          console.log("=".repeat(30));
          console.log(` Entry: ${entryName}`);
          if (userPrompt) {
            console.log(` Request: ${userPrompt}`);
          }
          console.log(` Original prompt: ${promptToSend}`);
          if (entry.systemPrompt) {
            console.log(` System prompt: ${entry.systemPrompt}`);
          }
          console.log(
            ` Assistant responses: ${
              state.messages.filter((msg) => msg.role === "assistant").length
            }`
          );

          setTimeout(() => {
            process.exit(0);
          }, 3000); // Give user 3 seconds to see the summary
        }
      });
    });

    return null;
  };

  try {
    renderAssistantCode({
      apiKey: apiKey,
      systemPrompt: entry.systemPrompt,
      showComposer: true,
      BehaviorComponent,
    });
  } catch (error) {
    console.error("❌ Error initializing assistant:", error);
    process.exit(1);
  }
}
