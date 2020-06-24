const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const uuid = require('uuid/v4');


//GET - MUESTRA EL FROM PARA NUEVOS MEETI
exports.formNuevoMeeti = async (req, res) => {
    const grupos = await Grupos.findAll({
        where: {
            usuarioId: req.user.id
        }
    });


    res.render('nuevo-meeti', {
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    })
};


//POST - ENVIA EL MEETI PARA SER CREADO
exports.nuevoMeetiPost = async (req, res) => {
    //Obtener los datos
    const meeti = req.body;

    //asignar el usuario
    meeti.usuarioId = req.user.id;

    //almacena la ubicacion con un point
    const point = {type: 'Point', coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)]};
    meeti.ubicacion = point;

    //cupo opcional
    if (req.body.cupo === '') {
        meeti.cupo = 0;
    }

    meeti.id = uuid();

    //almacenar en la base de datos
    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Se ha creado el Meeti correctamente');
        res.redirect('administracion');

    } catch (e) {
        //Capturar errores de sequelize
        const erroresSequelize = e.errors.map(obj => obj.message);

        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }
};


//Realizar la sanitizacion de los meeti
exports.sanitizarMeeti = (req, res, next) => {
    //Sanitizacion de los campos
    req.sanitizeBody('titulo');
    req.sanitizeBody('invitado');
    req.sanitizeBody('cupo');
    req.sanitizeBody('fecha');
    req.sanitizeBody('hora');
    req.sanitizeBody('ciudad');
    req.sanitizeBody('estado');
    req.sanitizeBody('pais');
    req.sanitizeBody('lat');
    req.sanitizeBody('lng');
    req.sanitizeBody('grupoId');

    next();
};


//GET MUESTRA EL FORMULARIO PARA EDITAR EL MEETI
exports.formEditarMeeti = async (req, res, next) => {
    const consultas = [];
    consultas.push(Grupos.findAll({
        where: {
            usuarioId: req.user.id
        }
    }));

    consultas.push(Meeti.findByPk(req.params.id));

    //devulve un promise
    const [grupos, meeti] = await Promise.all(consultas);

    if (!grupos || !meeti) {
        req.flash('error', 'Operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    //mostramos la vista
    res.render('editar-meeti', {
        nombrePagina: `Editar meeti: ${meeti.titulo}`,
        grupos,
        meeti
    });
};


//POST ENVIO DEL MEETI EDITADO
exports.editarMeetiPost = async (req, res, next) => {
    const meeti = await Meeti.findOne({
        where: {
            id: req.params.id,
            usuarioId: req.user.id
        }
    });

    if (!meeti) {
        req.flash('error', 'Operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    //asignar los valores
    const {grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng} = req.body

    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.estado = estado;
    meeti.pais = pais;

    //asignar el point
    const point = {type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)]};
    meeti.ubicacion = point;

    //almacenar en la BD
    await meeti.save();
    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');
};


//GET MUESTRA UN FORMULARIO PARA ELIMINAR MEETIS
exports.formEliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({
        where: {
            id: req.params.id,
            usuarioId: req.user.id
        }
    });

    //Si no existe el meeti
    if (!meeti) {
        req.flash('error', 'Operacion invalida');
        res.redirect('/administracion');
        return next();
    }

    //mostrar la vista
    res.render('eliminar-meeti', {
        nombrePagina: `Eliminar Meeti : ${meeti.titulo}`
    });
};



//POST ELIMINA EL MEETI DE LA BASE DE DATOS
exports.eliminarMeetiPost = async (req,res) => {
    await Meeti.destroy({
        where:{
            id: req.params.id
        }
    });

    req.flash('exito', 'Meeti Eliminado');
    res.redirect('/administracion');
};












