# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.5+ web application using the App Router, React 19, TypeScript, and Tailwind CSS v4. The project is bootstrapped with `create-next-app` and uses Turbopack for fast builds.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm build

# Start production server
npm start

# Run ESLint
npm run lint
```

The development server runs at http://localhost:3000 with hot module reloading enabled.

## Architecture

### App Router Structure
- `src/app/` - Next.js App Router directory
  - `layout.tsx` - Root layout with Geist font configuration and global styles
  - `page.tsx` - Homepage component
  - `globals.css` - Global styles with Tailwind imports and CSS custom properties

### Styling
- Uses Tailwind CSS v4 with PostCSS plugin (`@tailwindcss/postcss`)
- Custom theme configuration via `@theme inline` in `globals.css`
- CSS custom properties for `--background` and `--foreground` with automatic dark mode support
- Geist Sans and Geist Mono fonts loaded via `next/font/google` and exposed as CSS variables

### TypeScript Configuration
- Path alias: `@/*` maps to `./src/*`
- Strict mode enabled
- Target: ES2017

### Build System
- Turbopack enabled for both dev and build commands
- ESLint configured with Next.js core web vitals and TypeScript rules

## Key Patterns

When adding new pages or routes, create them under `src/app/` following the App Router conventions. Use the existing layout for consistent font loading and styling.

For styling, use Tailwind utility classes and reference the custom properties defined in `globals.css` (`--background`, `--foreground`, `--font-geist-sans`, `--font-geist-mono`).
