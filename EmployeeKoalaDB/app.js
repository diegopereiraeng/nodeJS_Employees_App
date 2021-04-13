var express = require('express')
var routes = require('./routes')
var http = require('http')
var path = require('path')
var EmployeeProvider = require('./employeeprovider').EmployeeProvider;
var user = require('./routes/user');
const { connect } = require('./routes');
var favicon = require('serve-favicon')
var logger = require('morgan')
var fs = require('fs')
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var errorhandler = require('errorhandler')


var app = express();

logger(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
})

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', {layout: false});

// Old Favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
// Old Logger
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
 
// setup the logger
app.use(logger('combined', { stream: accessLogStream }))

app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));


if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorhandler({ log: errorNotification }))
}
 
function errorNotification (err, str, req) {
  var title = 'Error in ' + req.method + ' ' + req.url
 
  notifier.notify({
    title: title,
    message: str
  })
}


var employeeProvider= new EmployeeProvider('localhost', 27017);

//Routes

//app.get('/', routes.index);
app.get('/', function(req, res){
  employeeProvider.findAll(function(error, emps){
    res.render('index', {
      title: 'Harness Employees Node.js Sample App',
      employees: emps
    });
  });
});

app.get('/employee/new', function(req, res) {
  res.render('employee_new', {
    title: 'New Employee'
  });
});

// list all Employees

app.get('/employees', function(req, res) {
  employeeProvider.findAll(function(error, emps){
    res.render('employees', {
      title: 'Harness Employees',
      employees: emps
    });
  });
});

// save new employee

app.post('/employee/new', function(req, res){
  employeeProvider.save({
    title: req.param('title'),
    name: req.param('name')
  }, function (error, docs){
    res.redirect('/')
  });
});

//update an employee
app.get('/employee/:id/edit', function(req, res){
  employeeProvider.findById(req.param('_id'), function(error, employee) {
    res.render('employee_edit',
    {
       employee: employee
    });
  });
});

// save updated employee
app.post('/employee/:id/edit', function(req, res) {
  employeeProvider.update(req.param('_id'), {
    title: req.param('title'),
    name: req.param('name')
  }, function(error, docs) {
    res.redirect('/')
  });
});

// delete an employee
app.post('/employee/:id/delete', function(req, res) {
  employeeProvider.delete(req.param('_id'), function(error, docs) {
    res.redirect('/')
  });
});


    
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//app.listen(3000);
