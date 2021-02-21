const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//MUESTRA EL PANEL PRINCIPAL DE ADMINISTRACION
exports.panelAdministracion = async (req, res) => {

    //consultas
    const consultas = [];

    //Busca todos los grupos
    consultas.push(Grupos.findAll({
        where: {
            usuarioId: req.user.id
        }
    }));


    //Proximos meetis
    consultas.push(Meeti.findAll({
        where: {
            usuarioId: req.user.id,
            fecha: {[Op.gte]: moment(new Date()).format("YYYY-MM-DD")}
        },
        order: [
            ['fecha', 'ASC']
        ]
    }));


    //Meetis que ya pasaron
    consultas.push(Meeti.findAll({
        where: {
            usuarioId: req.user.id,
            fecha: {[Op.lt]: moment(new Date()).format("YYYY-MM-DD")}
        }
    }));


    //Array destructuring
    const [grupos, meeti, meetiOld] = await Promise.all(consultas);


    res.render('administracion', {
        nombrePagina: 'Panel Administracion',
        grupos,
        meeti,
        moment,
        meetiOld
    })
};
