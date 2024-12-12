const next = require('next');
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Add security headers middleware
  server.use((req, res, next) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Security headers
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

    next();
  });

  // Enable CORS
  server.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }));

  // Parse JSON bodies
  server.use(express.json({ limit: '50mb' }));

  // Add logging middleware
  server.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Health check endpoint
  server.get('/api/health', (req, res) => {
    console.log('Health check requested');
    res.json({ status: 'ok' });
  });

  // Deploy endpoint
  server.post('/api/deploy', async (req, res) => {
    console.log('Deploy request received');
    try {
      const { files } = req.body;
      const baseDir = path.join(process.cwd(), 'src');
      const results = [];

      console.log('Files to deploy:', Object.keys(files));

      // Ensure base directories exist
      await fs.mkdir(path.join(baseDir, 'components'), { recursive: true });
      await fs.mkdir(path.join(baseDir, 'app'), { recursive: true });

      // Process each file
      for (const [filePath, content] of Object.entries(files)) {
        try {
          const fullPath = path.join(baseDir, filePath);
          console.log(`Processing: ${fullPath}`);

          // Create directory for the file
          await fs.mkdir(path.dirname(fullPath), { recursive: true });

          // Write the file
          await fs.writeFile(fullPath, content);
          
          // Verify file was written
          const stats = await fs.stat(fullPath);
          results.push({
            path: filePath,
            success: true,
            size: stats.size
          });

          console.log(`Successfully wrote ${filePath} (${stats.size} bytes)`);
        } catch (error) {
          console.error(`Error writing ${filePath}:`, error);
          results.push({
            path: filePath,
            success: false,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        message: 'Deployment completed',
        results
      });
    } catch (error) {
      console.error('Deploy error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process deployment'
      });
    }
  });

  // Handle all other routes with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3001, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3001');
  });
}); 