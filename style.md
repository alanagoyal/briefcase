# Code Style Guidelines

## 1. Naming Conventions
- Use PascalCase for React component names (e.g., SettingsDialog, DialogContent).
- Use camelCase for variable, function, and method names.
- Use descriptive and meaningful names for variables, functions, and components.

## 2. Code Structure
- Organize components into separate files with a consistent structure.
- Implement modular component architecture for better code organization and reusability.
- Group related functionality together within files.
- Separate complex logic into dedicated functions for improved readability and maintainability.
- Prefer functional components and React hooks over class components.

## 3. Documentation
- Add comments to explain non-obvious or complex code sections.
- Use semantic commit messages for version control (e.g., "fix: responsive height issue").

## 4. Error Handling
- Implement proper error handling and logging throughout the application.
- Provide user feedback for errors, especially around API key validation and subscription management.

## 5. Performance
- Use React hooks like useCallback for performance optimization.
- Implement efficient rendering techniques such as memoization and lazy loading where appropriate.
- Carefully manage state updates to avoid unnecessary re-renders.

## 6. Security
- Use TypeScript for enhanced type safety throughout the codebase.
- Implement secure handling of API keys, allowing for user-provided keys when necessary.

## 7. Accessibility
- Ensure proper use of ARIA attributes and roles for improved accessibility.
- Utilize accessible UI components, such as those provided by Radix UI.

## 8. Responsive Design
- Implement mobile-first responsive design principles.
- Use dynamic viewport height (dvh) for better mobile responsiveness.
- Include conditional rendering based on mobile vs desktop views.

## 9. Internationalization
- Utilize a translation system (e.g., next-intl) for managing multilingual support.
- Use translation functions (e.g., `t` function) for translating strings throughout the application.

## 10. Styling
- Consistently use Tailwind CSS classes for styling components.
- Maintain a coherent styling approach across the application.

## 11. Code Formatting
- Use consistent indentation (2 or 4 spaces) throughout the codebase.
- Employ consistent spacing and line breaks to improve code readability.
- Use single quotes for string literals and template literals for string interpolation.

## 12. React and Next.js Best Practices
- Utilize React hooks (useState, useEffect, useCallback) for state management and side effects.
- Implement proper state management techniques.
- Use async/await for asynchronous operations.
- Prefer dynamic rendering over edge runtime for better compatibility and performance in Next.js applications.

## 13. Dependency Management
- Keep dependencies up-to-date and use the latest stable SDK versions.
- Properly document build steps and scripts in package.json.

## 14. Configuration Management
- Centralize configuration management using files like quetzal.config.json and next.config.mjs.
