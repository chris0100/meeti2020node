const express = require('express');
const router = require('./routes');
const path = require('path');
const expressLayouts = require('express-ejs-layouts')
const db = require('./config/db');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const passport = require('./config/passport');


//Manejo de la base de datos y modelos
db.sync().then(() => console.log('DB CONECTADA')).catch(error => console.log(error));
require('./models/Usuarios');
require('./models/Categorias');
require('./models/Grupos');
require('./models/Meeti');
require('./models/Comentarios');

//Variables de desarrollo
require('dotenv').config({path: 'variables.env'})


//Declara express
const app = express();


//body parser, leer formulario
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Express validator (validacion con bastantes funciones)
app.use(expressValidator());

//Habilitar EJS como template engine
app.use(expressLayouts)
app.set('view engine', 'ejs')


//Ubicacion vistas
app.set('views', path.join(__dirname, './views'));

//archivos estaticos
app.use(express.static('public'));

//habilitar cookie parser
app.use(cookieParser());

//crear la sesion
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

//inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//Agrega flash message
app.use(flash());

//Middleware propio(usuario logueado, flash messages, fecha actual)
app.use((req, res, next) => {
    res.locals.usuario = {...req.user} || null;
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});


//Routing
app.use('/', router());

//Leer el host y el puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 80;


//agrega el puerto
app.listen(port, () => {
    console.log('el servidor esta funcionando')
});
