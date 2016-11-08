var express = require('express'),
    mongo = require('mongodb').MongoClient;

var app = express();
var mongoURL = "mongodb://0.0.0.0:27017/shortener";

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
    var reqURL = req.params[0];

    if(!test.test(reqURL)) {
        return res.send(JSON.stringify({error: "invalid address"})); 
    }

    //connect to db
    mongo.connect(mongoURL, function(err, db) {
        if(err) {
            console.error(err);
        }
        
        var urls = db.collection('urls');
        
        //check whether the url already exists
        urls.find({url: reqURL}).toArray(function(err, docs) {
            if(err) {
                console.error(err);
            } 

            doc = docs[0];
            if(doc != null) {
                res.send(JSON.stringify({original_url: doc.url, shortened_url: doc.short})); 
                db.close();
            } else {
                urls.count({}, function(err, count) {
                    if(err) {
                        console.error(err)
                    }                

                    urls.insert({url: reqURL, short: count});
                    res.send(JSON.stringify({original_url: reqURL, shortened_url: count}));
                    db.close();
                });
            }

        });
    });
});

app.listen(app.get('port'));
