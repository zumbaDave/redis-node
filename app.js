const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');  // is a node.js core module
const bodyParser = require('body-parser');
const methodOverride = require('method-override');  // allows us to use delete on forms, by default forms only allow put or get
const redis = require('redis');

// Create Redis Client
let client = redis.createClient();

client.on('connect', function(){
    console.log('Connected to Redis...');
}).on('error', function(error){
    console.log(error);
});

// let redisPort = 6379;  // Replace with your redis port
// let redisHost = "127.0.0.1";  // Replace with your redis host
// const client = redis.createClient({
//     socket: {
//         port: redisPort,
//         host: redisHost,
//     }
// });

// (async () => {
//     // Connect to redis server
//     await client.connect();
// })();


// console.log("Attempting to connect to redis");
// client.on('connect', () => {
//     console.log('Connected!');
// });

// // Log any error that may occur to the console
// client.on("error", (err) => {
//     console.log(`Error:${err}`);
// });

// Close the connection when there is an interrupt sent from keyboard
process.on('SIGINT', () => {
    client.quit();
    console.log('redis client quit');
});


// Set Port
const port = 3000;

// Init app
const app = express();

// View Engine
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));  // layout we are going to use is called main.handlebars
app.set('view engine', 'handlebars');

// body-parser - this is standard middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Method Override
app.use(methodOverride('_method'));  // _method is parameter we need to use to make a delete request from form

// Search Page
app.get('/', function(req, res, next){
    res.render('searchusers');
});

// Add User Page
app.get('/user/add', function(req, res, send){
    res.render('adduser');
})

// Process Add User page
// Add User Page
app.post('/user/add', function(req, res, send){
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone
    ], function(err, reply){
        if(err) {
            console.log(err);
        }

        console.log(reply);
        res.redirect('/');
    });
})

// Search Processing
app.post('/users/search', function(req, res, next){
    let id = req.body.id;

    client.hGetAll(id, function(err, obj){
        if(!obj) {
            res.render('searchusers', {
                error: 'User does not exist'
            });
        } else {
            obj.id = id;
            res.render('details', {
                user: obj
            });
        }
    });
})

// Delete User
app.delete('/user/delete/:id', function(req, res, next){
    client.del(req.params.id);
    res.redirect('/');
});

app.listen(port, function(){
    console.log('Server started on port ' + port);
});