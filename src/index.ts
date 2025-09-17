#!/bin/env node
import 'reflect-metadata';
import { App } from './domain/App.js';

const app = new App();
if (!app.hasLock) {
  process.exit(0);
}

void app.electron.whenReady().then(() => {
  app.init();
  void app.handleInvocation(process.argv);
});
