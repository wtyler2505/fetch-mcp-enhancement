# Fetch MCP Usage Guide

## 📘 Basic Usage

### Simple Fetch
```javascript
import FetchMCP from '@modelcontextprotocol/fetch-mcp';

const result = await FetchMCP.fetch('https://example.com');
console.log(result.content);
```

## 🔧 Configuration Options

### Fetch Configuration
```javascript
const options = {
  timeout: 5000,             // Request timeout in milliseconds
  retries: 3,                // Number of retry attempts
  convertToMarkdown: true,   // Automatic markdown conversion
  headers: {                 // Custom headers
    'User-Agent': 'CustomAgent/1.0'
  }
};

const result = await FetchMCP.fetch('https://example.com', options);
```

### Environment Configuration
Create a `fetch-mcp.config.json` in your project root:
```json
{
  "fetchTimeout": 10000,
  "maxRetries": 3,
  "logLevel": "info",
  "securityOptions": {
    "allowedDomains": ["example.com", "trusted.org"],
    "blockedDomains": ["suspicious.site"]
  }
}
```

### Security Configuration
```javascript
// Whitelist specific domains
const secureOptions = {
  securityOptions: {
    allowedDomains: ['trusted.com'],
    rateLimitPerMinute: 60
  }
};
```

## 🔍 Advanced Usage Scenarios

### Multiple URL Variations
```javascript
const urlVariations = await FetchMCP.generateUrlVariations('https://example.com');
```

### Direct Markdown Conversion
```javascript
const markdown = FetchMCP.convertToMarkdown(htmlContent);
```

### Error Handling
```javascript
try {
  const result = await FetchMCP.fetch('https://example.com');
} catch (error) {
  // Handle fetch errors
}
```

## 🛡️ Security Best Practices

1. Always validate and sanitize URLs
2. Use domain whitelisting
3. Implement rate limiting
4. Set reasonable timeouts
5. Handle potential network errors

## 📊 Performance Optimization

### Concurrent Fetches
```javascript
const urls = ['url1', 'url2', 'url3'];
const results = await Promise.all(
  urls.map(url => FetchMCP.fetch(url))
);
```

## 📝 Logging Configuration

### Log Levels
- `error`: Critical errors only
- `warn`: Warnings and errors
- `info`: General information
- `debug`: Detailed debugging info
- `trace`: Most verbose logging

```javascript
const logger = new Logger({ logLevel: 'debug' });
```

## 🚨 Error Scenarios

### Common Error Handling
```javascript
try {
  const result = await FetchMCP.fetch('https://problematic-site.com');
} catch (error) {
  if (error.type === 'SECURITY_VIOLATION') {
    // Handle blocked domain
  }
  if (error.type === 'NETWORK_ERROR') {
    // Handle network issues
  }
}
```

## 🔬 Debugging and Monitoring

### Fetch Request Tracing
```javascript
const result = await FetchMCP.fetch('https://example.com', {
  debug: true  // Enables comprehensive request tracing
});
```

## 📦 Extensibility

### Custom User Agents
```javascript
const customAgents = [
  'Mozilla/5.0 ...',
  'CustomBot/1.0 ...'
];
```

## 🌐 Browser vs Node.js Compatibility
- Full feature support in Node.js 16+
- Limited browser support with polyfills
