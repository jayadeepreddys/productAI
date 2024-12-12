import fs from 'fs/promises';
import path from 'path';

const BASE_FILES = [
  'app/layout.tsx',
  'app/globals.css',
  'tailwind.config.ts',
  'postcss.config.js',
  'package.json',
  'tsconfig.json',
];

export async function cleanupPreviewFiles(baseDir: string) {
  try {
    // Clean app directory
    const appDir = path.join(baseDir, 'src/app');
    const files = await fs.readdir(appDir, { recursive: true });
    
    for (const file of files) {
      const fullPath = path.join(appDir, file.toString());
      const relativePath = path.relative(baseDir, fullPath);
      
      // Skip base files
      if (BASE_FILES.includes(relativePath)) {
        continue;
      }
      
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        await fs.rm(fullPath, { recursive: true });
      } else {
        await fs.unlink(fullPath);
      }
    }

    // Clean components directory
    const componentsDir = path.join(baseDir, 'src/components');
    await fs.rm(componentsDir, { recursive: true, force: true });
    await fs.mkdir(componentsDir, { recursive: true });

  } catch (error) {
    console.error('Error cleaning up preview files:', error);
    throw error;
  }
} 