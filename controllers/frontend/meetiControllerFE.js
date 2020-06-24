const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const Categorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//GET - MUESTRA LA INFORMACION DETALLADA DE LOS MEETI
exports.mostrarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    //Si no existe
    if (!meeti) {
        res.redirect('/');
    }

    //Consultar por meetis cercanos
    const ubicacion = Sequelize.literal(`ST_GeomFromText( 'POINT( ${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]})' )`);


    //ST_DISTANCE-Sphere = Retorna una linea en metros
    const distancia = Sequelize.fn('ST_DistanceSphere', Sequelize.col('ubicacion'),ubicacion);

    //Encontrar meeti's cercanos
    const meetisCercanos = await Meeti.findAll({
        order: distancia, //los ordena del mas cercano al mas lejano
        where: Sequelize.where(distancia, { [Op.lte] : 2000 }), //2km
        limit: 3, //maximo 3
        offset: 1,
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });



    //luego consulta los comentarios
    const comentarios = await Comentarios.findAll({
        where: {
            meetiId: meeti.id
        },
        include: [
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });


    //pasar el resultado hacia la vista
    res.render('mostrar-meeti', {
        nombrePagina: meeti.titulo,
        meeti,
        moment,
        comentarios,
        meetisCercanos
    })
};





// POST CONFIRMA O CANCELA SI EL USUARIO ASISTIRA AL MEETI
exports.confirmarAsistencia = async (req, res) => {

    const {accion} = req.body;

    if (accion === 'confirmar') {
        //agregar el usuario
        Meeti.update({
                'interesados': Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id)
            },
            {
                'where': {'slug': req.params.slug}
            });

        //mensaje
        res.send('Has confirmado tu asistencia');
    } else {
        //cancelar la asistencia
        Meeti.update({
                'interesados': Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id)
            },
            {
                'where': {'slug': req.params.slug}
            });

        //mensaje
        res.send('Has cancelado tu asistencia');
    }
};






//GET MUESTRA AL LISTADO DE ASISTENTES
exports.mostrarAsistentes = async (req, res) => {
    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        attributes: ['interesados']
    });

    //extraer interesados
    const {interesados} = meeti;

    const asistentes = await Usuarios.findAll({
        attributes: ['nombre', 'imagen'],
        where: {id: interesados}
    });

    //crear la vista y pasar los datos
    res.render('asistentes-meeti', {
        nombrePagina: 'Listado Asistentes Meeti',
        asistentes
    })
};






//GET MUESTRA LOS MEETIS AGRUPADOS POR CATEGORIA
exports.mostrarCategoria = async (req, res, next) => {
    const categoria = await Categorias.findOne({
        where: {
            slug: req.params.categoria
        },
        attributes: ['id', 'nombre']
    });

    const meetis = await Meeti.findAll({
        order: [
            ['fecha', 'ASC'],
            ['hora', 'ASC']
        ],
        include: [
            {
                model: Grupos,
                where: {categoriaId: categoria.id}
            },
            {
                model: Usuarios
            }
        ]
    });

    res.render('categoria', {
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    })
};














