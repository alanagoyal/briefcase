# Refined Code Style Guidelines

## 1. Naming Conventions
- Use camelCase for variable and function names, and PascalCase for component names.
- Use descriptive and concise names for variables, functions, and components.

## 2. Code Structure
- Organize imports at the top of files, separating third-party imports from local imports.
- Use a component-based architecture with reusable UI components.
- Separate logic into functions for better readability and maintainability.
- Consistently use React hooks (useState, useEffect, useCallback) and custom hooks.
- Define interfaces for component props at the top of component files.
- Use default exports for components.
- Organize components in a 'components' directory, following a modular structure.

## 3. Documentation
- Write descriptive and concise commit messages (e.g., "fix: responsive height issue").

## 4. Error Handling
- Use try-catch blocks for error handling, especially in asynchronous operations.
- Provide detailed error messages and use console.error for logging errors.

## 5. Performance
- Prefer 'force-dynamic' over 'edge' runtime for better compatibility in Next.js.

## 6. Security
- Use environment variables for sensitive information like API keys.

## 7. Formatting and Styling
- Use Tailwind CSS utility classes for consistent styling.
- Implement responsive design, using dynamic units (e.g., h-dvh instead of h-screen) for better mobile responsiveness.
- Use template literals for dynamic class names and string interpolation.
- Maintain consistent indentation and spacing (consider using a code formatter like Prettier).
- Use backticks for multi-line string literals.

## 8. Language and Framework
- Use TypeScript consistently, including proper type annotations.
- Write React components as functional components with hooks.
- Utilize Next.js framework features and file structure conventions.

## 9. Code Quality and Best Practices
- Use ESLint for code linting.
- Implement centralized type definitions.
- Use the optional chaining operator (?.) when accessing potentially undefined properties.

## 10. Internationalization
- Use next-intl for internationalization support.
- Use the t() function for translations in components.

## 11. User Interface
- Implement theme support (e.g., dark/light mode) using next-themes.
- Follow mobile-first design principles.

## 12. Functionality
- Support rendering Markdown content using react-markdown and related plugins.