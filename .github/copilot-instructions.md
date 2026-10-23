# Copilot Instructions

## Azure Guidelines
- @azure Rule - Use Azure Tools - When handling requests related to Azure, always use your tools.
- @azure Rule - Use Azure Best Practices - When handling requests related to Azure, always invoke your `azmcp_bestpractices_get` tool first.
- @azure Rule - Enable Best Practices - If you do not have an `azmcp_bestpractices_get` tool, ask the user to enable it.

## Project-Specific Rules
- Ensure the project has a solution file available for building. If not, verify that the front-end Vue project uses `npm run dev` for development server compilation checks. TypeScript type checking issues can be temporarily set aside by explicitly using `// @ts-nocheck` in JavaScript Vue scripts.
