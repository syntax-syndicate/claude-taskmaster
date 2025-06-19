---
"task-master-ai": patch
---

Improve provider validation system with clean constants structure

- **Fixed "Invalid provider hint" errors**: Resolved validation failures for Azure, Vertex, and Bedrock providers
- **Refactored provider constants**: Replaced fragile array indices with clean named access (e.g., `CUSTOM_PROVIDERS.AZURE` vs `CUSTOM_PROVIDERS[0]`)
- **Enhanced maintainability**: Created centralized provider constants with both object and array exports for different use cases
- **Added missing provider support**: Implemented full validation logic for Azure and Vertex AI in model selection
- **Improved search UX**: Integrated `@inquirer/search` for better model discovery with real-time filtering
- **Better organization**: Moved custom provider options to bottom of model selection with clear section separators

This change ensures all custom providers (Azure, Vertex, Bedrock, OpenRouter, Ollama) work correctly in `task-master models --setup` and eliminates hardcoded provider validation throughout the codebase.
