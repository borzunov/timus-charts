import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';

const $ = gulpLoadPlugins();

let debug = true;
let uglify = true;

gulp.task('content_scripts', () => {
    return gulp.src([
        'metadata.js',
        'compat.js',
        'styles.js',
        'locales.js',
        'templates.js',
        'element_observer.js',

        'submit.js',
        'author.js',
        'page_parser.js',
        'data_retriever.js',

        'line.js',
        'spin.js',
        'chart.js',

        'last_ac_highlighter.js',

        'content.js',
    ], {'cwd': 'app/content_scripts'})
        .pipe($.if(debug, $.sourcemaps.init()))
        .pipe($.babel())
        .pipe($.concat('timus.user.js'))
        .pipe($.if(uglify, $.uglify({
            preserveComments: (_, comment) => isMetadata(comment),
        })))
        .pipe($.if(debug, $.sourcemaps.write('.')))
        .pipe(gulp.dest('dist'));
});

function isMetadata(commentNode) {
    const value = commentNode.value.trimLeft();
    return value.startsWith('=') || value.startsWith('@');
}

gulp.task('lint', () => {
    return gulp.src(['**/*.js', '!spin.js'], {'cwd': 'app/content_scripts'})
        .pipe($.jshint())
        .pipe($.jshint.reporter('default'));
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
    gulp.watch('app/content_scripts/**/*.js', ['content_scripts', 'lint']);
});

gulp.task('clean', cb => del(['dist'], cb));

gulp.task('build', ['content_scripts', 'extras', 'lint']);

gulp.task('package-chrome', () => {
    return gulp.src('dist/**/*')
        .pipe($.zip('timus-charts.zip'))
        .pipe(gulp.dest(`./releases/v${getVersion()}/chrome`));
});

gulp.task('package-opera', () => {
    return gulp.src('dist/**/*')
        .pipe($.zip('timus-charts.zip'))
        .pipe(gulp.dest(`./releases/v${getVersion()}/opera`));
});

gulp.task('package-userjs', () => {
    return gulp.src('dist/timus.user.js')
        .pipe(gulp.dest(`./releases/v${getVersion()}/userjs`));
});

function getVersion() {
    return require('./dist/manifest.json').version;
}

gulp.task('default', ['clean'], cb => runSequence('build', cb));

gulp.task('package', cb => {
    debug = false;
    runSequence('clean', 'build', 'package-chrome', () => {
        uglify = false;
        runSequence('clean', 'build', ['package-opera', 'package-userjs'], cb);
    });
});
