import React, { useState } from "react";
import { Box, Text, useFocus, useInput } from "ink";

interface PermissionRequestProps {
  tool_name: string;
  input: any;
  onApprove: () => void;
  onDeny: () => void;
}

export const PermissionRequest: React.FC<PermissionRequestProps> = ({
  tool_name,
  input,
  onApprove,
  onDeny,
}) => {
  const [selectedOption, setSelectedOption] = useState<"approve" | "deny">(
    "approve"
  );

  const { isFocused } = useFocus({ autoFocus: true });

  useInput((_input, key) => {
    if (!isFocused) return;
    if (key.upArrow || key.downArrow) {
      setSelectedOption((prev) => (prev === "approve" ? "deny" : "approve"));
    } else if (key.return) {
      if (selectedOption === "approve") {
        onApprove();
      } else {
        onDeny();
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text>⏺</Text>
        <Box flexDirection="column">
          <Text>
            <Text bold>Permission Request</Text>
          </Text>
          <Box flexDirection="column">
            <Text>
              <Text bold>Tool:</Text> {tool_name}
            </Text>
            <Text>
              <Text bold>Input:</Text> {JSON.stringify(input)}
            </Text>
            <Text> </Text>
            <Text dimColor>Use ↑/↓ to select, Enter to confirm</Text>
            <Text> </Text>
            <Box>
              <Text
                color={isFocused && selectedOption === "approve" ? "green" : "white"}
              >
                {selectedOption === "approve" ? "▶ " : "  "}✅ Approve
              </Text>
            </Box>
            <Box>
              <Text color={isFocused && selectedOption === "deny" ? "red" : "white"}>
                {selectedOption === "deny" ? "▶ " : "  "}❌ Deny
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
