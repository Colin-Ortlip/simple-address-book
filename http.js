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
    if(err) return console.log(err);
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
  }, function (err,response) {
    if(err) return console.log(err);
  });
});

router.route('/contact/:name').get( function(req, res) {
  var input = req.params.name;
  client.search({
    index: 'addressbook',
    type: 'contact',
    body: {
      query: {
        query_string: {
          query: input
        }
      }
    }
  }).then(function (resp) {
    var results = resp.hits.hits.map(function(hit){
      return hit._source;
    });
    console.log(results);
    console.log(resp);
  });
});

router.route('/contact/:name').put(function(req, res) {
  var input = req.body;
  client.updateByQuery({
    index: 'addressbook',
    type: 'contact',
    body: {
      "query": { "match": { "first": input.old} },
      "script":  "ctx._source.name =  "+ "'"+input.new +" ' "+";"
    }
  })
});

module.exports = router;
