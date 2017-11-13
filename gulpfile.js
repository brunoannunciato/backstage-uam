'use strict';

var gulp		 = require('gulp'),
	$			 = require('gulp-load-plugins')(),
	del			 = require('del'),
	autoprefixer = require('autoprefixer'),
	mqpacker	 = require('css-mqpacker'),
	browserSync  = require('browser-sync'),
	named		 = require('vinyl-named'),
	webpack 	 = require('webpack-stream'),
	pkg			 = require('./package.json');

var paths = {
	webpack : 'src/scripts/*.js',
	scripts: ['src/scripts/**/*.js', '!src/scripts/vendor/**/*.js'],
	styles  : ['src/styles/**/*.scss'],
	images  : 'src/imgs/**/*.{png,jpeg,jpg,gif,svg}',
	extras: ['src/*.*', 'src/pages/*.*', 'src/fonts/**/*', 'src/videos/**/*'],
	dest    : {
		scripts : 'dist/scripts',
		styles  : 'dist/css',
		images  : 'dist/imgs',
		extras  : 'dist',
		build: [ 'dist/**', '!dist/**/*.map' ]
	}
};

gulp.task('lint', function () {
	return gulp.src(paths.scripts)
		.pipe($.jshint())
		.pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', ['lint'], function () {

	return gulp.src(paths.webpack)
		.pipe($.plumber())
		.pipe(named())
		.pipe(webpack({
			output: {
				filename: '[name].min.js'
			},
			externals: {
				'jquery': 'jQuery'
			},
			resolve: {
				modules: [ 'src/scripts', 'node_modules']
			},
			plugins: [
				$.util.env.production ? new webpack.webpack.optimize.UglifyJsPlugin({
					minimize: true,
					compress: {
						warnings: false
					}
				}) : $.util.noop,
			],
			devtool: $.util.env.production ? '': '#source-map'
		}))
		.pipe(gulp.dest(paths.dest.scripts));
});

gulp.task('styles', function () {
	return gulp.src(paths.styles)
		.pipe($.plumber())
		.pipe($.util.env.production ? $.util.noop() : $.sourcemaps.init() )
		.pipe($.sass({
			outputStyle: $.util.env.production ? 'compressed' : 'nested',
			includePaths: [
				'src/styles',
				'node_modules',
				'node_modules/bootstrap-sass/assets/stylesheets'
			]
		}).on('error', $.sass.logError))
		.pipe($.postcss([ autoprefixer(), mqpacker({sort: true}) ]))
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest(paths.dest.styles));
});

gulp.task('images', function () {
	return gulp.src(paths.images)
		.pipe($.plumber())
		.pipe($.newer(paths.dest.images))
		.pipe($.imagemin({
			optimizationLevel: $.util.env.production ? 5 : 1,
			progressive: true,
			interlaced: true
		}))
		.pipe(gulp.dest(paths.dest.images));
});

gulp.task('extras', function () {
	return gulp.src(paths.extras, {base: 'src'})
		.pipe($.newer(paths.dest.extras))
		.pipe(gulp.dest(paths.dest.extras));
});

gulp.task('clean', function () {
	return del([paths.dest.extras]);
});

gulp.task('serve', ['watch'], function () {
	browserSync({
		files: [ 'dist/**', '!dist/**/*.map' ],
		server: {
			baseDir: ['dist']
		},
		open: !$.util.env.no
	});
});

gulp.task('watch', ['scripts', 'styles', 'images', 'extras'], function(){
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.styles, ['styles']);
	gulp.watch(paths.images, ['images']);
	gulp.watch(paths.extras, ['extras']);
});

gulp.task('default', ['clean'], function () {
	gulp.start('serve');
});

gulp.task('bump', function(){
	return gulp.src('./package.json')
		.pipe($.bump())
		.pipe(gulp.dest('.'));
});

gulp.task('zip', function(){
	var pkg = JSON.parse(require('fs').readFileSync('package.json'));

	return gulp
		.src(paths.dest.build)
		.pipe($.zip('build-v' + pkg.version + '-' + pkg.name + '.zip'))
		.pipe(gulp.dest('build'));
});

gulp.task('build', ['images', 'styles', 'scripts', 'extras', 'bump'], function(){
	gulp.start(['zip']);
});

gulp.task('deploy', ['clean'], function(){
	$.util.env.production = true;
	gulp.start('build');
});