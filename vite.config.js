import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        dashboard: fileURLToPath(new URL('./index.html', import.meta.url)),
        login: fileURLToPath(new URL('./login.html', import.meta.url)),
        information: fileURLToPath(new URL('./information.html', import.meta.url)),
        company: fileURLToPath(new URL('./company.html', import.meta.url))
      }
    }
  }
});
