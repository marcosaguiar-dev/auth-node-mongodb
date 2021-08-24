const nodemailer = require('nodemailer');
const {host, port, user, pass} = require('../config/mail.json');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const exphbs = require('express-handlebars');

const transport = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass }
  });

  transport.use('compile', hbs({
    viewEngine: exphbs.create({
        defaultLayout: undefined,
      }),
    viewPath: path.resolve('./src/resource/mail/'),
    extName: '.html'
  }));

  module.exports = transport;
