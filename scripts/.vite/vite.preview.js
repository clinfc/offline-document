import { defineConfig } from 'vite';
import consola from 'consola';

export default defineConfig({
  plugins: [
    {
      name: 'configure-preview-server',
      enforce: 'pre',
      configurePreviewServer({ config, httpServer }) {
        const { outDir } = config.build;
        httpServer?.once('listening', () => {
          consola.log('\n');
          consola.start(
            `当前启动的子服务: ${outDir}:${httpServer.address().port}`
          );
        });
      },
    },
  ],
});
