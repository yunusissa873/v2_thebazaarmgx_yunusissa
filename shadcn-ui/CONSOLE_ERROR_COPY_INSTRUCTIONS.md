# How to Copy Console Errors

## Method 1: Right-Click on Console (Easiest)

1. **Open Browser Console**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)
   - Or right-click page → "Inspect" → "Console" tab

2. **Copy All Errors**
   - Right-click anywhere in the console
   - Select "Save as..." or "Save all messages to file"
   - This saves all console output to a text file

## Method 2: Select and Copy Text

1. **Select Errors**
   - Click and drag to select the error messages
   - Or click on an error, then press `Ctrl+A` (Windows) or `Cmd+A` (Mac) to select all

2. **Copy**
   - Press `Ctrl+C` (Windows) or `Cmd+C` (Mac)
   - Or right-click → "Copy"

## Method 3: Use Console API (Programmatic)

Run this in the console to copy all errors:

```javascript
// Copy all console errors to clipboard
const errors = [];
const originalError = console.error;
console.error = function(...args) {
  errors.push(args.join(' '));
  originalError.apply(console, args);
};

// After errors occur, run:
copy(errors.join('\n'));
```

## Method 4: Browser-Specific

### Chrome/Edge
1. Open Console (F12)
2. Click the filter icon (funnel)
3. Select "Errors" and "Warnings"
4. Right-click → "Save as..."

### Firefox
1. Open Console (F12)
2. Click the settings gear icon
3. Select "Persist Logs"
4. Right-click → "Copy All Messages"

### Safari
1. Open Developer Tools (Cmd+Option+I)
2. Go to Console tab
3. Right-click → "Export Messages"

## Quick Copy Script

Run this in the console to get a formatted list of all errors:

```javascript
// Get all errors and warnings
const allErrors = [];
const allWarnings = [];

// Override console methods temporarily
const originalError = console.error;
const originalWarn = console.warn;

console.error = function(...args) {
  allErrors.push({
    type: 'error',
    message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '),
    stack: new Error().stack
  });
  originalError.apply(console, args);
};

console.warn = function(...args) {
  allWarnings.push({
    type: 'warning',
    message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')
  });
  originalWarn.apply(console, args);
};

// After page loads and errors occur, run this:
setTimeout(() => {
  const report = `
=== CONSOLE ERROR REPORT ===
Generated: ${new Date().toISOString()}

ERRORS (${allErrors.length}):
${allErrors.map((e, i) => `${i + 1}. ${e.message}`).join('\n')}

WARNINGS (${allWarnings.length}):
${allWarnings.map((w, i) => `${i + 1}. ${w.message}`).join('\n')}
  `.trim();
  
  console.log(report);
  // Try to copy to clipboard
  if (navigator.clipboard) {
    navigator.clipboard.writeText(report).then(() => {
      console.log('✅ Report copied to clipboard!');
    });
  } else {
    console.log('📋 Copy the report above manually');
  }
}, 5000);
```

