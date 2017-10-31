var config = require('../config');

var mongojs = require('mongojs');
var db = mongojs(config.MONGODB_URL, ["candidates"]);

var inviteCode ;
var inviteEmail;

exports.get_callback = function(req, res) { 
    
    if(req.params.invite !=null ){
        
        // ######## Candidate Login ######
        inviteCode = req.params.invite;

        if(inviteCode.length != 24){
            res.redirect('/404');
            return false; 
        }

        //Update visited in the database
        db.candidates.findAndModify({
            query: { 
                _id: mongojs.ObjectId(inviteCode) 
            },
            update: { $set: { link_visited: true } },
        }, function (err, doc, lastErrorObject) {
            if(err || doc==null ){
                res.redirect('/404');
                return false;
            }else{
                inviteEmail = doc.email;
                res.redirect('/login');
                return false;
            }
        })
    


    }else{

        // ######## Admin Login ###########
        if( req.isAuthenticated() ){ // user logged in
            
            if(req.session.passport.user.emails[0].value == config.ADMIN){ // is it admin?
                res.redirect('/admin');
                return false;
            }else{

                if(inviteEmail == req.session.passport.user.emails[0].value ){ // is it candidate with invite link
                    console.log("using invite email as reference");
                    inviteEmail = "";
                    res.redirect('/test');
                    return false;
                }else{
                    
                    //Checking if it is some-one who had already taken the test
                    db.candidates.findOne({
                        email: req.session.passport.user.emails[0].value
                    },(err, doc)=> {
                        if(err){

                            console.log(err);
                        
                        }else if(doc == null){

                            res.redirect('/logout'); // if email was not invited, logout the user
                        
                        }else{
                            console.log("not using invite email as reference");
                            res.redirect('/test');
                        }
                    });

                }
            }
        }
        else{
            res.render('login'); // if user first opens then render login
        } 


    }
}
