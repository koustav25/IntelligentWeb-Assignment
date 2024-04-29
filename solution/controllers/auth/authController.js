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
        const {username, password, confirmPassword, first_name, last_name, email} = req.body

        const salt = randomBytes(16)
        const hashedPassword = await pbkdf2Promise(password, salt, 310000, 32, 'sha256')
        const user = new User({
            username,
            first_name,
            last_name,
            email,
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


const logoutUser = async (req,res,next) => {
    req.logout(err => {
        if (err) return next(err);
        req.session.destroy(err => {
            if (err) return next(err);
            res.redirect("/login")
        });
    })
}

module.exports = {
    getLogin,
    getRegister,
    registerUser,
    logoutUser
}