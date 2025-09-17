export {};

declare global {
  namespace Electron {
    interface Session {
      __webpane_ua_spoof_installed?: boolean;
    }
  }
}
