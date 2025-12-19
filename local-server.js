import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authHandler from './api/imagekit-auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple .env loader since dotenv might not be installed
console.log("Loading environment variables...");
try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                process.env[key] = value;
            }
        });
        console.log("Loaded .env file successfully.");
    } else {
        console.warn("No .env file found at:", envPath);
    }
} catch (e) {
    console.error("Could not load .env file", e);
}

const PORT = 3000;

const server = createServer(async (req, res) => {
    // Add CORS headers for local development access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/api/imagekit-auth') {
        console.log("Request received for /api/imagekit-auth");

        // Mocking Vercel-like Response object
        const mockRes = {
            setHeader: (k, v) => res.setHeader(k, v),
            status: (code) => {
                res.statusCode = code;
                return mockRes;
            },
            json: (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return mockRes;
            },
            end: (data) => res.end(data || '')
        };

        try {
            await authHandler(req, mockRes);
        } catch (e) {
            console.error("Handler error:", e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
        }
    } else {
        res.statusCode = 404;
        res.end('Not Found: ' + req.url);
    }
});

server.listen(PORT, () => {
    console.log(`\n✅ Local Backend Server running at http://localhost:${PORT}`);
    console.log(`   - Auth Endpoint: http://localhost:${PORT}/api/imagekit-auth`);
    console.log(`\n⚠️  Leave this terminal open while developing!\n`);
});
