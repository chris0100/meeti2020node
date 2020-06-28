const passport = require('passport');

exports.autenticarUsuarioPost = passport.authenticate('local', {
    successRedirect : '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});


//Revisa si el ususario esta autenticado
exports.usuarioAutenticado = (req,res,next) => {
    //Si el usuario esta autenticado
    if (req.isAuthenticated()){
        return next();
    }

    //Si no esta autenticado
    return res.redirect('/iniciar-sesion');
};


//Cerrar Sesion
exports.cerrarSesion = (req,res,next) => {
    req.logout();
    req.flash('exito', 'Cerraste sesión correctamente');
    res.redirect('/iniciar-sesion');
};
