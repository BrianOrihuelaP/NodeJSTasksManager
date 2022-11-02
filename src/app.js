const express = require('express');
//exportando las dependencias descargadas
const { engine } = require('express-handlebars'); //configurando el motor el cual renderizara las plantillas html
const myconnection = require('express-myconnection'); //importando el modulo de conexion sql
const session = require('express-session'); //requiere paquete express session
const bodyParser = require('body-parser');
const mysql = require('mysql');

//A continuación importamos el codigo que marca las rutas:
const taskRoutes = require('./routes/tasks')

const app = express(); //asignamos una consante al frma express
app.set('port', 4000); //configuramos el puerto de express
app.set('views', __dirname + '/views'); //aqui colocamos el path de las vistas 

app.engine('.hbs', engine({
    //aqui se especificara el tipo de archivo del motor de renderizado
    extname: '.hbs',
}));

app.set('view engine', 'hbs');

//el bodyparser nos permite imprimir y/o usar inputs y ver su contenido en consola
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(myconnection(mysql, {
    //configurando conexion a mariadb
    host: 'localhost',
    user: 'root',
    password: '4236',
    port: '3366',
    database: 'crudnode'
}, 'single'));

//para el login
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.listen(app.get('port'), () => {
    // para probar que la app se este ejecutando correctamente
    console.log('Listening on port ', app.get('port'));
});

app.use('/', taskRoutes);
app.use(bodyParser.json());//esta linea me permite ver los datos del form a manera de objeto

app.get('/', (req, res) => {
    //configuramos el metodo get y colocamos el path raiz del proyecto
    //si la sesion ya esta iniciada entonces mandame al home
    if (req.session.loggedin == true) {
        //Aqui renderizamos la pagina home (pagina de inicio) y devolvemos el nombre del usuario
        res.render('home', { name: req.session.name });
    } else {
        //si no devuelveme al login
        res.redirect('/login');
    }
});
