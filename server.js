 /******************************************************
 * PLEASE DO NOT EDIT THIS FILE
 * the verification process may break
 * ***************************************************/

'use strict';

var fs        = require('fs');
var express   = require('express');
var _         = require('lodash');
var app       = express();

var {mongoose} = require('./db/mongoose');
var {Url}      = require('./models/url');

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });

app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    })

app.route(/^\/(.+)/)
  .post(function (req, res) {
    var all_docs = [];
    // query the database and store all url indices in an array
    Url.find().then(function (docs) {
      all_docs = docs;
    });

    var short_indices = all_docs.map(function (doc) {
      return doc.short_url_index;
    });

    // keep generating numbers until you find a unique one
    var random_num = 0;
    while (true) {
      random_num = Math.floor(10000 * Math.random() + 1);
      if (short_indices.indexOf(random_num) === -1) break;
    }

    var url = new Url({
      original_url: req.params[0],
      short_url_index: random_num,
      short_url: req.protocol + '://' + req.get('host') + '/' + random_num
    });

    url.save().then(function (doc) {
      res.send(_.pick(doc, ['original_url', 'short_url']));
    }).catch(function (err) {
      res.status(400).send({error: err});
    });
  });

app.route('/:short_url_index')
  .get(function (req, res) {
    var short_url_index = Number(req.params.short_url_index);
    console.log(short_url_index);
    Url.findOne({
      short_url_index: short_url_index
    }).then(function (doc) {
      var original_url = doc.original_url;
      if (!original_url.startsWith('http')) original_url = 'http://' + original_url;
      console.log(original_url);
      res.redirect(original_url);
    }).catch(function (err) {
      res.status(400).send({error: err});
    });
  });


// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }
})

app.listen(process.env.PORT || 3000, function () {
  console.log('Node.js listening ...');
});
