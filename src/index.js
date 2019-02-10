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

export async function build ({ out, reporter, options }) {
  const srcGlob = join(out, 'dist-node/**');

  await promiseFromObjectStream(
    gulp.src(srcGlob, { dot: true })
      .pipe(gulpZip('dist-node.zip'))
      .pipe(gulp.dest(out))
  );
}
