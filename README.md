# E-Mail Template & Dev Environment Scaffold

## Table of Contents

- [Installing](#installing)
- [Configure](#configure)
  + [`configure.js`](#configurejs)
  + [`accounts.js`](#accountsjs)
- [Publick Tasks](#public-tasks)
  + [Default Task](#default-task)
  + [`build` Task](#build-task)
  + [`mail` Task](#mail-task)
  + [`deploy `Task](#deploy-task)
- [How to Use](#how-to-use)
    + [in development](#in-development)
    + [clean build](#clean-build)
    + [deploy images](#deploy-images)
    + [Send email for inspecting product](#send-email-for-inspecting-product)

## Installing

First, Install `gulp-cli` globally

for Windows:

```bash
$ npm install --global gulp-cli
```

For Mac/Linux:

```bash
$ sudo npm install --global gulp-cli
```

Then, install all dependencies

```bash
$ npm install
```

## Public Tasks

### Default task

This task contains the following jobs:

- Run local Web Server
- SCSS compiling, adding vendor prefix, inlining css into the HTML
- Image optimization
- Replacing relative path of image resources with image server link
- Watching changes of resources

```bash
$ gulp
```

### `build` Task

Cleaning `dist` and temporary directories then same as default task except
`Run local Web Server` and `Watching changes of resources`

```bash
$ gulp build
```

### `mail` Task

The task for testing on various email clients. <br>
You can choose email senders from `config.js` file.

```bash
$ gulp mail
```

### `deploy` Task

Uploading images resources to server.<br>
You can choose uploaders from `config.js` file.

```bash
$ gulp deploy
```


## Configure

### `configure.js`

```javascript
module.exports = {
  // Production server base-URL
  hostBaseUrl: "",

  // Production server path for email resources
  hostPath: "",

  // Name of the compressed file to be created by the build task
  zipFileName: "",

  // configure for email test
  // for details, see https://nodemailer.com/message/
  mail: {
    // email address of the sender
    from: "",
    // an array of recipients email addresses
    to: [
    ],
    // subject of email
    subject: "",
  }

  // Use FTP for deploy
  deployFTP: true,

  // Use AWS S3 for deploy
  deployS3: false,

  // Use SMTP for sending email
  sendViaSMTP: true,

  // Use AWS SES for sending email
  sendViaSES: false,
}
```

### `accounts.js`

All settings are commented in the file. Uncomment and use the settings you need.

<b style="color: red">※ Caution:</b>
You should keep your accounts private by running `git rm --cached accounts.js`
or by committing except `accounts.js` file.

```javascript
module.exports = {
  // for details, see https://github.com/morris/vinyl-ftp#ftpcreate-config-
  ftp: {
    // FTP host
    host: "",
    // FTP user
    user : "",
    // FTP password
    password: "",
    // Number of parallel transfers
    parallel: 5,
    // The remote path to upload to
    path: "",
  },

  // for details, see https://github.com/clineamb/gulp-s3-upload#gulp-s3-plugin-options
  s3: {
    // Access Key for S3
    accessKeyId: "",
    // Secret Key for S3
    secretAccessKey: "",
    // buckt name for S3
    Bucket: "",
    // AWS ACL
    ACL: "public-read",
  },

  // for details, see https://nodemailer.com/transports/ses/
  ses: {
    // AWS access key
    accessKeyId: "",
    // AWS secret key
    secretAccessKey: "",
    // Specify the region to send the service request to
    region: ""
  },

  // for details, see https://nodemailer.com/smtp/
  smtp: {
    // hostname or IP address to connect to
    host: "",
    // port to connect to
    port: "",
    // connection will use TLS when connecting to server.
    secure: true,
    // authentication data
    auth: {
      user: "",
      pass: "",
    }
  }
}
```

## How to Use

### in development

For normal development, you can use the default task.

```bash
$ gulp
```

If you want to put the image on the server and check the local server that the
server image has been applied, you can use `production` by passing the value as
the mode argument.

```bash
$ gulp --mode production
```

### clean build

just need to run the build task.

```bash
$ gulp build
```

Then, this will clean up existing build directories and temporary files,
create new build files, and create compressed file for delivery to the job requester.

If `zipFileName` in `config.js` is not set, the file will be created as `email.zip`.

If you just want to clean up the build directory and temporary files,
you just need to run the clean task.

```bash
$ gulp clean
```

### deploy images

run the `deploy` task.

```bash
$ gulp s3Deploy
```

Currently, you can deploy to FTP, S3, or both, depending on the config.js file
settings. <br>See [`configure.js`](#configurejs).

### Send email for inspecting product

run the `mail` task.

```bash
$ gulp mail
```

Currently, you can choose SMTP server or AWS SES, depending on the config.js
file settings. <br>See [`configure.js`](#configurejs).