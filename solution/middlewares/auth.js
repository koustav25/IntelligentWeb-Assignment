/* Middleware to secure routes */
const isAuthenticated = (req, res, next) => {
    req.isLoggedIn = false;
    if(req.isAuthenticated() && req.user){
        req.isLoggedIn = true;
        next();
    } else {
        res.redirect("/login")
    }
}

// This middleware should be used where the route is not restricted to logged-in users but authentication info is required.
const authInfo = (req, res, next) => {
    req.isLoggedIn = !!(req.isAuthenticated() && req.user);
    next()
}

const isAdmin = (req,res,next) => {
    if(req.user.role < 1){
        res.redirect("/dashboard")
    }
    next();
}

module.exports = {
    isAuthenticated,
    authInfo
}