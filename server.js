var express = require('express'),
    mongo = require('mongodb').MongoClient;
var app = express();


app.set('port', (process.env.PORT || 8080));

//base page
app.use('/', express.static('public'));

//in case they forget to include a url
app.get('/new', function(req, res) {
    res.send(JSON.stringify({error: "please include an address"}));
});

//set a url
//the regex in the get method allows for the submitted url to have slashes
app.get(/^\/new\/(.+)/, function(req, res) {
    //test the url
    var test = /^https?:\/\/(www\.)?\w+\.\w+$/;
    var url = req.params[0];

    if(!test.test(url)) {
        return res.send(JSON.stringify({error: "invalid address"})); 
    }

    res.send('it worked!');
});

app.listen(app.get('port'));
