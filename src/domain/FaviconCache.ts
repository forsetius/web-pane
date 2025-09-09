import { net, WebContents } from 'electron';

export type IconDataUrl = string; // "data:image/png;base64,..."

export class FaviconCache {
  private map = new Map<string, IconDataUrl>();

  public get(id: string): IconDataUrl | undefined {
    return this.map.get(id);
  }

  public attach(id: string, wc: WebContents) {
    wc.on('page-favicon-updated', (_e, favicons) => {
      const url = favicons[0];
      if (!url) return;
      void this.fetchAsDataUrl(url)
        .then((dataUrl) => this.map.set(id, dataUrl))
        .catch(() => void 0);
    });
  }

  private async fetchAsDataUrl(url: string): Promise<IconDataUrl> {
    return new Promise((resolve, reject) => {
      const request = net.request(url);
      const chunks: Buffer[] = [];
      let mime = 'image/png';

      request.on('response', (res) => {
        const ct = res.headers['content-type'];
        if (Array.isArray(ct)) mime = String(ct[0]).split(';')[0] ?? mime;
        else if (typeof ct === 'string') mime = ct.split(';')[0] ?? mime;

        res.on('data', (d) =>
          chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)),
        );
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          const b64 = buf.toString('base64');
          resolve(`data:${mime};base64,${b64}`);
        });
      });

      request.on('error', reject);
      request.end();
    });
  }
}
