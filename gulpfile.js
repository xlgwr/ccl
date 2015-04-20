var gulp = require('gulp');
var concat = require('gulp-concat');


var paths = {
    scripts:['app/vendor/js/**/*.js'],
    styles:['app/vendor/style/*.css']
};

gulp.task('scripts',function(){
    return gulp.src(paths.scripts)
        .pipe(concat('cclclient.js'))
	.pipe(gulp.dest('app/dist/js'));
});

//the default task (call by gulp)
gulp.task('default',['scripts']);
