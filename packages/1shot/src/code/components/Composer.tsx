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
import { registry } from "../../registry";

export const Composer: React.FC = () => {
  const { composer } = useAssistantActions();
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
  const [ellipses, setEllipses] = useState('');
  const columns = stdout?.columns ?? 80;

  // Sync external input → offset
  useEffect(() => {
    setOffset(input.length);
  }, [input]);

  // Animated ellipses for running state
  useEffect(() => {
    if (!isRunning) {
      setEllipses('');
      return;
    }

    const interval = setInterval(() => {
      setEllipses((prev) => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning]);

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
        minHeight={3}
        flexDirection="column"
      >
        
        <Box>
          <Text>{"> "}</Text>
          <Text>{renderedValue}</Text>
        </Box>
      </Box>
      
      <Box marginTop={1} flexDirection="column" minHeight={2}>
        {isRunning ? (
          <Text color="red">
            1Shot Running{ellipses}
          </Text>
        ) : (
          <Text color="yellow" dimColor>
            {message}
          </Text>
        )}
        <Text dimColor>
          Add more context and press Enter to send. 
        </Text>
      </Box>
    </Box>
  );
};
