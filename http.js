var elasticsearch = require('elasticsearch');
var express= require('express');
var router= express.Router();
bodyParser = require('body-parser');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
});

router.get('/', function(req, res) {
  return client.indices.putMapping({
    index: 'addressbook',
    type: "contact",
    body: {
      properties: {
        first: { type: "text" },
        last: {type: "text"},
        address: {type: "text"},
        phone: { type: "text"},
        email: {type: "text" }
      }
    }
  }, function(err, response){
    if(err){
      console.log(err);
      res.sendStatus(500);
    }
  });
});

router.route('/contact').post(function(req, res) {
  var input = req.body;
  client.index({
    index: 'addressbook',
    type: 'contact',
    body: {
      first: input.name,
      last: input.lastname,
      address: input.address,
      email: input.email,
      phone: parseInt(input.phone)
    }
  }, function (error,response) {
    if(error) return console.log('ERROR',error);
  });
});

module.exports = router;
