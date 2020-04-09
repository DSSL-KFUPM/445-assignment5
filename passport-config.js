const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserByUsername) {
    const authenticateUser = async(Email, Password, done) => {
        const user = getUserByEmail(Email)
        if (user == null) {
            return done(null, false, { message: 'No user with that email' })
        }

        try {
            if (Password == user.Password) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Password incorrect' })
            }
        } catch (e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'Email' }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.Username))
    passport.deserializeUser((Username, done) => {
        return done(null, getUserByUsername(Username))
    })
}

module.exports = initialize