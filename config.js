var config = {};

config.ADMIN = "<your_admin_email>";
config.HOSTING_URL = "http://localhost:3000";
config.PORT = 3000;

// Auth0 authorization
/* NOTE:
Create a new client using Auth0 : https://manage.auth0.com/#/clients

Make sure to enter the following in the client
Allowed Callback URLs : http://localhost:3000/google/auth/callback
Allowed Web Origins   : http://localhost:3000
Allowed Logout URLs   : http://localhost:3000/logout
*/
config.AUTH0 = {
    domain : "<auth0_client_domain>",
    client_id : "<auth0_client_id>",
    client_secret : "<auth0_client_secret>",
    callback_url  : config.HOSTING_URL+"/google/auth/callback"
};


// Used mlab online database
// NOTE : Create db_user https://mlab.com/databases/<your_database>#users
config.MONGODB_URL = "mongodb://<db_user>:<db_user_pass>@ds<__>.mlab.com:<port>/<database>";

// Sending email for candidate invitation link
config.EMAIL = {
    EMAILID  : "<email_sender_id>",
    PASSWORD : "<email_send_password>",
    SERVICE  : "gmail" // Can update this if you are using godaddy etc
}

module.exports = config;

