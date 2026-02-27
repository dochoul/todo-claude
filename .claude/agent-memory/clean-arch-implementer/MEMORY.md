# Project Memory

## Project: todo-claude
- **Stack**: React 18 + TypeScript + Vite 5 + plain CSS (no UI libraries)
- **Root**: `/Users/david/Documents/todo-claude`
- **Language**: Korean UI text
- **Package manager**: npm

## Folder Structure
```
src/
  types/        # Shared TypeScript types (todo.ts)
  hooks/        # Custom React hooks (useTodos.ts)
  components/   # Each component in its own folder with co-located CSS
    AddTodo/
    CategoryFilter/
    TodoItem/
    TodoList/
  App.tsx / App.css
  main.tsx / index.css
```

## Architecture Notes
- No external UI libraries; all styling via plain CSS files co-located with components
- localStorage key: `'todos'` — synced via `useEffect` in `useTodos` hook
- Domain types live in `src/types/todo.ts` (Category, Todo, CATEGORIES, CATEGORY_COLORS)
- `useTodos` hook is the single source of truth for all todo state and actions
- Error handling: `loadFromStorage` wraps JSON.parse in try/catch, returns [] on failure

## CSS Conventions
- BEM-style class naming: `.component__element--modifier`
- Main color: `#5C6BC0` (Indigo)
- Light theme only (no dark backgrounds)
- Transitions on hover/active states for interactive elements
- Responsive breakpoint: `max-width: 600px`

## Build
- `npm run dev` to start dev server
- `npm run build` runs `tsc && vite build` — both TypeScript check and bundle
- TypeScript strict mode enabled with `noUnusedLocals`, `noUnusedParameters`
