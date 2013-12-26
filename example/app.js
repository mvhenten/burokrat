
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var Burokrat = require('../index');

var Profile = Burokrat.create(function() {
    this.fields = {
        name: {
            type: 'text',
            required: false,
            label: 'Screen name',
            validators: [

                function(f, field, next) {
                    var err = /\d+/.test(field.data) ? 'not a thing' : null;
                    return next(err);
            }]
        },
        profile: {
            description: {
                type: 'textarea',
                required: false,
                placeholder: 'lorem ipsum sit amet',
                label: 'Screen name',
            },
            culture: {
                type: 'select',
                required: 'Choose a valid culture',
                options: ['nl-NL', 'en-EN'],
                label: 'culture',
                validators: []
            },
            password: {
                type: 'password',
                required: true,
                label: 'Screen name',
                placeholder: '***',
                validators: []
            }
        }
    };
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.all('/',function(req, res, next ){
  req.profile = new Profile();
  next();
});

app.post('/',function(req, res, next ){
  req.profile.validate(req.body, function(err, form){
    if ( ! form.isValid ) return next();

    res.send('<html><pre>' + JSON.stringify(form.values) + '</pre></html>');

  });
});

app.all('/',function(req, res ){
  res.render('index', { title: 'Express', form: req.profile.toHTML() });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
