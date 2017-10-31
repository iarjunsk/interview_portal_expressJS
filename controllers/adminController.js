var config = require('../config');

var mongojs = require('mongojs');
var nodemailer = require('nodemailer');

var db = mongojs(config.MONGODB_URL, ["candidates"]);

var candidate_email;
exports.get_callback = function(req, res) { 

    //Auth for Admin
    if( !req.isAuthenticated()) { res.redirect('/login'); return false; }
    if(req.session.passport.user.emails[0].value != config.ADMIN)  { res.redirect('/404'); return false; }


    db.candidates.find().toArray(function (err, docs) { 
        if(err){
            console.log(err);
        }else{
            res.render('admin',{
                candidates : docs
            });
        }
    })
}
exports.post_callback = function(req, res) { 

    //Auth for Admin
    if( !req.isAuthenticated()) { res.redirect('/login'); return false; }
    if(req.session.passport.user.emails[0].value != config.ADMIN)  { res.redirect('/404'); return false; }

    candidate_email =  req.body.candidate_email;

    // put candidate email in the db
    db.candidates.save({
        email: candidate_email,
        test_taken: false,
        link_visited: false,
        score: 0
    },function(err,doc){

        //send email
        var invite_link = config.HOSTING_URL +"/login/"+doc._id ;
        console.log('Invite Link: ' + invite_link);

        var transporter = nodemailer.createTransport({
            service: config.EMAIL.SERVICE,
            auth: {
              user: config.EMAIL.EMAILID,
              pass: config.EMAIL.PASSWORD
            }
        });
          
        var mailOptions = {
            from: 'Admin',
            to: candidate_email,
            subject: 'Scapic Interview Invite',
            html: 'Please use the link to complete the procedure: <a href="'+invite_link+'">Invite Link</a>'
        };
          
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
          

        
        // render the page with all the candidates
        db.candidates.find().toArray(function (err, docs) { 
            if(err){
                console.log(err);
            }else{
                res.render('admin',{
                    candidates : docs
                });
            }
        })
        
    })

   
}
