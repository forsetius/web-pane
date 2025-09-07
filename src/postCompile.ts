import * as fs from 'node:fs';
import path from 'node:path';

const cjsFiles = fs.globSync(path.join(import.meta.dirname, 'preload/*.js'));
cjsFiles.forEach((file) => {
  fs.renameSync(file, file.replace(/.js$/, '.cjs'));
});

const htmlFiles = fs.globSync(
  path.join(import.meta.dirname, '../src/renderer/*.html'),
);
htmlFiles.forEach((file) => {
  fs.copyFileSync(file, file.replace(/\bsrc\b/, 'dist'));
});
