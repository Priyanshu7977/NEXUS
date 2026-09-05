import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function nexusApiPlugin() {
  return {
    name: 'nexus-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith('/api/v1')) {
          try {
            const { handleApiV1Request } = await server.ssrLoadModule('/src/api/v1/router.ts');
            let body: any = null;
            if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
              const buffers: any[] = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const data = Buffer.concat(buffers).toString();
              try {
                body = data ? JSON.parse(data) : {};
              } catch {
                body = data;
              }
            }

            const apiResponse = await handleApiV1Request({
              method: req.method,
              path: req.url,
              headers: req.headers,
              body,
            });

            res.statusCode = apiResponse.status;
            for (const [k, v] of Object.entries(apiResponse.headers)) {
              res.setHeader(k, v);
            }
            res.end(JSON.stringify(apiResponse.body));
            return;
          } catch (err: any) {
            console.error('[NEXUS Vite API Middleware Error]:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: err.message || 'Server error' } }));
            return;
          }
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nexusApiPlugin()],
  server: {
    port: 5180,
    host: '127.0.0.1',
    strictPort: false,
  },
});
