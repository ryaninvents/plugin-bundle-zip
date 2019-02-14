import gulp from 'gulp';
import gulpZip from 'gulp-zip';
import { promiseFromObjectStream } from './p-stream.js';
import fs from 'fs';
import { join } from 'path';

import { MessageError } from '@pika/types';

export async function beforeJob ({ out }) {
  const srcDirectory = join(out, 'dist-node/');
  if (!fs.existsSync(srcDirectory)) {
    throw new MessageError('"dist-node/" does not exist, or was not yet created in the pipeline.');
  }
}

export async function build ({ out, reporter, options = {} }) {
  const { preserve = false, sources = ['**'] } = options;
  const distNode = join(out, 'dist-node');

  const zipRoot = preserve ? out : distNode;

  await promiseFromObjectStream(
    gulp.src(sources, { cwd: zipRoot, base: zipRoot, root: zipRoot, dot: true, buffer: true })
      .pipe(gulpZip('dist-node.zip'))
      .pipe(gulp.dest(out))
  );

  reporter.created(join(out, 'dist-node.zip'), 'zip:node');
}
