function getLogin(req, res) {
    //TODO: Render login page
    //res.render('login');

    res.send('Login');
}

function getRegister(req, res) {
    //TODO: Render register page
    //res.render('register');

    res.send('Register');
}

module.exports = {
    getLogin,
    getRegister
}