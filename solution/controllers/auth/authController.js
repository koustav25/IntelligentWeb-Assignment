function getLogin(req, res) {
    res.render("authentication/login", {title: "Login"});
}

function getRegister(req, res) {
    res.render("authentication/register", {title: "Register Account"});
}

const registerUser = (req,res,next) => {
    const {username, password, confirmPassword} = req.body
    console.log(username, password, confirmPassword)
    res.send("OK")
}

const loginUser = (req,res,next) => {
    const {username, password} = req.body
    console.log(username, password)
    res.send("OK")
}

const logoutUser = (req,res,next) => {
    req.logout(err => {
        if(err) return next(err)
        res.redirect("/login")
    })
}

module.exports = {
    getLogin,
    getRegister,
    registerUser,
    loginUser,
    logoutUser
}