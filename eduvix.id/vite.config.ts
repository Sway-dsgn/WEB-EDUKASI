import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'safeguard-fetch',
        transform(code, id) {
          if (id.includes('formdata-polyfill')) {
            // Safe replacement of fetch assignment with try-catch
            const searchStr = "global.fetch = function (input, init) {";
            if (code.includes(searchStr)) {
              console.log('Applying safeguard compatibility patch to formdata-polyfill fetch assignment.');
              
              // We replace the outer fetch patching block safely
              const patchedCode = code.replace(
                "global.fetch = function (input, init) {",
                "try { global.fetch = function (input, init) {"
              ).replace(
                "return _fetch.call(this, input, init)\n    }\n  }",
                "return _fetch.call(this, input, init)\n    }\n    } catch (e) { console.warn('formdata-polyfill fetch sandbox error bypassed:', e); }\n  }"
              ).replace(
                "return _fetch.call(this, input, init)\r\n    }\r\n  }",
                "return _fetch.call(this, input, init)\r\n    }\r\n    } catch (e) { console.warn('formdata-polyfill fetch sandbox error bypassed:', e); }\r\n  }"
              );
              
              return {
                code: patchedCode,
                map: null
              };
            }
          }
          return null;
        }
      },
      react(),
      tailwindcss()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
