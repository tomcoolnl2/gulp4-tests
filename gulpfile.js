// GULP
var gulp = require('gulp');                     // https://www.npmjs.com/package/gulp
var del = require('del');                       // https://www.npmjs.com/package/del
var runSequence = require('run-sequence');      // https://www.npmjs.com/package/run-sequence (temporary until gulp 4.0 comes out)
var webserver = require('gulp-webserver');      // https://www.npmjs.com/package/gulp-webserver
var path = require('path');

// HTML
var pug = require('gulp-pug');                  // https://www.npmjs.com/package/gulp-pug

// CSS
var sass = require('gulp-sass');                // https://www.npmjs.com/package/gulp-sass
var postcss = require('gulp-postcss');          // https://www.npmjs.com/package/gulp-postcss
var autoprefixer = require('autoprefixer');     // https://www.npmjs.com/package/autoprefixer

// JS (ES6)
var babelify = require('babelify');             // https://www.npmjs.com/package/babelify
var browserify = require('browserify');         // https://www.npmjs.com/package/browserify
var buffer = require('vinyl-buffer');           // https://www.npmjs.com/package/vinyl-buffer
var source = require('vinyl-source-stream');    // https://www.npmjs.com/package/vinyl-source-stream
var uglify = require('gulp-uglify');            // https://www.npmjs.com/package/gulp-uglify

// SVG
var svgstore = require('gulp-svgstore');        // https://www.npmjs.com/package/gulp-svgstore
var svgmin = require('gulp-svgmin');            // https://www.npmjs.com/package/gulp-svgmin



// TASKS FOR DEVELOPMENT: run these while developing
gulp.task('default', ['build']);

// 'Build'; Use this task for day-to-day development.
gulp.task('build', function (callback) {
    runSequence('clean',
        ['css', 'pug', 'js', 'sprites', 'copy', 'watch'],
        'webserver',
        callback);
});

// 'Package'; Use this task to only build a package ('dest' folder).
gulp.task('package', function (callback) {
    runSequence('clean',
        ['css', 'pug', 'js', 'sprites', 'copy'],
        callback);
});
gulp.task('clean', ['clean']);


// SEPARATE TASKS: you could run them separately via the command line, but why would you?
// HELP
gulp.task('help', function () {
    console.log(
        '\n ' + '***',
        '\n ',
        '\n ' + 'Front-end boiler',
        '\n ',
        '\n ' + 'Available commands:',
        '\n ' + '  gulp ' + '\t - Displays this information.',
        '\n ' + '  gulp build ' + '\t - Use this task for day-to-day development. It builds the \'dest\' folder, sets up a local webserver and watches for changes.',
        '\n ' + '  gulp package ' + ' - Use this task to only build a package (\'dest\' folder). Primarily used for building artifacts with Docker.',
        '\n ',
        '\n ' + '***',
        '\n '
    );
});

// HTML
gulp.task('pug', function () {
    return gulp.src('_src/html/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('dest'));
});

// CSS
gulp.task('css', function () {
    return gulp.src('_src/css/**/*.scss')
        .pipe(sass({
            // outputStyle: 'expanded'
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(postcss([
            autoprefixer({
                browsers: ['last 5 versions']
            })
        ]))
        .pipe(gulp.dest('dest/static/css'))
});

// JS
gulp.task('js', function () {
    return browserify({
        entries: '_src/js/main.js',
        // debug: true
    })
    .transform('babelify', { presets: [['env']], sourceMaps: true })
    .bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('dest/static/js'))
});

// SVG
gulp.task('sprites', function () {
    return gulp.src('_src/sprite/**/*.svg')
        .pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore())
        .pipe(gulp.dest("dest/static/img/svg"));
});

// WATCH
gulp.task('watch', function () {
    gulp.watch('_src/css/**/*.scss', ['css']);
    gulp.watch('_src/html/**/*.pug', ['pug']);
    gulp.watch('_src/js/**/*.js', ['js']);
    gulp.watch('_src/sprite/**/*.svg', ['sprites']);

    // copies new files when something changed
    gulp.watch('_src/img/**', ['copy']);
    gulp.watch('_src/fonts/*', ['copy']);
    gulp.watch('_src/json/*', ['copy']);
    gulp.watch('_src/uploads/**', ['copy']);
});

// CLEAN
gulp.task('clean', function () {
    return del([
        'dest/*'
    ]);
});

// COPY
gulp.task('copy', function () {
    gulp.src('_src/img/**')
        .pipe(gulp.dest('dest/static/img'))
    gulp.src('_src/fonts/*')
        .pipe(gulp.dest('dest/static/fonts'))
    gulp.src('_src/json/*')
        .pipe(gulp.dest('dest/static/json'))
    gulp.src('_src/uploads/**')
        .pipe(gulp.dest('dest/uploads'))
});

// WEBSERVER
gulp.task('webserver', function () {
    var port = 8000;
    gulp.src('./dest')
        .pipe(webserver({
            host: '0.0.0.0',
            livereload: false,
            directoryListing: false,
            open: 'http://localhost:' + port,
            port: port
        }));
});