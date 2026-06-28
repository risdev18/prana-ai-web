import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vyronix.ai',
  appName: 'Vyronix',
  webDir: 'dist',
  server: {
    url: 'https://vyronix-web.vercel.app',
    cleartext: true
  },
  android: {
    backgroundColor: '#070514',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
