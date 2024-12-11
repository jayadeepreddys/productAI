const fs = require('fs');
const path = require('path');

const sourceWasmPath = path.join(process.cwd(), 'node_modules', 'esbuild-wasm', 'esbuild.wasm');
const targetWasmPath = path.join(process.cwd(), 'public', 'esbuild.wasm');

// Create public directory if it doesn't exist
if (!fs.existsSync(path.join(process.cwd(), 'public'))) {
  fs.mkdirSync(path.join(process.cwd(), 'public'));
}

// Copy the file
fs.copyFileSync(sourceWasmPath, targetWasmPath);
console.log('esbuild.wasm copied to public directory'); 