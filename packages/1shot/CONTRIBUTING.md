# Contributing to 1shot

This guide explains how to add new registry items to the 1shot CLI tool.

## Adding New Registry Items

The 1shot tool uses a registry system to store predefined tasks. Each registry entry can have a default prompt and an optional system prompt.

### Registry Structure

Registry entries are defined in `src/registry.ts`:

```typescript
export const registry: Record<string, RegistryEntry> = {
  "entry-name": {
    systemPrompt: "Optional system instructions for the AI assistant",
    prompt: "Default user prompt when no custom prompt is provided"
  }
};
```

### Step-by-Step Guide

1. **Open `src/registry.ts`** in the 1shot package

2. **Add your entry to the registry object in alphabetical order**:
   ```typescript
   const registry: Record<string, RegistryEntry> = {
     // ... existing entries ...
     "your-entry-name": {
       systemPrompt: "You are an expert in [domain]. [Additional context or instructions]",
       prompt: "Default task description"
     }
   };
   ```
   
   **Important**: Keep entries sorted alphabetically by key name to maintain consistency and make it easier to find entries.

3. **Choose appropriate values**:
   - **Entry name**: Should be lowercase, hyphen-separated (e.g., `create-api`, `fix-tests`)
   - **systemPrompt** (optional): Provides context and expertise to the assistant. This is useful for:
     - Specifying the assistant's role or expertise
     - Providing background information
     - Setting behavioral guidelines
   - **prompt**: The default prompt that will be sent if the user doesn't provide a custom one

### Examples

#### Example 1: Simple task without system prompt
```typescript
"fix-eslint": {
  prompt: "Fix all ESLint errors and warnings in the project"
}
```

#### Example 2: Complex task with system prompt
```typescript
"optimize-performance": {
  systemPrompt: "You are a performance optimization expert. Focus on identifying bottlenecks, reducing bundle sizes, and improving runtime performance. Always measure performance impact before and after changes.",
  prompt: "Analyze and optimize the performance of this application"
}
```

#### Example 3: Integration task
```typescript
"integrate-tailwind": {
  systemPrompt: "You are an expert in Tailwind CSS integration. You know the best practices for setting up Tailwind in various frameworks and build tools.",
  prompt: "Set up Tailwind CSS in this project with a proper configuration"
}
```

### Usage

Once added, users can invoke your registry entry in two ways:

1. **Using the default prompt**:
   ```bash
   1shot your-entry-name
   ```

2. **With a custom prompt**:
   ```bash
   1shot your-entry-name "Custom instructions for the task"
   ```

When a custom prompt is provided, it replaces the default prompt but the system prompt remains active.

### Best Practices

1. **Keep entry names descriptive but concise**
2. **Use system prompts to provide expertise and context** that applies regardless of the specific user request
3. **Make default prompts actionable** - they should clearly describe what needs to be done
4. **Consider common variations** - if users might phrase a task differently, consider adding multiple entries
5. **Test your entries** before submitting to ensure they work as expected

### Testing Your Registry Entry

After adding a new entry:

1. Build the project:
   ```bash
   npm run build
   ```

2. Test with the default prompt:
   ```bash
   1shot your-entry-name
   ```

3. Test with a custom prompt:
   ```bash
   1shot your-entry-name "Specific instructions"
   ```

### Submitting Your Contribution

1. Ensure your code follows the existing style
2. Test your registry entry thoroughly
3. Submit a pull request with:
   - A clear description of the registry entry
   - Example usage
   - Any special considerations

Thank you for contributing to 1shot!