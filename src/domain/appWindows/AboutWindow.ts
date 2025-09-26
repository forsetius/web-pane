import { createRequire } from "node:module";
import { ipcMain } from "electron";
import { z } from "zod";
import { BaseDialogWindow } from "./BaseDialogWindow.js";

const require = createRequire(import.meta.url);
const packageJson = require("../../../package.json");

const manifestSchema = z.object({
    name: z.string().min(1),
    version: z.string().min(1),
    license: z.string().min(1),
    homepage: z.url(),
    author: z.object({
        name: z.string().min(1),
        url: z.url(),
    }),
    repository: z.url(),
    bugs: z.url(),
});

export class AboutWindow extends BaseDialogWindow {
    protected preloader = 'aboutPreload.cjs';
    protected htmlContent = 'about.html';
    private appInfo: AboutInfo | undefined = undefined;

    protected registerIpc(): void {
        if (ipcMain.listenerCount('about:get-info') > 0) return;

        ipcMain.handle('about:get-info', () => {
            if (!this.appInfo) {
                this.appInfo = this.getInfo();
            }

            return this.appInfo;
        });
    }

    private getInfo(): AboutInfo {
        const info = {
            name: packageJson?.name,
            version: packageJson?.version,
            author: {
                name: packageJson?.author?.name,
                url: packageJson?.author?.url,
            },
            license: packageJson?.license,
            homepage: packageJson?.homepage,
            repository: packageJson?.repository?.url,
            bugs: packageJson?.bugs?.url,
        };

        return manifestSchema.parse(info);
    }
}

export interface AboutInfo {
    name: string;
    version: string;
    author: {
        name: string;
        url: string;
    };
    license: string;
    homepage: string;
    repository: string;
    bugs: string;
}
