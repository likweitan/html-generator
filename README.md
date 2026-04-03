# Scaffl

Scaffl is a React + Vite app for generating HTML from parameterized templates. It opens with a default template loaded, lets you edit supported fields, preview the result live, inspect the generated markup, upload custom HTML templates, and export the final output as an `.html` file.

## Features

- Live HTML preview in an embedded iframe
- Default preset loaded on initial app startup
- Custom template upload with automatic `{{ placeholder }}` field detection
- Generated code dialog with copy support
- Save/export to a local `.html` file
- Light, dark, and system theme toggle
- Toast feedback for upload, save, clear, and validation states

## Stack

- React 18
- Vite 8
- Tailwind CSS 4
- shadcn/ui + Radix primitives
- Sonner for toast notifications
- Simple Icons for brand icons
- `file-saver` for exports
- `js-cookie` for persisted field values

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm

### Install

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Open the local Vite URL shown in the terminal, typically `http://localhost:5173`.

## Scripts

### `npm run dev`

Starts the Vite development server with hot reload.

### `npm start`

Alias for `npm run dev`.

### `npm run build`

Builds the production bundle into `dist/`.

### `npm run preview`

Serves the production build locally from `dist/`.

## Template Behavior

- Built-in templates are defined in [src/config/templateConfig.json](/Users/admin/Projects/html-generator/src/config/templateConfig.json).
- The app loads the first non-custom template by default on startup.
- Uploaded custom templates are scanned for placeholders like `{{ subject }}`.
- Detected placeholders become editable fields in the sidebar.

## Project Structure

- [src/components/Home.jsx](/Users/admin/Projects/html-generator/src/components/Home.jsx): main generator UI
- [src/components/theme-provider.jsx](/Users/admin/Projects/html-generator/src/components/theme-provider.jsx): app theme state
- [src/components/ui](/Users/admin/Projects/html-generator/src/components/ui): shared UI primitives
- [src/utils/templateConfig.jsx](/Users/admin/Projects/html-generator/src/utils/templateConfig.jsx): template config helpers
- [src/config/templateConfig.json](/Users/admin/Projects/html-generator/src/config/templateConfig.json): template metadata and default fields
