import del from 'del';
import gulp from 'gulp';

import buildJS from './gulp/buildJS.js';
import lint from './gulp/lint.js';
import {test, reportsTest} from './gulp/test.js';

gulp.task('build:js', buildJS);
gulp.task('build:js:watcher', () => gulp.watch(['index.js', 'src/**'], ['build:js']));
gulp.task('build:js:watch', ['build:js', 'build:js:watcher']);

gulp.task('build', ['build:js']);

gulp.task('clean', () => del(['dist/', 'dist-es5-module/', 'coverage/', 'mochawesome/']));

gulp.task('dev', ['build:js:watch', 'test:watch']);

gulp.task('lint', lint);

gulp.task('test:run', test);
gulp.task('test:watcher', () => gulp.watch(['./src/**', './test/**'], ['test:run']));
gulp.task('test:watch', ['test:run', 'test:watcher']);
gulp.task('test:reports', reportsTest);
gulp.task('test', ['lint', 'test:reports']);
