var mongojs = require("mongojs");
var express=require("express");
var bodyParser=require('body-parser');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
var session = require('express-session');
var passport = require('passport');
var MongoDBStore = require('connect-mongodb-session')(session);
var LocalStrategy = require('passport-local').Strategy;
var app = express();
var flash=require("connect-flash");
const db = mongojs("mongodb://igkishore:igkigk1234@igk-shard-00-02.l0g6f.mongodb.net:27017s/vidyutRakshak?ssl=true&replicaSet=igk-shard-0&authSource=admin",["members"]);

var store = new MongoDBStore({
  uri: 'mongodb://igkishore:igkigk1234@igk-shard-00-02.l0g6f.mongodb.net:27017s/vidyutRakshak?ssl=true&replicaSet=igk-shard-0&authSource=admin',
  collection: 'sessions'
});

app.use(express.static("templates"));
app.set('view engine','ejs');
app.set('views', __dirname + '/templates');
app.set('views',__dirname);

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'SmritiMakesMeBetter',
  saveUninitialized: true,
  resave: false,
  store: store
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

var logindata=null;
passport.use(new LocalStrategy({
    passReqToCallback: true
  },
  function(req,username, password, done) {
  	var mongojs = require("mongojs");
	const db = mongojs("mongodb://igkishore:igkigk1234@igk-shard-00-02.l0g6f.mongodb.net:27017s/vidyutRakshak?ssl=true&replicaSet=igk-shard-0&authSource=admin",["members"]);

	var object={
		email:username,
	} 

	db.members.find(object,function(err,data)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			if(data.length>0)
			{ 	
				logindata=data;
				const hash=data[0].password.toString();
				bcrypt.compare(password, hash, function(err, res) {
				    if(res === true){
				    	return done(null,logindata[0]);
				    }
				    else{
				    	return done(null, false,req.flash('error','Invalid Username Or Password'));
				    }
				});
			}
			else{
				return done(null, false,req.flash('error','Invalid Username Or Password'));
			}
		}
	});
  }
));

app.get("/login",function(req,res){
	if(req.isAuthenticated()){
		res.redirect('/');
	}else{
		var errors = req.flash().error
		error = JSON.stringify(errors)
		res.render("login",{data:error});
	}
});

app.get("/register",function(req,res){	
  if(req.isAuthenticated()){
		res.redirect('/');
	}else{
		res.sendFile(__dirname+"/register.html");
	}
});

app.get("/",function(req,res){
	if(req.isAuthenticated()){

  //  get data from database
    db.errors.find({},function(err,errorData){
      res.render('index',{data:[
        {errors:errorData},
        {user_details:req.user}
      ]})
    })
  }
  else{
      res.redirect('/login');
  }
});

app.post('/login-done',passport.authenticate('local',{
	successRedirect : '/',
	failureRedirect : '/login',
	failureFlash: true
}));

var registerationdata=null;
app.post("/register-done",function(req,res){

	if(req.query.password_1==req.query.password_2)
	{		
		bcrypt.genSalt(10, function(err, salt){
   			bcrypt.hash(req.body.password_1, salt, function(err, hash) {
					var obj={
						name:req.body.fullname,
						email:req.body.username,
						password:hash,
						id:req.body.id,
            mobile:req.body.mobile
					}
					var checkobj={
						id:req.body.id,
            name:req.body.name,
            mobile:req.body.mobile
					}
					db.members.find(checkobj,function(err,data){
						if(err)
						{
							console.log("err with members");
						}
						else
						{
							if(data.length>0)
							{ 
								res.send("user already exists");
							}
							else
							{
								db.members.insert(obj,function(err,data){
								if(err) throw err
									res.redirect("/");
								});
							}

						 }
							})
						});
					})
	}
	else
	{
		res.send("passwords do not match");
	}
});



// db.sessions.remove({},function(err,data){
// 	console.log("successfully removed all sessions");	
// })

passport.serializeUser(function(id, done) {
  done(null,id);
});

passport.deserializeUser(function(id, done) {
    done(null, id);
});


function authenticationMiddleware() {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

	    if (req.isAuthenticated()) return next();
	    res.redirect('/login')
	}
} 

app.set('port',process.env.PORT||5000)

var server = app.listen(app.get('port'),function(){
console.log("SERVER STARTED SUCCESSFULLY................")
