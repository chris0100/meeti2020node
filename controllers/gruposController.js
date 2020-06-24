const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const uuid = require('uuid/v4');




//Muestra el formulario
exports.formNuevoGrupo = async (req, res) => {
    const categorias = await Categorias.findAll();

    res.render('nuevo-grupo',{
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    });
};

//********************************************************************
//********************************************************************

//Almacena los datos en la BD - POST
exports.crearGrupoPost = async (req,res) => {
    //Sanitizar los campos
    req.sanitizeBody('nombre');
    req.sanitizeBody('url');

    //validaciones con express
    req.checkBody('categoria', 'Debes seleccionar al menos una categoria').notEmpty();

    //capturar errores con express
    const erroresExpress = req.validationErrors();
    if (erroresExpress.length){
        const errExp = erroresExpress.map(obj => obj.msg);
        req.flash('error',errExp);
        res.redirect('/nuevo-grupo');
    }

    //guardar campos foreign
    const grupo = req.body;
    grupo.usuarioId = req.user.id;
    grupo.categoriaId = req.body.categoria;

    //leer la imagen
    if(req.file){
        grupo.imagen = req.file.filename;
    }

    grupo.id = uuid();

    try{
        //almacenar en la base de datos
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el grupo correctamente');
        res.redirect('/administracion');
    }
    catch (e) {

        //Capturar errores de sequelize
        const erroresSequelize = e.errors.map(obj => obj.message);

        req.flash('error',erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
};




//Subir imagen
const configuracionMulter = {
    limits: { fileSize : 1000000},
    storage: fileStorage = multer.diskStorage({
        destination: (req,file,next) => {
            next(null, __dirname+'/../public/uploads/grupos/');
        },
        filename: (req,file,next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req,file,next){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            //El formato es valido
            next(null,true);

        }
        //el formato no es valido
        else{
            //crea el error, se va a if(error) y toma el message del error
            next(new Error('Formato no valido'), false);
        }
    }
};

const upload = multer(configuracionMulter).single('imagen');


exports.subirImagen = (req,res,next) => {
    upload(req,res, function (error) {
        if (error){
            if (error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error','El archivo es muy grande');
                }
                else{
                    req.flash('error',error.message);
                }
            }
            else if(error.hasOwnProperty('message')){
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        }
        else{
            next(); //manda al siguiente middleware
        }
    });
};

//********************************************************************
//********************************************************************


//Formulario para editar grupo
exports.formEditarGrupo = async (req,res) => {
    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.grupoId));
    consultas.push(Categorias.findAll());

    //Promise con await
    const [grupo, categorias] = await Promise.all(consultas);

    res.render('editar-grupo', {
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    })
};


//Enviar editar grupo
exports.editarGrupoPost = async (req,res,next) => {
    const grupo = await Grupos.findOne({
        where:{
            id: req.params.grupoId,
            usuarioId: req.user.id
        }
    });

    console.log(grupo)
    console.log('**************')
    console.log(req.body)


    //si el grupo no coincide con el usuario
    if(!grupo){
        req.flash('error','Operacion invalida');
        res.redirect('/administraction');
        return next();
    }

    //leer los valores
    const {nombre, descripcion, categoriaId, url} = req.body;



    //asignar los valores
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    //guardar en la BD
    await grupo.save();
    req.flash('exito', 'Cambios Almacenados correctamente');
    res.redirect('/administracion');

};


//GET - Muestra el formulario para editar una imagen de un grupo
exports.formEditarImagen = async(req,res) => {
    const grupo = await Grupos.findOne({
        where:{
            id: req.params.grupoId,
            usuarioId: req.user.id
        }})

    res.render('imagen-grupo',{
        nombrePagina: `Editar Imagen Grupo : ${grupo.nombre}`,
        grupo
    })
};



//POST - Cambiar imagen de grupo
exports.editarImagenPost = async(req,res,next) => {
    const grupo = await Grupos.findOne({
        where:{
            id: req.params.grupoId,
            usuarioId: req.user.id
        }})

    //No existe grupo
    if (!grupo){
         req.flash('error','Operacion no valida');
         res.redirect('/iniciar-sesion');
         return next();
    }


    //Si hay imagen anterior y nueva, se borra la anterior
    if (req.file && grupo.imagen){
        const imagenAnterior = __dirname+`/../public/uploads/grupos/${grupo.imagen}`;

        //Eliminar archivo con filesystem
        fs.unlink(imagenAnterior, (error) => {
            if (error){
                console.log(error);
            }
            return;
        });
    }

    //Si hay imagen nueva, la guardamos
    if (req.file){
        grupo.imagen = req.file.filename;
    }

    //guardar en la base de datos
    await grupo.save();
    req.flash('exito','Imagen guardada satisfactoriamente');
    res.redirect('/administracion');
};




//GET - MUESTRA EL FORMULARIO PARA ELIMINAR GRUPO
exports.formEliminarGrupo = async (req,res,next) => {
    const grupo = await Grupos.findOne({
        where:{
            id: req.params.grupoId,
            usuarioId: req.user.id
        }
    });


    if (!grupo){
        req.flash('error', 'Operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    //todo bien, ejecutar la vista
    res.render('eliminar-grupo',{
        nombrePagina: `Eliminar Grupo: ${grupo.nombre}`,
    })
};


//POST - ELIMINA EL GRUPO
exports.eliminarGrupoPost = async (req,res,next) => {
    const grupo = await Grupos.findOne({
        where:{
            id: req.params.grupoId,
            usuarioId: req.user.id
        }
    });


    if (!grupo){
        req.flash('error', 'Operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    //Eliminar la imagen
    if(grupo.imagen){
        const imagenAnterior = __dirname+`/../public/uploads/grupos/${grupo.imagen}`;

        //Eliminar archivo con filesystem
        fs.unlink(imagenAnterior, (error) => {
            if (error){
                console.log(error);
            }
            return;
        });
    }


    //eliminar el grupo
    await Grupos.destroy({
        where: {
            id: req.params.grupoId
        }
    });


    //redireccionar al usuario
    req.flash('exito', 'Grupo eliminado satisfactoriamente');
    res.redirect('/administracion');
};









