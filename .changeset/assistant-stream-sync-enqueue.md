---
"@assistant-ui/react-core": patch
---

fix: write assistant stream operations before the stream closes, and don't close or error a stream the consumer already cancelled
