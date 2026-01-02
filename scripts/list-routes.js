const app = require('../backend/server');

function listRoutes(app) {
  const routes = [];
  const routerStack = app._router ? app._router.stack : app.router ? app.router.stack : null;
  if (!app || !routerStack) {
    console.error('No router found on app');
    console.log('app keys sample:', Object.keys(app).slice(0, 20));
    console.log('app.use is function?', typeof app.use === 'function');
    console.log('app.handle is function?', typeof app.handle === 'function');
    console.log('app.stack?', app.stack);
    return routes;
  }
  routerStack.forEach((middleware) => {
    if (middleware.route) {
      // routes registered directly on the app
      const methods = Object.keys(middleware.route.methods).join(',');
      routes.push({ path: middleware.route.path, methods });
    } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
      // router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).join(',');
          routes.push({ path: handler.route.path, methods });
        }
      });
    }
  });
  return routes;
}

const routes = listRoutes(app);
console.log('App keys:', Object.keys(app));
console.log('Has _router?', !!app._router);
console.log('Registered routes:');
if (routes && routes.length) routes.forEach(r => console.log(`${r.methods.padEnd(6)} ${r.path}`));
console.log(`Total routes: ${routes.length}`);
