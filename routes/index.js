const express = require('express');
const router = express.Router();


//Importar controladores
const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');
const meetiController = require('../controllers/meetiController');
const meetiControllerFE = require('../controllers/frontend/meetiControllerFE');
const usuariosControllerFE = require('../controllers/frontend/usuariosControllerFE');
const gruposControllerFE = require('../controllers/frontend/gruposControllerFE');
const comentariosControllerFE = require('../controllers/frontend/comentariosControllerFE');
const busquedaControllerFE = require('../controllers/frontend/busquedaControllerFE');

module.exports = function () {



//*************************************************************************************************
//**************************************************************************************************
//*************************  AREA PUBLICA   *******************************************************

    //GET- PAGINA PRINCIPAL
    router.get('/', homeController.home);

    //GET MUESTRA UN MEETI
    router.get('/meeti/:slug', meetiControllerFE.mostrarMeeti);

    //GET CONFIRMA LA ASISTENCIA A MEETI
    router.post('/confirmar-asistencia/:slug', meetiControllerFE.confirmarAsistencia);

    //GET MUESTRA ASISTENTES AL MEETI
    router.get('/asistentes/:slug', meetiControllerFE.mostrarAsistentes);

    //GET MUESTRA PERFILES EN EL FRONT END
    router.get('/usuarios/:id', usuariosControllerFE.mostrarUsuario);

    //GET MUESTRA LOS GRUPOS EN EL FRONT END
    router.get('/grupos/:id', gruposControllerFE.mostrarGrupo);

    //GET MUESTRA LOS MEETIS POR CATEGORIA
    router.get('/categoria/:categoria', meetiControllerFE.mostrarCategoria);

    //*******************COMENTARIOS EN EL MEETI*************************//
    //POST - AGREGA COMENTARIOS EN EL MEETI
    router.post('/meeti/:id',
        comentariosControllerFE.agregarComentario);

    //POST - ELIMINA COMENTARIO EN EL MEETI
    router.post('/eliminar-comentario', comentariosControllerFE.eliminarComentario);



    //********************************************************************//
    //******************** BUSQUEDA EN EL MEETI***************************//
    router.get('/busqueda', busquedaControllerFE.resultadosBusqueda);










    //************************************************
    //************CREACION DE CUENTA******************

    //GET - FORMULARIO CREAR CUENTA
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);

    //POST Crear cuenta
    router.post('/crear-cuenta', usuariosController.crearNuevaCuentaPost);

    //GET - CONFIRMAR CUENTA POR EMAIL
    router.get('/confirmar-cuenta/:email', usuariosController.confirmarCuenta);



    //************************************************
    //************INICIAR SESION *********************

    //GET - FORMULARIO INICIAR SESION
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);

    //POST - INICIAR SESION
    router.post('/iniciar-sesion', authController.autenticarUsuarioPost);

    //CERRAR SESION
    router.get('/cerrar-sesion', authController.usuarioAutenticado,
        authController.cerrarSesion);










//*************************************************************************************************
//**************************************************************************************************
//*************************  AREA PRIVADA   *******************************************************


    //***********************************************
    //*************PANEL DE ADMINISTRACION***********

    // GET MOSTRAR PANEL ADMINISTRACION
    router.get('/administracion', authController.usuarioAutenticado,
        adminController.panelAdministracion);




    //***********************************************
    //*************NUEVOS GRUPOS***********

    //GET Mostrar formulario de nuevo grupo
    router.get('/nuevo-grupo', authController.usuarioAutenticado,
                            gruposController.formNuevoGrupo)

    //POST Cargar imagen para el grupo
    router.post('/nuevo-grupo', gruposController.subirImagen,
        gruposController.crearGrupoPost);


    //GET Editar Grupo
    router.get('/editar-grupo/:grupoId',authController.usuarioAutenticado,
        gruposController.formEditarGrupo);

    //POST Enviar edicion grupos
    router.post('/editar-grupo/:grupoId', authController.usuarioAutenticado,
        gruposController.editarGrupoPost);


    //GET Editar la imagen del grupo
    router.get('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarImagen);


    //POST Cambiar imagen del grupo
    router.post('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.editarImagenPost)


    //GET - Formulario para eliminar grupo
    router.get('/eliminar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEliminarGrupo);

    //POST - ELIMINAR GRUPO
    router.post('/eliminar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.eliminarGrupoPost);





    //***********************************************
    //*************NUEVOS MEETIS***********


    //GET NUEVO MEETI
    router.get('/nuevo-meeti', authController.usuarioAutenticado,
        meetiController.formNuevoMeeti);


    //POST NUEVO MEETI
    router.post('/nuevo-meeti', authController.usuarioAutenticado,
        meetiController.sanitizarMeeti,
        meetiController.nuevoMeetiPost);


    //GET EDITAR MEETI
    router.get('/editar-meeti/:id', authController.usuarioAutenticado,
        meetiController.formEditarMeeti);


    //POST ENVIAR EL MEETI EDITADO
    router.post('/editar-meeti/:id', authController.usuarioAutenticado,
        meetiController.editarMeetiPost);

    //GET FORMULARIO PARA ELIMINAR EL MEETI
    router.get('/eliminar-meeti/:id', authController.usuarioAutenticado,
         meetiController.formEliminarMeeti);

    //GET FORMULARIO PARA ELIMINAR EL MEETI
    router.post('/eliminar-meeti/:id', authController.usuarioAutenticado,
        meetiController.eliminarMeetiPost);



    //***********************************************
    //*************EDICION PERFIL***********

    //GET - MOSTRAR FORMULARIO PARA EDITAR PERFIL
    router.get('/editar-perfil',authController.usuarioAutenticado,
        usuariosController.formEditarPerfil
        );

    //POST - ENVIAR DATOS DE EDITAR PERFIL
    router.post('/editar-perfil', authController.usuarioAutenticado,
        usuariosController.editarPerfilPost);


    //GET - MUESTRA FORMULARIO PARA MODIFICACION DEL PASSWORD
    router.get('/cambiar-password', authController.usuarioAutenticado,
        usuariosController.formCambiarPassword);


    //POST - CAMBIAR EL PASSWORD
    router.post('/cambiar-password', authController.usuarioAutenticado,
        usuariosController.cambiarPasswordPost);


    //GET - CAMBIAR IMAGEN DE PERFIL
    router.get('/imagen-perfil', authController.usuarioAutenticado,
        usuariosController.formSubirImagenPerfil);

    //POST - SUBIR IMAGEN DE PERFIL
    router.post('/imagen-perfil', authController.usuarioAutenticado,
        usuariosController.subirImagenPerfil,
        usuariosController.guardarImagenPerfilPost);


    return router;
};
