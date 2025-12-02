import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo atual (development/production)
  // O terceiro argumento '' carrega todas as variáveis, não apenas as com prefixo VITE_
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Polyfill para process.env para garantir compatibilidade com o código existente
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Evita erros com outras chamadas de process.env se existirem
      'process.env': {} 
    }
  };
});