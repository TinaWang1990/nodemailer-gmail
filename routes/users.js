var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer')

// Read configuration from environment variables
require('dotenv').config()

//use express-validator
const { body, validationResult } = require('express-validator');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.json({ users: [{ name: 'Tina' }] });
});

// Handler for POST request to / URL
router.post('/sendmail', 
[
  body('firstName').isLength({ min: 2, max: 20 }),
  body('lastName').isLength({ min: 2, max: 20 }),
  body('email').isEmail()
],
 (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.send({ status: 404, errors: errors.array() });
  }

  let user = req.body;

  // We need to sanitize the information!!
  // Use Pattern instead   
  // var phone = req.bodyPattern('phone', /^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/)
  var msg = req.bodyString('msg')

  //check message when they are empty
  var checkmsg = false;
  if (user.msg && !msg) {
    checkmsg = false
  } else {
    checkmsg = true
  }

  // Create an instance of a Mail Transport using our configuration options    
  var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: '587',
    auth: {
      type: 'OAuth2',
      user: `${process.env.SMTP_USER}`,
      clientId: `${process.env.clientId}`,
      clientSecret: `${process.env.clientSecret}`,
      refreshToken: `${process.env.refreshToken}`,
      accessToken: `${process.env.accessToken}`
    },
    secureConnection: 'false',
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }

  });
  // Prepare mail options object
  var mailOptions = {
    from: "tina wang web", // sender address
    to: "shihuiwang1990@gmail.com", // list of receivers
    subject: `👻${user.firstName} visit your tinawang.co`, // Subject line
    html: `<h4>Hi Tina,</h4> <h5>${user.firstName} ${user.lastName} visited your website and left your some message:
      <ul><li>email: ${user.email}</li><li>message: ${user.message}</li></ul></h5>` // html body
  };

  if (checkmsg) {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return console.log("ERROR----" + error);
      } else {
        res.send({ status: "200" })
      }
      console.log('Message sent: ' + info.response);
    });
  }
})

module.exports = router;
