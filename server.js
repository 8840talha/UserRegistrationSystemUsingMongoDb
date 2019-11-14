const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const {check,validationResult} = require('express-validator');
const ejs = require('ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.set('views', path.join(__dirname, 'views'));

app.set('view engine','ejs'); 

app.engine('ejs', require('ejs').__express);
const MongoClient = require('mongodb').MongoClient;
const url = " mongodb://127.0.0.1:27017";

const dbName='register';
const user='users';
var database='';
var collection ='';
function connect(){
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true },(err,client)=>{
        if (err) throw err;
        console.log("connected");
         database=client.db(dbName);
        collection=database.collection(user);
    });
}
app.get('/',function(req,res){
    res.render('index');
});
app.post('/signup',[ 
   
    check('username','Name cannot be left blank')
    .isLength({ min: 4 }),
   
    check('email')
    .isEmail().withMessage('Please enter a valid email address')
    .trim()
    .normalizeEmail().exists()
    .custom(value => {
         
        return new Promise((resolve, reject) => {
            collection.findOne({email:value}, function(err, user){
              if(err) {
                reject(new Error('Server Error'))
              }
              if(Boolean(user)) {
                reject(new Error('E-mail already in use'))
              }
              resolve(true)
            });
          });
        }),      
    ], function(req, res, next) {
      var errors = validationResult(req);
    if (!errors.isEmpty()) {     
        
       res.render('messages',{message : errors.array()});
    } else {
       var document = [
            {name:req.body.username},{email:req.body.email} 
       ];
        
        // var user = new User(document); 
        collection.insertMany(document,function(err,results){
            if(err) throw err;
            console.log('inserted');
        })
          res.json({message : "Data saved successfully.", status : "success"});    
    }
});


  

app.listen(3001,function(){
    console.log('running');
    connect();
    });















