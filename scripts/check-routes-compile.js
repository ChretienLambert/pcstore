const app = require('../backend/server');
const ptr = require('../backend/node_modules/path-to-regexp');

function collectPaths(app) {
  const paths = [];
  const routerStack = app._router ? app._router.stack : app.router ? app.router.stack : null;
  if (!routerStack) return paths;
  routerStack.forEach((middleware) => {
    if (middleware.route) {
      paths.push(middleware.route.path);
    } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) paths.push(handler.route.path);
      });
    }
  });
  return paths;
}

const paths = collectPaths(app);
console.log('Found', paths.length, 'route paths to test');
let bad = 0;
for (const p of paths) {
  try {
    // try parsing with path-to-regexp
    ptr.parse(p);
  } catch (err) {
    bad++;
    console.error('Failed to parse route path:', p, '\n', err && err.message);
  }
}
if (!bad) console.log('All route paths parsed successfully');
else console.log('Found', bad, 'bad paths');
