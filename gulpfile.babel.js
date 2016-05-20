import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';

const $ = gulpLoadPlugins();

const DEBUG = true;

gulp.task('content_scripts', () => {
    // FIXME: don't transform metadata.js
    return gulp.src([
        'metadata.js',
        'compat.js',
        'styles.js',
        'locales.js',
        'templates.js',

        'submit.js',
        'author.js',
        'page_parser.js',
        'data_retriever.js',

        'line.js',
        'chart.js',

        'last_ac_highlighter.js',

        'content.js',
    ], {'cwd': 'app/content_scripts'})
        .pipe($.if(DEBUG, $.sourcemaps.init()))
        .pipe($.babel())
        .pipe($.concat('timus.user.js'))
        .pipe($.if(DEBUG, $.sourcemaps.write('.')))
        .pipe(gulp.dest('dist'));
});

gulp.task('extras', () => {
    return gulp.src([
        'app/*.js',
        'app/*.json',
        'app/*.png',
    ], {'base': 'app'})
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['build'], () => {
    gulp.watch('app/content_scripts/**/*.js', ['content_scripts']);
});

gulp.task('clean', cb => del(['dist'], cb));

gulp.task('build', ['content_scripts', 'extras']);

gulp.task('default', ['clean'], cb => runSequence('build', cb));
