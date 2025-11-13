const express = require('express');
const path = require('path');
const requestIp = require('request-ip');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

const port = process.env.PORT || 3000;

// Security: Add security headers to protect against common vulnerabilities
// This sets headers like X-Content-Type-Options, X-Frame-Options, etc.
// Configure CSP to allow Bootstrap CDN for educational purposes
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "https://cdn.jsdelivr.net"],
        scriptSrc: ["'self'"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://ipapi.co"],
      },
    },
  })
);

// Rate limiting: Prevent abuse by limiting requests per IP address
// Students learn about resource protection and API quota management
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(requestIp.mw());

// Health check endpoint for Google Cloud Platform monitoring
// GCP uses this to verify the app is running correctly
app.get('/_health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle favicon requests to prevent 404 errors in browser console
app.get('/favicon.ico', (_req, res) => {
  res.status(204).end(); // 204 No Content
});

// Apply rate limiting to the API endpoint to prevent abuse
app.get('/api/client-info', apiLimiter, async (req, res) => {
  // Determine if the request is coming from localhost
  let ip = req.clientIp;
  if (ip === '::1' || ip === '127.0.0.1') {
    ip = 'localhost';
  }

  // Get the full user-agent string from headers
  const userAgent = req.headers['user-agent'] || 'Unknown';

  // Fetch geolocation data only if not localhost
  let locationData = {};
  if (ip !== 'localhost') {
    try {
      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      locationData = response.data;
    } catch (error) {
      console.log('Geolocation API request failed:', error.message);
    }
  } else {
    locationData = {
      city: 'N/A',
      region: 'N/A',
      country: 'N/A',
      latitude: 'N/A',
      longitude: 'N/A',
    };
  }

  // Send response with client info
  res.json({
    ip,
    userAgent, // Display the full user-agent string here
    locationData: {
      city: locationData.city || 'N/A',
      region: locationData.region || 'N/A',
      country: locationData.country || 'N/A',
      latitude: locationData.latitude || 'N/A',
      longitude: locationData.longitude || 'N/A',
    }
  });
});

const server = app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});

// Graceful shutdown handler for cloud environments
// When GCP stops the instance, it sends SIGTERM signal
// This ensures all connections are closed properly before shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
