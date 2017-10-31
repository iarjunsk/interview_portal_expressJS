var config = require('../config');

var mongojs = require('mongojs');
var db = mongojs(config.MONGODB_URL, ["questionnaire","candidates"]);

function randomIntFromInterval(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

var session_questions;
var session_score;

exports.get_callback = function(req, res,callback) { 

    if( !req.isAuthenticated()) { res.redirect('/login'); return false; }

    //Check if the user has already taken test or not
    db.candidates.findOne({
        email: req.session.passport.user.nickname+"@gmail.com"
    }, function(err, doc) {
        if(err){

            console.log(err);
        
        }else if(doc == null){
            
            res.redirect('/logout'); // if email was not invited, logout the user
        
        }else{
            
            if(doc.test_taken == true ){
                res.redirect('/score')
                return false;
            }else{

                //Load questionnaire randomly 
                var startFrom = randomIntFromInterval(1,5); // because the db has 10 questions 
                
                db.questionnaire.find({}).limit(5).skip(startFrom).toArray(function (err, docs) { 
                    if(err){
                        console.log(err);
                    }else{
                        session_questions = docs;
                        res.render('test',{
                                questions :session_questions
                            }
                        );
                    }
                })
                
                
                // Update candidate's test taken status
                db.candidates.findAndModify({
                    query: { email:  req.session.passport.user.nickname+"@gmail.com" },
                    update: { $set: { test_taken: true } },
                }, function (err, doc, lastErrorObject) {
                   
                });
                

            }
        }
    })

}

exports.post_callback = function(req, res) { 
    
    if( !req.isAuthenticated()) { res.redirect('/login'); return false; }

    session_score = 0; 

    var list_user_ans = req.body;

    for(var question in list_user_ans) {        
		for( var item in session_questions){
			if( session_questions[item]._id == question && session_questions[item].ans == list_user_ans[question] ){
                session_score++;
			}
		}
    }

    //update session score to the user
    db.candidates.findAndModify({
        query: { email:  req.session.passport.user.nickname+"@gmail.com" },
        update: { $set: { score: session_score } },
    }, function (err, doc, lastErrorObject) {
        res.redirect('/score');
        return false;
    })

    
}

