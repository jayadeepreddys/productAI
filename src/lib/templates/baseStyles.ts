export const baseStylesTemplate = `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #f9fafb;
  --foreground: #111827;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
}

@layer base {
  body {
    @apply bg-background text-foreground;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors;
  }
  
  .input-field {
    @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm;
  }

  .card {
    @apply bg-white rounded-lg shadow-sm p-6;
  }
}
`; 