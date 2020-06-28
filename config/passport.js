const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    },

    async (email, password, next) => {
        //codigo que se ejecuta la llenar el formulario
        const usuario = await Usuarios.findOne({
            where:
                {
                    email
                }
        });


        //si no existe el usuario
        if (!usuario) return next(null, false, {
            message: 'Ese usuario no existe'
        });

        //Si el usuario existe
        const verificarPass = usuario.validarPassword(password);

        //Si el password es incorrecto
        if (!verificarPass) return next(null, false, {
            message: 'Password incorrecto'
        })

        //si el usuario existe pero no ha confirmado el correo de activacion
        if (usuario.activo !== 1) return next(null, false, {
            message: 'El usuario existe, pero debes confirmar en tu bandeja de correo para activarlo'
        })

        //Si todo sale correcto, pasa al siguiente middleware con el usuario
        return next(null, usuario);
    }
));


passport.serializeUser(function (usuario, cb) {
    cb(null, usuario);
});

passport.deserializeUser(function (usuario, cb) {
    cb(null, usuario);
});

module.exports = passport;