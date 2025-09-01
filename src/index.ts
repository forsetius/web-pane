#!/bin/env node
import { App } from './domain/App.js';

const app = new App();
if (!app.hasLock) {
  process.exit(0);
}

void app.electron.whenReady().then(() => {
  app.init();
  app.handleInvocation(process.argv.slice(2));
});
