const path = require('path');
const gulp = require('gulp');
const del = require('del');
const inquirer = require('inquirer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const fs = require('fs');

// include some language specs before processing all other languages
// as others depend on thesed
var prismScripts = [
  'prismjs/components/prism-core.min', // this is the core prism library
  'prismjs/components/prism-markup.min',
  'prismjs/components/prism-clike.min',
  'prismjs/components/prism-c.min',
  'prismjs/components/prism-javascript.min',
  'prismjs/components/prism-css.min',
  'prismjs/components/prism-ruby.min',
  'prismjs/components/prism-cpp.min'
].map(require.resolve);

prismScripts.push(
  path.join(path.dirname(require.resolve('prismjs/components/prism-core')), 'prism-*.min.js')
);
// include custom prism languages
prismScripts.push('./prism/min/prism-abap.js');

// add the needed plugins to the prism file
prismScripts = prismScripts.concat(
  [
    'prismjs/plugins/line-numbers/prism-line-numbers.min',
    'prismjs/plugins/toolbar/prism-toolbar.min',
    'prismjs/plugins/show-language/prism-show-language.min'
    // 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min'
  ].map(require.resolve)
);

gulp.task('clean', function() {
  return del('dist/**/*');
});

gulp.task('addBuildPath', done => {
  const questions = [
    {
      type: 'input',
      name: 'rootPath',
      message: `Root path to SharePoint-Site`,
      default: 'site'
    },
    {
      type: 'input',
      name: 'addonsFolder',
      message: 'Name of the folder for the addons',
      default: 'addons'
    }
  ];

  return inquirer.prompt(questions).then(answer => {
    let { rootPath, addonsFolder } = answer;
    const buildPath = {
      rootPath,
      addonsFolder
    };

    fs.writeFileSync('config/buildpath.json', JSON.stringify(buildPath));
  });
});

gulp.task('check-buildconfig', done => {
  try {
    require.resolve('./config/buildpath.json');
    done();
  } catch (e) {
    return done('Please run task "addBuildPath" before running "build"');
  }
});

gulp.task(
  'build',
  gulp.series('clean', 'check-buildconfig', done => {
    require('./build/build.js')(done);
  })
);

gulp.task('minify-prism', () =>
  gulp
    .src('./prism/prism-abap.js')
    .pipe(uglify())
    .pipe(gulp.dest('./prism/min'))
);

gulp.task('build-prism-lib', () =>
  gulp
    .src(prismScripts)
    .pipe(concat('prism.js'))
    .pipe(gulp.dest(path.dirname(require.resolve('prismjs'))))
);

gulp.task('build-prism', gulp.series('minify-prism', 'build-prism-lib'));
