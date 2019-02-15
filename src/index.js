import gulp from 'gulp';
import gulpZip from 'gulp-zip';
import { promiseFromObjectStream } from './p-stream.js';
import fs from 'fs';
import es from 'event-stream';
import Vinyl from 'vinyl';
import { join } from 'path';

import { MessageError } from '@pika/types';

export async function beforeJob ({ out }) {
  const srcDirectory = join(out, 'dist-node/');
  if (!fs.existsSync(srcDirectory)) {
    throw new MessageError('"dist-node/" does not exist, or was not yet created in the pipeline.');
  }
}

export async function build ({ out, reporter, manifest, options = {} }) {
  const {
    preserve = false,
    sources = ['**'],
    directory = 'dist-node',
    bundleName = 'node',
    manifest: includeManifest = preserve
  } = options;
  const distNode = join(out, directory);
  const zipName = `dist-${bundleName}.zip`;

  const zipRoot = preserve ? out : distNode;

  const sourcesStream = gulp.src(sources, { cwd: zipRoot, base: zipRoot, root: zipRoot, dot: true, buffer: true });

  if (includeManifest) {
    const pkgJson = new Vinyl({
      cwd: zipRoot,
      base: zipRoot,
      path: join(zipRoot, 'package.json'),
      contents: Buffer.from(JSON.stringify(manifest, null, 2))
    });
    sourcesStream.push(pkgJson);
  }

  await promiseFromObjectStream(
    sourcesStream
      .pipe(gulpZip(zipName))
      .pipe(gulp.dest(out))
  );

  reporter.created(join(out, zipName), `zip:${bundleName}`);
}
