// Annotate posts for the 2nd time
// Change the search query for tweets to one that finds tweets with annotated 1
// in Post to db, set annotated to 2


// Set up node modules
var express = require('express');
var app = express();
var mongoose = require('mongoose');
//var request = require('request');

var https = require('https');
// var http = require('http');
var fs = require('fs');

app.use(require('body-parser')());
app.use(require('cookie-parser')());

var handlebars = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        section: function(name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

// Mongoose

mongoose.connect('mongodb://localhost/IronyHQ');
var db = mongoose.connection;

// Create Schemas

var ironyGenSchema = new mongoose.Schema({
                    comment_id: String, // randomly generated Id
                    workerId: String, // turk workerId
                    url: String, // url of the news article
                    story: String, // the text of the news article
                    comment: String, // the comment
                    ironic: Number // 1 for ironic, 0 for sincere
                },
           { collection: 'ironyGen' });
IronyGen = mongoose.model('ironyGen', ironyGenSchema);

// global variables

ironic = 1; // set whether we are collecting ironic (1) or sincere (0) comments
comment_id = 0; // !! randomize this later or serialize or something

// Routes

// Page of the expderiment
app.get('/', function(req, res) {
    res.render('gen', {
        });
});

// test answer for testing
testAnswer = undefined;

// Post answer
app.post('/answer', function(req, res) {
    console.log('post to answer');
    var answer = {};
    // variables to be written do the data base
    answer.workerId = req.body.workerId;
    answer.url = req.body.url;
    answer.story = req.body.story;
    answer.comment = req.body.comment;
    answer.ironic = ironic;
    console.log('Log sth'); // !! Log something

    // test answer for testing
    testAnswer = answer;

    answerToDb(answer); // write to data base
});


// functions

// Write response to data base


function answerToDb(answer) {

    var newIronyGen = new IronyGen({
        workerId: answer.workerId,
        url: answer.url,
        story: answer.story,
        comment: answer.comment,
        ironic: answer.ironic
    });

    var upsertData = newIronyGen.toObject();
    delete upsertData._id;

    IronyGen.update({id: newIronyGen.id}, upsertData, { upsert: true }, function() {
        console.log('Answer added to Db');
        });
}


// Start http server; needs to be changed to https

var server = app.listen(app.get('port'), function() {
    console.log('Express started on locahost:' +
    app.get('port') + '; press Ctrl-C to terminate.');
});

// https server

// // Load cretentials
// var options = {
//   key: fs.readFileSync('../Credentials/irony.key', 'utf8'),
//   cert: fs.readFileSync('../Credentials/irony.crt', 'utf8')
// };

// // Start https server
// var httpsServer = https.createServer(options, app);
// httpsServer.listen(8000);



