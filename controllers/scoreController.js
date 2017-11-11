var config = require('../config');

var mongojs = require('mongojs');
var db = mongojs(config.MONGODB_URL, ["candidates"]);

exports.get_callback = function(req, res) { 
    
    if( !req.isAuthenticated()) { res.redirect('/login'); return false; }

    db.candidates.findOne({
        email:  req.session.passport.user.emails[0]
    }, function(err, doc) {
        if(err){

            console.log(err);
        
        }else if(doc == null){
            
            res.redirect('/logout'); // if email was not invited, logout the user
        
        }else{
            
            res.render('score',{
                    score : doc.score
                }
            );
            
        }
    })


    
}
