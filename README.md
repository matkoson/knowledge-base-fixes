# ZSH Documentation Knowledge Base

A comprehensive system for scraping, processing, and serving ZSH documentation through a structured API.

## Features

- Comprehensive ZSH documentation scraping and processing
- SQLite database storage with cross-environment compatibility
- Robust MCP server with search and retrieval tools
- Fully typed TypeScript codebase with strict type checking
- Complete test suite for all components
- GitHub Actions CI/CD integration

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/matkoson/knowledge-base.git
   cd knowledge-base
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

This will also set up Git hooks for code quality enforcement.

## Development Workflow

Follow these steps to ensure code quality and maintainability:

1. **Make changes to the codebase**:
   - Follow file naming conventions: `snake_case` for files, `kebab-case` for directories
   - Use native Bun APIs wherever possible
   - Write tests for all new functionality

2. **Run quality checks**:
   ```bash
   # Lint the codebase
   bun run lint

   # Check TypeScript types
   bun run typecheck

   # Run tests
   bun test
   ```

3. **Commit your changes**:
   - Pre-commit hooks will automatically run to check code quality
   - Do NOT bypass hooks with `--no-verify` flag

4. **Push your changes**:
   - Pre-push hooks will verify build, tests, and type checking
   - GitHub Actions will run comprehensive CI checks

## Environment Compatibility

This project handles different environments (Bun, bundled, etc.) through our custom SQLite adapter. Key considerations:

- Native `bun:sqlite` is used in Bun runtime environments
- Mock/alternative adapters are used in bundled environments
- All database operations are wrapped with proper error handling

## License

This project is licensed under the MIT License - see the LICENSE file for details.