const {src, dest, watch, lastRun, series, parallel} = require('gulp'),
  minimist = require('minimist'),
  log = require('fancy-log'),
  colors = require('ansi-colors'),
  argv = minimist(process.argv.slice(2)),
  gulpIf = require('gulp-if'),
  browserSync = require('browser-sync').create(),
  sass = require('gulp-sass')(require('sass')),
  inlineCss = require('gulp-inline-css'),
  imagemin = require('gulp-imagemin'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  del = require('del'),
  zip = require('gulp-zip'),
  srcReplacer = require('gulp-replace-image-src'),
  through = require('through2'),
  mail = require('nodemailer'),
  ses = require('nodemailer-ses-transport'),
  s3 = require('gulp-s3-upload'),
  ftp = require('vinyl-ftp'),
  accounts = require('./accounts.js'),
  config = require('./config.js'),
  {
    resolveZipFileName,
    resolveUrl,
    isEmpty,
  } = require('./helper');

const defaultConfig = {
  "zipFileName": "email.zip"
};

options = {
  ...defaultConfig,
  ...config,
};

const server = () => {
  browserSync.init({
    server: {
      baseDir: './dist'
    },
  });
}

const html = () => {
  return src('source/**/*.html')
    .pipe(inlineCss({
      applyStyleTags: true,
      applyLinkTags: true,
      removeStyleTags: true,
      removeLinkTags: true,
      removeHtmlSelectors: true
    }))
    .pipe(gulpIf(
      argv.mode != 'production',
      srcReplacer({
        prependSrc: resolveUrl(options.hostBaseUrl, options.hostPath),
        keepOrigin: false,
      })
    ))
    .pipe(dest('./dist'))
}

const css = () => {
  return src('source/scss/*.scss')
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(postcss([autoprefixer]))
    .pipe(dest('./tmp/css'))
}

const image = () => {
  return src('source/images/**.{jpeg,jpg,gif,png}', {since: lastRun(image)})
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
    ]))
    .pipe(dest('./dist/images'))
}

const watchTask = () => {
  watch('source/**/*.html', html)
    .on('change', browserSync.reload);
  watch('source/scss/**/*.scss', series(css, html))
    .on('change', browserSync.reload);
  watch('source/images/**.{jpg,gif,png}', image)
    .on('change', browserSync.reload);
}

const packing = () => {
  return src(['dist/**', '!dist/images/**'])
    .pipe(zip(resolveZipFileName(options.zipFileName)))
    .pipe(dest('./'))
}

const clean = () => {
  return del(['dist/', 'tmp/'])
    .then((paths) => {
      console.log('Files and folders that would be deleted:\n', paths.join('\n'));
    })
}

const build = (done) => {
  argv.mode = 'production';
  return series(clean, parallel(css, image), html, packing)(done)
};

const s3Deploy = (done) => {
  if(isEmpty(accounts.s3)) {
    log.error(
      colors.bold.red(`\u00D7 Cannot access S3!!`),
      colors.cyan(`Not defined AWS S3 Configure in account.js.`)
    );
    done();
    return;
  }

  const {Bucket, ACL, accessKeyId, secretAccessKey} = accounts.s3;
  const deployer = s3({accessKeyId, secretAccessKey});

  return src('dist/images/**')
    .pipe(deployer({
      Bucket,
      ACL,
      keyTransform: (filename) => {
        return `commit/email/${options.hostPath}/${filename}`;
      }
    }))
    .on('error', (err) => {
      log(colors.bold.red(err.message));
      done();
    })
}

const ftpDeploy = (done) => {
  if(isEmpty(accounts.ftp)) {
    log.error(
      colors.bold.red(`\u00D7 Cannot access FTP!!`),
      colors.cyan(`Not defined FTP Configure in account.js.`)
    );
    done();
    return;
  }

  const ftpConf = accounts.ftp;
  const conn = ftp.create({log, ...ftpConf});

  return src('dist/**', {buffer: false})
    .pipe(conn.newer(ftpConf.path))
    .pipe(conn.dest(ftpConf.path))
    .on('error', (err) => {
      log(colors.bold.red(err.message));
      done();
    });
}

const sendSES = (done) => {
  if (isEmpty(accounts.ses)) {
    log.error(
      colors.bold.red(`\u00D7 Cannot send email!!.\n`),
      colors.cyan(`Not defined AWS SES Configure in account.js`)
    );
    done();
    return;
  }
  if(!config.mail.from || isEmpty(config.mail.to)) {
    log.error(colors.bold.red(`\u00D7 Not defined e-Mail sender or receiver in config.js`));
    done();
    return;
  }

  const transporter = mail.createTransport( ses(accounts.ses) );

  return src('dist/*.html')
    .pipe(through.obj( function(file, enc, next) {
      if(file.isNull()) {
        log.error(colors.bold.red(`\u00D7 Email template wat not founded!!`));
        done();
        return;
      }

      if(file.isStream()) {
        log.error(colors.bold.red(`\u00D7 Streams not supported!!`));
        done();
        return;
      }

      const data = file.contents.toString('utf8');
      next(null, data);
    }))
    .on('data', html => {
      const settings = {
        ...config.mail,
        html,
      };
      settings.subject = settings.subject || `제목 없음`;

      transporter.sendMail(settings, (err, info) => {
        if (err) {
          console.log(`${colors.bold.red(err.message)}`);
          return;
        }
        console.log(colors.green(`successfully sent email from ${info.envelope.from} to ${info.envelope.to}`))
      })
    });
}

const sendSMTP = (done) => {
  if (isEmpty(accounts.smtp)) {
    log.error(
      colors.bold.red(`\u00D7 Cannot send email!!.\n`),
      colors.cyan(`Not defined SMTP Configure in account.js`)
    );
    done();
    return;
  }
  if(!config.mail.from || isEmpty(config.mail.to)) {
    log.error(colors.bold.red(`\u00D7 Not defined e-Mail sender or receiver in config.js`));
    return;
  }

  const transporter = mail.createTransport( accounts.smtp );
  return src('dist/*.html')
    .pipe(through.obj( function(file, enc, next) {
      if(file.isNull()) {
        log.error(colors.bold.red(`\u00D7 Email template wat not founded!!`));
        done();
        return;
      }

      if(file.isStream()) {
        log.error(colors.bold.red(`\u00D7 Streams not supported!!`));
        done();
        return;
      }

      const data = file.contents.toString('utf8');
      next(null, data);
    }))
    .on('data', html => {
      const settings = {
        ...config.mail,
        html,
      };
      settings.subject = settings.subject || `제목 없음`;

      transporter.sendMail(settings, (err, info) => {
        if (err) {
          console.log(`${colors.bold.red(err.message)}`);
          return;
        }
        console.log(colors.green(`successfully sent email from ${info.envelope.from} to ${info.envelope.to}`))
      })
    });
}

exports.default = series(parallel(css, image), html, parallel(server, watchTask))
exports.clean = clean;
exports.build = build;
exports.mail = series(
  build,
  done => {
    if(config.sendViaSMTP) sendSMTP(done);
    done();
  },
  done => {
    if(config.sendViaSES) sendSES(done);
    done();
  }
);
exports.deploy = series(
  build,
  done => {
    if(config.deployFTP) ftpDeploy(done);
    done();
  },
  done => {
    if(config.deployS3) s3Deploy(done);
    done();
  }
);