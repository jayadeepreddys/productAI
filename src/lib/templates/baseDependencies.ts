export const baseDependencies = {
  dependencies: {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16",
    "@heroicons/react": "^2.0.18",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  devDependencies: {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  }
};

export const basePackageJson = `{
  "name": "preview-server",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": ${JSON.stringify(baseDependencies.dependencies, null, 2)},
  "devDependencies": ${JSON.stringify(baseDependencies.devDependencies, null, 2)}
}`; 