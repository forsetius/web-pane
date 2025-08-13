#!/bin/env node
import { App } from './App.js';

const app = new App();
if (!app.hasLock) {
  process.exit(0);
}

void app.electron.whenReady().then(() => app.handleInvocation(process.argv));
