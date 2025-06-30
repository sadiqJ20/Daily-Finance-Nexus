# Daily Finance Nexus

Daily Finance npm runis a modern web application built with Vite, React, TypeScript, shadcn-ui, and Tailwind CSS. It provides dashboards and tools to help shopkeepers manage loans, payments, analytics, and daily collections.

## Getting Started

### Prerequisites

- Node.js >= 18
- npm (comes with Node) or pnpm / yarn

### Installation

```bash
# Clone the repository
$ git clone <YOUR_GIT_URL>
$ cd daily-finance-nexus-main

# Install dependencies
$ npm install
```

### Development

```bash
# Start the dev server at http://localhost:8080
$ npm run dev
```

### Production build

```bash
$ npm run build
```

### Preview production build locally

```bash
$ npm run preview
```

## Tech Stack

- Vite
- React 18
- TypeScript
- shadcn-ui (Radix UI + Tailwind design system)
- Tailwind CSS
- React Router DOM
- TanStack Query

## Project Structure

```
.
├── src
│   ├── components      # Reusable UI & domain components
│   ├── hooks           # Custom React hooks
│   ├── pages           # Route-level pages
│   ├── lib             # Utility helpers
│   └── main.tsx        # Application entry point
└── vite.config.ts      # Vite configuration
```

## License

This project is licensed under the MIT License.
