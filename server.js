var port = process.env.PORT || 8080;
var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', require('./http'));

app.listen(port);
console.log('Server has been started');
