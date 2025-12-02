import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Prioridade: Variável carregada pelo Vite > Variável de sistema (Vercel)
  const apiKey = env.API_KEY || process.env.API_KEY;

  // Log de diagnóstico para o Build do Vercel
  if (!apiKey) {
    console.warn('⚠️ AVISO: API_KEY não encontrada durante o build. O app pode não funcionar corretamente.');
  } else {
    console.log('✅ SUCESSO: API_KEY encontrada e injetada no build.');
  }

  return {
    plugins: [react()],
    define: {
      // Injeta a chave no código do cliente
      'process.env.API_KEY': JSON.stringify(apiKey),
      // Polyfill para evitar erros de referência a process
      'process.env': {}
    }
  };
});