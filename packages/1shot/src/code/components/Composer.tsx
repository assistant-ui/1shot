import React, { useState, useEffect, useRef } from "react";
import { Box, Text, useStdout, useInput } from "ink";
import {
  useAssistantActions,
  useThread,
  useComposer,
} from "@assistant-ui/react-core";
import { useTextInput } from "../hooks/useTextInput";
import { getPastedTextPrompt, type PastedText } from "../utils/paste";
import { CommandSelector, type RegistryEntry } from "./CommandSelector";

// 1shot registry - inline for now to avoid circular dependencies
const registry: Record<string, RegistryEntry> = {
  "hello-world": {
    systemPrompt: "You are a helpful assistant that replies with 'Hello, world!' 🌍",
    prompt: "👋 Reply with 'Hello, world!'",
  },
  "assistant-ui": {
    systemPrompt:
      'You are helping integrate assistant-ui into a project 🛠️. Use Deepwiki to understand installation steps. The GitHub repository is "assistant-ui/assistant-ui". To install assistant-ui, you typically use "npx -y assistant-ui@latest init".',
    prompt: "🤖 Integrate assistant-ui into this project",
  },
  readme: {
    systemPrompt: "You are helping create a README.md file for a project 📝.",
    prompt: "📄 Create a README.md file for this project.",
  },
  frenchify: {
    systemPrompt: "You are helping frenchify a project which means you are helping translate the project summary to French 🇫🇷.",
    prompt: "🇫🇷 Frenchify this project. Create a project called french-pdf.md and write the french summary in it.",
  },
  bug: {
    systemPrompt: "You are helping find and fix bugs in a project 🔍. Start by analyzing the codebase to identify potential issues like runtime errors, type errors, logic bugs, performance issues, or security vulnerabilities. Use available tools to examine code, run tests, and understand error patterns. Once you identify a bug, explain what's wrong and implement a proper fix 🛠️.",
    prompt: "🐛 Analyze this project to find and fix any bugs or issues",
  },
  'fix-next-build': {
    systemPrompt: "You are helping fix a build issue in a Next.js project 🏗️. Use Deepwiki to understand the build issue and the fix 📌.",
    prompt: "🔧 Fix this build issue in a Next.js project",
  },
  'upgrade-next': {
    systemPrompt: "You are helping upgrade a project to the latest version of Next.js 🚀. Use Deepwiki to understand the latest version of Next.js and the upgrade steps 📦.",
    prompt: "⚡ Upgrade this project to the latest version of Next.js",
  },
  'upgrade-react': {
    systemPrompt: "You are helping upgrade a project to the latest version of React 🎆. Use Deepwiki to understand the latest version of React and the upgrade steps 🔄.",
    prompt: "⚛️ Upgrade this project to the latest version of React",
  },
  'upgrade-typescript': {
    systemPrompt: "You are helping upgrade a project to the latest version of TypeScript 🔵. Use Deepwiki to understand the latest version of TypeScript and the upgrade steps 🌟.",
    prompt: "💙 Upgrade this project to the latest version of TypeScript",
  },
};

export const Composer: React.FC = () => {
  const { composer, thread } = useAssistantActions();
  const input = useComposer((c) => c.text);
  const isRunning = useThread((t) => t.isRunning);
  
  // Text‑mode state
  const { stdout } = useStdout();
  const [offset, setOffset] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [pastedTexts, setPastedTexts] = useState<PastedText[]>([]);
  const [showCommandSelector, setShowCommandSelector] = useState(false);
  const pasteCounterRef = useRef(1);
  // Handle Ctrl+C to cancel/clear instead of exiting
  const [ctrlCPressed, setCtrlCPressed] = useState(false);
  const columns = stdout?.columns ?? 80;

  // Sync external input → offset
  useEffect(() => {
    setOffset(input.length);
  }, [input]);

  // Paste handler
  const handlePaste = (text: string) => {
    const id = pasteCounterRef.current++;
    const prompt = getPastedTextPrompt(text, id);
    setPastedTexts((t) => [...t, { id, text, prompt }]);
    const newInput = input.slice(0, offset) + prompt + input.slice(offset);
    composer.setText(newInput);
    setOffset(offset + prompt.length);
  };



  // send logic to strip prompts then send
  const onSubmit = () => {
    const trimmedInput = input.trim();
    
    // Check for 1shot command trigger
    if (trimmedInput === '/1shot' || trimmedInput === '/commands') {
      setShowCommandSelector(true);
      composer.setText('');
      return;
    }
    
    let final = input;
    for (const p of pastedTexts) {
      final = final.replace(p.prompt, p.text);
    }
    composer.setText(final);
    setTimeout(() => {
      composer.send();
      setOffset(0);
      setPastedTexts([]);
      pasteCounterRef.current = 1;
    }, 0);
  };

  // Handle command selection
  const handleCommandSelect = (_: string, entry: RegistryEntry) => {
    setShowCommandSelector(false);
    // Send the selected command's prompt
    composer.setText(entry.prompt);
    setTimeout(() => {
      composer.send();
      setOffset(0);
      setPastedTexts([]);
      pasteCounterRef.current = 1;
    }, 0);
  };

  // Handle command selector cancellation
  const handleCommandCancel = () => {
    setShowCommandSelector(false);
  };

  const { renderedValue, onInput } = useTextInput({
    value: input,
    onChange: composer.setText,
    onSubmit,
    onMessage: (show, msg) => setMessage(show && msg ? msg : null),
    onPaste: handlePaste,
    multiline: true,
    cursorChar: " ",
    invert: (t) => `\x1b[7m${t}\x1b[27m`,
    themeText: (t) => t,
    columns: columns - 4,
    disableCursorMovementForUpDownKeys: false,
    externalOffset: offset,
    onOffsetChange: setOffset,
  });

  // Key handling
  useInput((char, key) => {
    // Don't process input if command selector is shown (it handles its own input)
    if (showCommandSelector) {
      return;
    }

    // Handle Ctrl+C to cancel/clear instead of exiting
    if (key.ctrl && char === 'c') {
      if (isRunning) {
        thread.cancel();
        setCtrlCPressed(true);
        setTimeout(() => setCtrlCPressed(false), 2000); // Show message for 2 seconds
      } else {
        // Clear input when not running
        composer.setText('');
        setCtrlCPressed(true);
        setTimeout(() => setCtrlCPressed(false), 1000); // Show message for 1 second
      }
      return;
    }

    // Always allow ESC to cancel (keep existing behavior)
    if (key.escape) {
      if (isRunning) {
        thread.cancel();
      } else {
        // Clear input when not running
        composer.setText('');
      }
      return;
    }

    // Process input regardless of running state for 1shot mode
    onInput(char, key);
  });

  // Show command selector if triggered
  if (showCommandSelector) {
    return (
      <CommandSelector
        registry={registry}
        onSelect={handleCommandSelect}
        onCancel={handleCommandCancel}
      />
    );
  }

  return (
    <Box flexDirection="column" minHeight={5}>
      <Box 
        borderColor="gray" 
        borderStyle="round" 
        paddingX={1} 
        paddingY={1}
        minHeight={3}
        flexDirection="column"
      >
        <Box>
          <Text>{"> "}</Text>
          <Text>{renderedValue}</Text>
        </Box>
      </Box>
      <Box marginTop={1} flexDirection="column" minHeight={2}>
        {ctrlCPressed ? (
          <Text color="yellow" dimColor>
            {isRunning ? "Operation cancelled. You can continue typing." : "Input cleared. You can continue typing."}
          </Text>
        ) : message ? (
          <Text color="yellow" dimColor>
            {message}
          </Text>
        ) : (
          <Text dimColor>
            Type your message and press Enter to send. Try "/commands" for quick commands.
          </Text>
        )}
      </Box>
    </Box>
  );
};
