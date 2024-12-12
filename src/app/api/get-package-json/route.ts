import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const fileContents = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(fileContents);
    
    // Only return dependencies and devDependencies for security
    return NextResponse.json({
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {}
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read package.json' },
      { status: 500 }
    );
  }
} 