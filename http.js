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
    else res.sendStatus(200);
  });
});

router.route('/contact').post(function(req, res) {
  var input = req.body;
  client.index({
    index: 'addressbook',
    type: 'contact',
    body: {
      first: input.first,
      last: input.last,
      address: input.address,
      email: input.email,
      phone: parseInt(input.phone)
    }
  }, function (err,response) {
    if(err) return console.log(err);
    else res.sendStatus(200);
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
    res.sendStatus(200);
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
  }, function (err, response) {
    if(err) console.log(err);
    else res.sendStatus(200);
  });
});

router.route('/contact/:name').delete(function(req, res) {
  var input = req.params.name;
  client.deleteByQuery({
    index: 'addressbook',
    type: 'contact',
    body: {
      query: {
        match: { first: input }
      }
    }
  }, function (err, response) {
    if(err) console.log(err);
    else res.sendStatus(200);
  });
});

router.route('/contact').get(function(req, res) {
  var pages = parseInt(req.query.page);
  var count = parseInt(req.query.pageSize);
  var search = {
    index: 'addressbook',
    from: (pages - 1) * count,
    size: count,
    body: {
      "query": {
        "match_all": {}
      }
    }
  };
  client.search(search, function (err, resp) {
    console.log('results', {
      results: resp.hits.hits,
      page: pages,
      pages: Math.ceil(resp.hits.total / count)
    });
    var results = resp.hits.hits.map(function(hit){
      return hit._source.first + " " + hit._source.last;
    });
    console.log(results);
    res.sendStatus(200);
  });
});

module.exports = router;
