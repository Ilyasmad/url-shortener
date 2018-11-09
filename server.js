'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGOLAB_URI);
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

//Models
const Schema = mongoose.Schema;
const urlSchema = new Schema({
  originalUrl: String,
  shorterUrl: String
});

const Url = mongoose.model('Url', urlSchema);

// Creates a database entry, app.get supposed to be app.post to create new item in database, but preview only works on app.get.
app.get('/new/:urlToShorten(*)', (req, res) => {

  var { urlToShorten } = req.params;
  var regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;

  if (regex.test(urlToShorten) === true) {
    var short = Math.floor(Math.random()*100000).toString();
    var data = new Url({originalUrl: urlToShorten, shorterUrl: short});
    data.save((err) => err ? res.send('Error saving to Database') : res.json(data));
  }
  else {
   return res.json({originalUrl: 'invalid address'})
  }

});

//Query database for shorterUrl and forward to originalUrl
app.get('/:urlToForward', (req, res) => {

  var { urlToForward } = req.params;

  Url.findOne({shorterUrl: urlToForward}, (err, data) => {

    if (err) return res.send('Error reading Database');

    var reg = /^(http|https):\/\//i;

    if (reg.test(data.originalUrl)) {
     res.redirect(301, data.originalUrl)
    }
    else {
     res.redirect(301, 'http://' + data.originalUrl)
    }

  });
})

app.listen(process.env.PORT || 3000, () =>  console.log('Node.js listening ...'));
