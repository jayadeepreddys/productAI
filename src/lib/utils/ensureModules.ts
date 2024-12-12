import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { baseDependencies } from '../templates/baseDependencies';

const execAsync = promisify(exec);

export async function ensureModules(previewServerPath: string) {
  try {
    const packageJsonPath = path.join(previewServerPath, 'package.json');
    
    // Read current package.json
    const currentPackageJson = JSON.parse(
      await fs.readFile(packageJsonPath, 'utf-8')
    );

    // Check if we need to update dependencies
    let needsUpdate = false;
    
    // Check dependencies
    for (const [dep, version] of Object.entries(baseDependencies.dependencies)) {
      if (currentPackageJson.dependencies[dep] !== version) {
        needsUpdate = true;
        currentPackageJson.dependencies[dep] = version;
      }
    }

    // Check devDependencies
    for (const [dep, version] of Object.entries(baseDependencies.devDependencies)) {
      if (currentPackageJson.devDependencies[dep] !== version) {
        needsUpdate = true;
        currentPackageJson.devDependencies[dep] = version;
      }
    }

    if (needsUpdate) {
      // Write updated package.json
      await fs.writeFile(
        packageJsonPath,
        JSON.stringify(currentPackageJson, null, 2)
      );

      // Install dependencies
      console.log('Installing dependencies...');
      await execAsync('npm install', { cwd: previewServerPath });
      console.log('Dependencies installed successfully');
    }

  } catch (error) {
    console.error('Error ensuring modules:', error);
    throw error;
  }
} 