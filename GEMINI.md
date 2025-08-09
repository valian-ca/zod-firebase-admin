# Gemini Code Understanding

This document provides an overview of the `zod-firebase-admin` project, its structure, and how to work with it.

## Project Overview

This is a TypeScript monorepo that provides Zod-based schemas for Firestore. It contains two packages:

- `zod-firebase-admin`: For use with the `firebase-admin` SDK (server-side).
- `zod-firebase`: For use with the `firebase` SDK (client-side).

The core functionality of these packages is to provide a type-safe way to interact with Firestore collections and documents, using Zod for schema validation.

The project uses a builder pattern to define collections and their sub-collections in a structured and type-safe manner. A schema object is passed to a `collectionsBuilder` function, which returns a deeply nested object that mirrors the Firestore collection structure.

## Building and Running

This project uses `pnpm` as its package manager and `lerna` to manage the monorepo.

### Key Commands

- **Install dependencies:**
  ```bash
  pnpm install
  ```
- **Build all packages:**
  ```bash
  pnpm run compile
  ```
- **Run tests:**
  ```bash
  pnpm test
  ```
- **Run integration tests:**
  ```bash
  pnpm test:integration:ci
  ```
- **Type-check all packages:**
  ```bash
  pnpm run type-check
  ```
- **Lint all packages:**
  ```bash
  pnpm run eslint
  ```
- **Check formatting:**
  ```bash
  pnpm run prettier
  ```

## Development Conventions

### Coding Style

- **Formatting:** The project uses Prettier for code formatting. There is a `.prettierrc.json` file in the root of the project with the configuration.
- **Linting:** The project uses ESLint for linting. The configuration is in `eslint.config.mjs`.
- **Commit Messages:** The project follows the Conventional Commits specification. This is enforced by `commitlint` and a `husky` pre-commit hook.

### Testing

- **Unit Tests:** Each package has its own Jest configuration for unit tests (`jest.config.cjs`).
- **Integration Tests:** Each package also has a configuration for integration tests (`jest.integration.config.cjs`) that use the Firebase emulator.

### Architecture

The core of the library is the `collectionsBuilder` function, which takes a schema and returns a set of collections. The schema is a simple JavaScript object where the keys are collection names and the values define the collection's schema and any sub-collections.

This builder pattern allows for a declarative and type-safe way to define your Firestore database structure.
