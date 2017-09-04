var express = require('express');
var app = express();
var cool = require('cool-ascii-faces');
var url = require('url');
var redis = require('redis');

const client = getRedisConnection();

client.on('error', function() {
  console.log('App crashed');
  process.exit(1);
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.get('/times', function(request, response) {
  var result = ''
  var times = process.env.TIMES || 5

  for (i=0; i < times; i++)
    result += i + ' ';

  response.send(result);
});

app.get('/db', function (request, response) {

  client.set('welcome_msg', 'Hello from Redis!');

  client.get('welcome_msg', function (err, reply) {
    if (reply != null) {
      response.send(reply);
    } else {
      response.send('Error');
    }
  });
});


client.on('connect', function(){
  console.log('ready')
  app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
  });
});

function getRedisConnection() {
  const local = !process.env.REDISCLOUD_URL;
  const options = {no_ready_check: true};

  if (local) {
    return redis.createClient();
  }

  var redisURL = url.parse(process.env.REDISCLOUD_URL);
  var client = redis.createClient(process.env.REDISCLOUD_URL || undefined, {no_ready_check: true});
  client.auth(redisURL.auth.split(':')[1]);
  return client;
}
