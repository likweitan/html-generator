# Scaffl

Scaffl is a modern, responsive web application for dynamic HTML template generation and visual preview. It provides a clean, dark-mode split-screen interface inspired by the OpenAI Playground that lets users build, populate, and preview dynamic HTML templates effortlessly.

## Features

- **Dynamic Field Extraction**: Upload and parse HTML templates automatically identifying dynamic fields enclosed in double curly braces (e.g., `{{ subject }}`).
- **Live Preview Canvas**: Real-time rendering of your populated templates in an embedded frame.
- **Modern Split-Screen Interface**: Contextual split-layout placing input controls on one side and a responsive HTML preview on the other. 
- **Code Export**: Easily copy or export your generated markup to seamlessly integrate it elsewhere.

## Technologies

This project has been modernized and migrated away from Create React App, taking advantage of next-generation build tools and functional styles:

- **Framework**: React 18
- **Build Tool**: Vite for instant server start and lightning-fast HMR
- **Styling**: Tailwind CSS v4 for utility-first styling and dynamic layouts
- **Components**: shadcn/ui and Radix Primitives for accessible, robust GUI elements
- **Fonts**: Geist Mono / Geist Sans (via `@fontsource-variable/geist`)

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

Clone the repository and install its dependencies:

```bash
npm install
```

### Available Scripts

In the project directory, you can run:

#### `npm run dev` (or `npm start`)
Runs the app in development mode using Vite. Open [http://localhost:5173](http://localhost:5173) (or the port Vite provides) to view it in the browser. The page will instantly hot-reload when making code changes.

#### `npm run build`
Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

#### `npm run preview`
Boots up a local static web server that serves the files from `dist` to preview the production build locally.

## License

MIT License
