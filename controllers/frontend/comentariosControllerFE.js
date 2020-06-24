const Comentarios = require('../../models/Comentarios');
const Meeti = require('../../models/Meeti');


//POST - ENVIA COMENTARIO
exports.agregarComentario = async (req,res,next) =>{

    //obtener el comentario
    const {comentario} = req.body;

    //Crear comentario en la base de datos
    await Comentarios.create({
        mensaje: comentario,
        usuarioId: req.user.id,
        meetiId: req.params.id
    });

    console.log(req.params);

    //Redireccionar a la misma pagina
    res.redirect('back');
    next();
};





//ELIMINA UN COMENTARIO DE LA BASE DE DATOS
exports.eliminarComentario = async(req,res,next) => {
   //toma el id que viene desde el input hidden
    const {comentarioId} = req.body;

    //Consulta el comentario
    const comentario = await Comentarios.findOne({
        where:{
            id: comentarioId
        }
    });

    //verifica si existe
    if (!comentario){
        res.status(404).send('Accion no valida');
        return next();
    }

    //consultar el meeti del comentario
    const meeti = await Meeti.findOne({
        where: {
            id: comentario.meetiId
        }
    });

    //verificar que quien lo borra sea el creador
    if (comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id){
        await Comentarios.destroy({
            where: {
                id: comentario.id
            }
        });
        res.status(200).send('Comentario eliminado satisfactoriamente');
        return next();
    }
    else{
        res.status(403).send('Accion no valida');
        return next();
    }
};
