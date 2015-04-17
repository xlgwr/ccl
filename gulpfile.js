var gulp = require('gulp');
var concat = require('gulp-concat');


var paths = {
    scripts:['vendor/js/**/*.js'],
    styles:['vendor/style/*.css']
};

gulp.task('scripts',function(){
    return gulp.src(paths.scripts)
        .pipe(concat('ccl.js'))
	.pipe(gulp.dest('dist/js'));
});

//the default task (call by gulp)
gulp.task('default',['scripts']);
