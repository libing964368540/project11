var gulp = require('gulp'),
    rev = require('gulp-rev'), //- 对文件名加MD5后缀
    revCollector = require('gulp-rev-collector'), //- 路径替换
    uglify=require('gulp-uglify'),//js压缩
    minifyCss = require("gulp-minify-css"),//压缩CSS
    minifyHtml = require("gulp-minify-html"),//压缩html
    clean = require('gulp-clean');//- 清空文件夹，避免资源冗余

var web = {
    //源码地址
    srcPath:{
        html:'html/*.html',
        js: 'js/*.js',
        css:'css/*.css',
        images:'images/**/*'
    },
    //发布地址
    releasePath:'dist/'
}
//清空文件夹，避免资源冗余css
gulp.task('cleancss',function(){
    return gulp.src(web.releasePath,{read:false}).pipe(clean());
});
//CSS生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revCss', function() {
    return  gulp.src(web.srcPath.css)
        .pipe(rev())
        .pipe(minifyCss())
        .pipe(gulp.dest('dist/css/'))//- 输出文件本地
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css'));
});
//js生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revJs', function() {
    return gulp.src(web.srcPath.js)
        .pipe(rev())
        .pipe(gulp.dest('dist/js/'))//- 输出文件本地
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js'));
});
gulp.task('img', function() {
    return gulp.src(web.srcPath.images)
        .pipe(gulp.dest('dist/images/'));
});
gulp.task('font', function() {
    return gulp.src('font/*')
        .pipe(gulp.dest(web.releasePath+'font/'));
});
//Html更换css、js文件版本
gulp.task('revHtml', function() {
    return gulp.src(['rev/**/*.json', web.srcPath.html]) /*WEB-INF/views是本地html文件的路径，可自行配置*/
        .pipe(revCollector())
        .pipe(minifyHtml())
        .pipe(gulp.dest(web.releasePath+'html/')); /*Html更换css、js文件版本,WEB-INF/views也是和本地html文件的路径一致*/
});
gulp.task('default', gulp.series('cleancss','font','revCss','revJs','img','revHtml'))