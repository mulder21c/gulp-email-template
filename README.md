# E-Mail Template & Dev Environment Scaffold

## Table of Contents

- [Installing](#installing)
- [Configure](#configure)
  + [`configure.js`](#configurejs)
  + [`accounts.js`](#accountsjs)
- [Publick Tasks](#public-tasks)
  + [Default Task](#default-task)
  + [`build` Task](#build-task)
  + [`sendMail` Task](#sendmail-task)
  + [`s3Deploy `Task](#s3deploy-task)
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

### `sendMail` Task

The task for testing on various email clients.

```bash
$ gulp sendMail
```

### `s3Deploy` Task

Uploading images resources to server.

```bash
$ gulp s3Deploy
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
}
```

### `accounts.js`

All settings are commented in the file. Uncomment and use the settings you need.

```javascript
module.exports = {
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
server image has been applied, you can use `production` by passing the value as the
mode argument.

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

run the `s3Deploy` task.

```bash
$ gulp s3Deploy
```

### Send email for inspecting product

run the `sendMail` task.

```bash
$ gulp sendMail
```
