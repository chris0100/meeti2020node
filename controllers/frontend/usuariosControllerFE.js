const Usuarios = require('../../models/Usuarios');
const Grupos = require('../../models/Grupos');


//GET MUESTRA LA INFO DEL USUARIO CREADOR DEL MEETI
exports.mostrarUsuario = async(req,res,next) => {
    const consultas = [];

    //consultas al mismo tiempo
    consultas.push(Usuarios.findOne({
        where: {
            id: req.params.id
        }
    }));

    consultas.push(Grupos.findAll({
        where: {
            usuarioId: req.params.id
        }
    }));

    //Destructuring
    const [usuario, grupos] = await Promise.all(consultas);

    if (!usuario){
        res.redirect('/');
        return next();
    }

    //mostrar la vista
    res.render('mostrar-perfil',{
        nombrePagina: `Perfil Usuario: ${usuario.nombre}`,
        usuario,
        grupos
    })











};
