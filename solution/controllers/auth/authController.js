const {User} = require("../../model/schema/user")
const {randomBytes, pbkdf2} = require("node:crypto");
const {promisify} = require('node:util')
const pbkdf2Promise = promisify(pbkdf2)

function getLogin(req, res) {
    res.render("authentication/login", {title: "Login"});
}

function getRegister(req, res) {
    res.render("authentication/register", {title: "Register Account"});
}

const registerUser = async (req,res,next) => {
    try {
        const {username, password, confirmPassword} = req.body

        const salt = randomBytes(16)
        const hashedPassword = await pbkdf2Promise(password, salt, 310000, 32, 'sha256')
        const user = new User({
            username,
            password: hashedPassword,
            salt,
        });

        if(req.session.messages.length > 0){
            return res.redirect("/register")
        }

        await user.save()

        req.login(user, err => {
            if (err)
                return next(err)
            res.redirect("/feed")
        })
    } catch (err) {
        return next(err)
    }
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