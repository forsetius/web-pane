import { dialog } from 'electron';

export function quitWithFatalError(app: Electron.App, message: string): void {
  const show = () => {
    dialog.showErrorBox('Error', message);
    app.exit(1);
  };

  if (app.isReady()) {
    show();
  } else {
    app.once('ready', show);
  }
}
