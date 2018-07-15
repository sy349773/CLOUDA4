/**
*External dependencies
*/
var request = require('request');
var express = require("express");
var parser = require("body-parser");
var override = require("method-override");
//var flash = require("connect-flash");
var mongoose = require("mongoose");
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
//Initialazing Express for routing
var app = express();
//Setting ejs for embbeded javascript
app.set("view engine", "ejs");
//Setting up the server to retrive  static files and body parser for sanitazing data
app.use(express.static(__dirname +'public'));
app.use(parser.urlencoded({exteded: true}));
//allows overriding the DESTROY AND PUT METHODS
app.use(override("_method"));

//url FOR MBR
var MBRurl = "mongodb://cloudcomputingbrokera4mongodb:A3cE3y271LqegYu8mSFdNBS2KzJakwp9LHYd79fzwoachVdHVSrFDlZzA4AbpC8FdHAotl5OphkSSbpENTfeHQ%3D%3D@cloudcomputingbrokera4mongodb.documents.azure.com:10255/?ssl=true";


/**
* Setting up connection for Company and Life insurance
*/
mongoose.Promise = global.Promise;
const connectionString = 'mongodb://test:cloudtest1@ds163630.mlab.com:63630/cloud_a2';
mongoose.connect(connectionString, {useNewUrlParser: true})
.then(() => console.log('connection successful to Company and Life Insurance'))
.catch((err) =>console.log('Error trying to connect to Company and insurance = > ' + err))

/**
* Creating Models for Company and lifeInsurance
*/
var CompanyXschema = new mongoose.Schema({
   _id: { type: String },
   name: String,
   position: String,
   years: String,
   salary: String
});

var CompanyX = mongoose.model("CompanyX", CompanyXschema);

var LifeInsuranceYschema = new mongoose.Schema({
    _id: { type: String },
   name: String,
   policy: String,
   value: String
});

var LifeInsuranceY = mongoose.model("LifeInsuranceY", LifeInsuranceYschema);

/**
* Here we initially seed the database for company and life insurance
*/
// var emp =  [{_id:"1", name: "Bob1", position: "CEO", salary: "100000", years: "20"},
//   {_id:"2", name: "Bob2", position: "Secretary", salary: "50000", years: "15"},
//   {_id:"3", name: "Bob3", position: "Janitor", salary: "50000", years: "10"} ];
//
// CompanyX.collection.insert(emp, function(err, doc){
//   if(err){
//       console.log(error);
//   }
//   else{
//       console.log(doc);
//   }
// });
//
// var life =  [{_id:"1", name: "Bob1", policy: "SUPER", value: "1000000" },
//   {_id:"2", name: "Bob2", policy: "LOW", value: "300000" },
//   {_id:"3", name: "Bob3", policy: "MEDIUM", value: "250000" } ];
//
// LifeInsuranceY.collection.insert(life, function(err, doc){
//   if(err){
//       console.log(error);
//   }
//   else{
//       console.log(doc);
//   }
// });



/**
 * ROUTES
 * */
 app.get("/", function(req, res){
   res.render("intro");
 });

 app.get("/:page/portal", function(req, res){
    var info = req.params.page;
    res.render("login", {name: info});
 });

 app.post("/:page/login", function(req, res){
   var username = req.body.user.username;
   var password = req.body.user.password;
   //console.log(req.body.user);
   var info = req.params.page;
   var connect = LifeInsuranceY;
   if(!info.localeCompare("CompanyX")){
     connect = CompanyX;
     //console.log(info+ " CompanyX");
   }else if(!info.localeCompare("LifeInsuranceY")){
     connect = LifeInsuranceY;
   }
   else{
     var e = "Company portal not Found";
     var c =  "UNKNOWN COMPANY";
     res.render("error", {Err: e , name: c});
   }
   connect.findById(password, function(err, foundUser){
     if(err){
       var e = "Something went wrong...";
       res.render("error", {Err: e , name: info});
     }
     else{
       if(foundUser!==null&&!username.localeCompare(foundUser.name)){
         //console.log("made it");
         res.redirect("/"+info+"/menu/"+password);
       }else{
         var e = "This user does not exist";
         res.render("error", {Err: e , name: info});
       }
     }
   });
 });

 app.get("/:page/menu/:id", function(req, res){
   var info = req.params.page;
   var id = req.params.id;
   res.render("menu", {name: info, id:id});
 });

 app.get("/:page/MBR/:id", function(req, res){
   var info = req.params.page;
   var id = req.params.id;
   var connect = LifeInsuranceY;
   if(!info.localeCompare("CompanyX")){
     connect = CompanyX;
     //console.log(info+ " CompanyX");
   }else if(!info.localeCompare("LifeInsuranceY")){
     connect = LifeInsuranceY;
   }
   else{
     var e = "Company portal not Found";
     var c =  "UNKNOWN COMPANY";
     res.render("error", {Err: e , name: c});
   }
   connect.findById(id, function(err, foundUser){
     if(err){
       var e = "Something went wrong...";
       res.render("errorLog", {Err: e , name: info, id:id});
     }
     else{
       if(foundUser!==null){
         res.render("submit", {name:info, id:id , user:foundUser});
       }else{
         var e = "This user does not exist";
         res.render("errorLog", {Err: e , name: info, id:id});
       }
     }
   });
 });
// https://prod-06.eastus2.logic.azure.com/workflows/6fe6123780af4040a233a553d26a7237/triggers/manual/paths/invoke/type/{typeID}/application/{applicationID}?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=UoP0BKEk-D1kWwTJI6ZKfeD3OUAYyXL1wpA5RcKlE-w
app.post(":page/submit", function(req, res){
  var id = req.body.user.appNum;
  var info = req.params.page;
  if(info.localeCompare("CompanyX") && info.localeCompare("LifeInsuranceY")){
    var e = "Company portal not Found";
    var c =  "UNKNOWN COMPANY";
    res.render("error", {Err: e , name: c});
  }
  var typeOfRequest = "insurance";
  if(!info.localeCompare("CompanyX")){
    typeOfRequest = "employer";
  }
  id = id.trim();
  if(id.length!==24){
    var e = "The application Number does not match the format";
    res.render("errorLog", {Err: e , name: "info"});
  }
  /**
  *Here we make the request
  */
  request.get({ url: "https://prod-06.eastus2.logic.azure.com/workflows/6fe6123780af4040a233a553d26a7237/triggers/manual/paths/invoke/type/+"typeOfRequest"+/application/"+id+"?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=UoP0BKEk-D1kWwTJI6ZKfeD3OUAYyXL1wpA5RcKlE-w" },
    function(error, response, body) {
        if (!error && response.statusCode == 200) {
        if(!body.localeCompare("success")){
          res.render("done", {information : response.body});
        }
        }else{
          var e = "There was a problem while submitting the application. Please try again";
          res.render("errorLog", {Err: e , name: "info"});
        }
    });
 });

/**
*Routing for MBR
*/
 app.post("/BrokerMBR/new", function(req, res){
   //open connection....
   //console.log(res.headers);
   MongoClient.connect(MBRurl, function(err, client) {
     if(err){
       var e = "Something went worng... while connecting to the database...";
       res.render("error", {Err: e , name: "MBR"});
     }else{ // if succesful
       var newApplication = req.body.user;
       newApplication["companyCredentials"] = false;
       newApplication["insuranceCredentials"] = false;
       client.db('mbrdb').collection('application').insertOne( newApplication, function(err, done){
        if(err){
          var e = "Something went wrong... in the database";
          console.log("err");
          res.render("error", {Err: e , name: "MBR"});
        }
        client.close();
        var id = done.insertedId;
        res.redirect("/BrokerMBR/application/"+id);
       });
     }
   });
 });

 app.post("/BrokerMBR/status/", function(req, res){
   var id = req.body.id;
   id = id.trim();
   if(id.length!==24){
     var e = "The application Number does not match the format";
     res.render("error", {Err: e , name: "MBR"});
   }
   res.redirect("/BrokerMBR/application/"+id);
 });

 app.get("/BrokerMBR/application/:id", function(req, res){
   var id = req.params.id;
   id = id.trim();
   if(id.length!==24){
     var e = "The application Number does not match the format";
     res.render("error", {Err: e , name: "MBR"});
   }
   MongoClient.connect(MBRurl, function(err, client) {
     if(err){
       var e = "Something went worng... while connecting to the database...";
       client.close();
       res.render("error", {Err: e , name: "MBR"});
     }
     else{
       var cursor = client.db('mbrdb').collection('application').find({"_id": ObjectId(id)}).toArray(function(err, results){
         if(err){
           var e = "Something went wrong... in the database";
           client.close();
           res.render("error", {Err: e , name: "MBR"});
         }
         else if(results===null||results.length===0){
            var e = "Application with number: "+ id + " does not exist";
            client.close();
            res.render("error", {Err: e , name: "MBR"});
         }
         else{
           client.close();
           res.render("status" ,{user: results[0]});
         }
       });
     }
   });
});

/**
*This is the API for our logic flow....
*/
app.get("/employer/:id", function(req, res){
  var id = req.params.id;
  var info = req.params.type;
  id = id.trim();
  if(id.length!==24){
    var e = "The application Number does not match the format";
    res.send(e);
  }
  MongoClient.connect(MBRurl, function(err, client) {
    if(err){
      var e = "Something went wrong... while connecting to the database... Try Again";
      client.close();
      res.send(e);
    }
    else{
      var cursor = client.db('mbrdb').collection('application').updateOne(
        {_id: ObjectId(id)},
        { $set : { companyCredentials: true } }, function(err, results){
          if(err){
            var e = "Something went wrong... in the database... try again";
            client.close();
            console.log(err);
            res.send(e);
          }
          else if(results===null){
             var e = "Application with number: "+ id + " does not exist";
             client.close();
             res.send(e);
          }
          else{
            client.close();
            var e = "Your application with id: "+id+" has been succesfuly updated. Check MBR website to see your status.";
            res.send(e);
          }
      });
    }
  });
});

app.get("/insurance/:id", function(req, res){
  var id = req.params.id;
  var info = req.params.type;
  id = id.trim();
  if(id.length!==24){
    var e = "The application Number does not match the format";
    res.send(e);
  }
  MongoClient.connect(MBRurl, function(err, client) {
    if(err){
      var e = "Something went wrong... while connecting to the database... Try Again";
      client.close();
      res.send(e);
    }
    else{
      var cursor = client.db('mbrdb').collection('application').updateOne(
        {_id: ObjectId(id)},
        { $set : { insuranceCredentials: true } }, function(err, results){
          if(err){
            var e = "Something went wrong... in the database... try again";
            client.close();
            console.log(err);
            res.send(e);
          }
          else if(results===null){
             var e = "Application with number: "+ id + " does not exist";
             client.close();
             res.send(e);
          }
          else{
            client.close();
            var e = "Your application with id: "+id+" has been succesfuly updated. Check MBR website to see your status.";
            res.send(e);
          }
      });
    }
  });
});

//gets the ports going...
var port = process.env.PORT || 1337;
app.listen(port, function(){
    console.log("Server running at http://localhost:%d", port);
});
