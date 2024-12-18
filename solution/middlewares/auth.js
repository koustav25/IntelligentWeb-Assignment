/* Middleware to secure routes */

const {ADMIN} = require("../model/enum/roleTypes")

const isAuthenticated = (req, res, next) => {
    req.isLoggedIn = false;
    if(req.isAuthenticated() && req.user){
        req.isLoggedIn = true;
        next();
    } else {
        return res.redirect('/login');
    }
}

// This middleware should be used where the route is not restricted to logged-in users but authentication info is required.
const authInfo = (req, res, next) => {
    req.isLoggedIn = !!(req.isAuthenticated() && req.user);
    req.user = req.isLoggedIn ? req.user : null;
    next()
}

const isAdmin = (req,res,next) => {
    if(req.user.role < ADMIN){
        res.redirect("/")
    }
    next();
}

module.exports = {
    isAuthenticated,
    authInfo,
    isAdmin
}