const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/emails');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu Cuenta'
    })
}


exports.crearNuevaCuentaPost = async (req, res) => {
    const usuario = req.body;

    //validaciones con express validator para password
    req.checkBody('confirmar', 'El password confirmado no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'El password es diferente').equals(req.body.password);

    //Leer los errores de express
    const erroresExpress = req.validationErrors();

    try {
        await Usuarios.create(usuario);

        //URL de confirmacion
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        //Enviar el email de confirmacion
        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        });


        req.flash('exito', 'Hemos enviado un E-mail, confirma tu cuenta');
        res.redirect('/iniciar-sesion');

    } catch (e) {

        //Extraer el message de los errores
        const erroresSequelize = e.errors.map(obj => obj.message);

        //Extraer el msg de los errores
        const errExp = erroresExpress.map(err => err.msg);

        //unir errores
        const listaErrores = [...erroresSequelize, ...errExp];

        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }
};


//REVISA EL LINK DE CONFIRMACION DE CUENTA
exports.confirmarCuenta = async (req, res, next) => {
    console.log('revisa usuario');
    //verificar que el usuario existe
    const usuario = await Usuarios.findOne({
        where:
            {
                email: req.params.email
            }
    });

    //si no existe, redireccionar
    if (!usuario) {
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/crear-cuenta');
    }

    //si existe confirmar subscripcion
    usuario.activo = 1;
    await usuario.save();

    //muestra mensaje y redirecciona
    req.flash('exito', 'La cuenta se ha confirmado, ya puedes iniciar sesion');
    res.redirect('/iniciar-sesion');

};



//GET - MUESTRA EL FORMULARIO DE INICIAR SESION
exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Inicia Sesión'
    })
};


/////////////////////////
//MUESTRA EL FORMULARIO PARA EDITAR EL PERFIL

//GET - MUESTRA EL FORMULARIO PARA EDITAR EL PERFIL
exports.formEditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina: 'Editar Perfil',
        usuario
    })
};


//POST - ENVIA LOS DATOS PARA EDITAR EL PERFIL
exports.editarPerfilPost = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //sanitizar datos
    req.sanitizeBody('nombre');
    req.sanitizeBody('descripcion');
    req.sanitizeBody('email');

    //leer datos del form
    const {nombre, descripcion, email} = req.body;
    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    await usuario.save();
    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');
};



//GET MUESTRA EL FORM PARA MODIFICAR EL PASSWORD
exports.formCambiarPassword = (req,res) => {
    res.render('cambiar-password', {
        nombrePagina: 'Cambiar Password'
    });
};


//POST CAMBIA EL PASSWORD
exports.cambiarPasswordPost = async (req, res,next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //verificar que el password actual sea correcto
    if (!usuario.validarPassword(req.body.anterior)){
        req.flash('error', 'Ha ocurrido un error, revisa tus datos');
        res.redirect('/cambiar-password');
        return next();
    }

    //verificar que el campo de nuevo password no este vacio
    if(req.body.nuevo === ''){
        req.flash('error','Todos los campos deben estar llenos');
        res.redirect('/cambiar-password');
        return next();
    }

    //Si el password es correcto, debe hashear el nuevo
    //asignar el password hasheado
    usuario.password = usuario.hashPassword(req.body.nuevo);

    //guardar en la BD
    await usuario.save();

    //redireccionar
    req.logout();
    req.flash('exito', 'Password modificado correctamente, vuelve a iniciar sesión');
    res.redirect('/iniciar-sesion');
};




//GET - MUESTRA EL FORM PARA CAMBIO DE IMAGEN DE PERFIL
exports.formSubirImagenPerfil = async (req,res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //mostrar la vista
    res.render('imagen-perfil',{
        usuario,
        nombrePagina: 'Subir Imagen Perfil'
    })
};



//SUBIR IMAGEN IMAGEN
const configuracionMulter = {
    limits: { fileSize : 1000000},
    storage: fileStorage = multer.diskStorage({
        destination: (req,file,next) => {
            next(null, __dirname+'/../public/uploads/perfiles/');
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


exports.subirImagenPerfil = (req,res,next) => {
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


//POST - GUARDAR IMAGEN PERFIL
exports.guardarImagenPerfilPost = async (req,res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //Si hay imagen anterior y nueva, se borra la anterior
    if (req.file && usuario.imagen){
        const imagenAnterior = __dirname+`/../public/uploads/perfiles/${usuario.imagen}`;

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
        usuario.imagen = req.file.filename;
    }

    //guardar en la base de datos
    await usuario.save();
    req.flash('exito','Imagen guardada satisfactoriamente');
    res.redirect('/administracion');
};























