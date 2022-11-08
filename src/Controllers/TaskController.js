// Aqui creamos las funciones que nos responden e inserta a la DB
var idUser;
const bcrypt = require('bcrypt'); //usamos la dependencia bcrypt (npm install bcrypt) para cifrado de contras
function index(req, res) {

    if (req.session.loggedin == true) {
        //aqui hacemos la consulta hacia maria y lo mostamos con un log en tipo json
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM tasks where idUsers = ?', [idUser], (err, tasks) => {
                if (err) {
                    res.json(err);
                } res.render('tasks/index', { tasks, name: req.session.name});
            })
        })
    } else {
        //si no devuelveme al login
        res.redirect('/login');
    }
}

function create(req, res) {
    // res.render('tasks/create');
    //si la sesion esta iniciada entonces renderizame y manda el name para el encabezado
    if (req.session.loggedin == true) {
        //Aqui renderizamos la pagina home (pagina de inicio) y devolvemos el nombre del usuario
        res.render('tasks/create', { name: req.session.name });
    } else {
        //si no devuelveme al login
        res.redirect('/login');
    }
}

// funcion la cual me permite insertar datos a mariadb
function store(req, res) {
    // creamos la constante data la cual recupera la info del form
    const data = req.body;
    const idUsuario = idUser;
    req.getConnection((err, conn) => {
        conn.query('INSERT INTO tasks (title, description,progress,idUsers) VALUES (?,?,?,?)', [data.title,data.description,data.progress,idUsuario], (err, rows) => {
            //una vez que se hayan metidos los datos al maria, redireccioname a la lista
            console.log("Insertando con idUser: " + idUser);
            res.redirect('/tasks');
        });
    });
}
// con esta funcion recuperamos el id el cual hemos seleccionado en el frontend y eliminamos el registro
function destroy(req, res) {
    const id = req.body.id; //recuperamos el id a partir del objeto json 
    req.getConnection((err, conn) => {
        //hacemos la cosnulta a la db con ayuda del objeto conn
        conn.query('DELETE FROM tasks WHERE ID = ?', [id], (err, rows) => {
            res.redirect('/tasks'); //despues de haber hecho la eliminacion vuelveme a redireccionar, reload
        })
    })
}

// con esta funcion recuperamos el id el cual hemos seleccionado en el frontend para mostrarlo en el update
function update(req, res) {
    const id = req.params.id; //recuperamos el id a partir del link a, "obten el parametro id del link"
    req.getConnection((err, conn) => {
        //consultamos a la db con el id obtenido
        conn.query('SELECT * FROM tasks WHERE id = ?', [id], (err, tasks) => {
            if (err) {
                res.json(err);
            } res.render('tasks/update', { tasks, name: req.session.name});
        })
    })

}

//con esta funcion actualizamos los datos obtenidos en la pagina update
function updateView(req, res) {
    // esta funcion es para obtener los datos del form update
    const id = req.params.id;
    const data = req.body;
    // console.log(data);para probar si funciona 
    req.getConnection((err, conn) => {
        //hacemos la cosnulta a la db con ayuda del objeto conn
        conn.query('UPDATE tasks SET ? WHERE ID = ?', [data, id], (err, rows) => {
            res.redirect('/tasks'); //despues de haber hecho la eliminacion vuelveme a redireccionar, reload
        })
    })
}

// funciones para reedirigir e insertar usuarios
//aqui marcamos la ruta a user, respondemos la peticion a el hbs
function createUser(req, res) {
    //si la sesion no esta iniciada entonces dejame entrar al registro
    if (req.session.loggedin != true) {
        res.render('tasks/user');
    } else {
        //si esta iniciada la sesion devuelveme al home
        res.redirect("/");
    }
}
// funcion la cual me permite insertar datos a mariadb para el registro de usuarios
function insertUser(req, res) {
    // creamos la constante data la cual recupera la info del form
    const data = req.body;
    //la siguiente funcion es para consultar si existe el campo username en la db antes de registrar
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM users WHERE username = ?', [data.username], (err, userdata) => {
            if (userdata.length > 0) {
                // console.log("user already exists");
                res.render('tasks/user', { error: 'Error: User already exists!!!' });
            } else {
                bcrypt.hash(data.password, 12).then(hash => {
                    //nos devuelve la hash obtenida del password del body
                    // console.log("contraseña del form: " + hash); 
                    // con la siguiente instruccion guardamos la hash en el objeto del form
                    data.password = hash;
                    req.getConnection((err, conn) => {
                        conn.query('INSERT INTO users SET ?', [data], (err, rows) => {
                            res.redirect('/');
                        });
                    });
                });
            }
        });
    });
}

// funciones las cuales consultara si existe o no el usuario en la db
function login(req, res) {
    // aqui marcamos la ruta a login, respondemos la peticion a el hbs
    //si la sesion no esta iniciada entonces dejame entrar al login
    if (req.session.loggedin != true) {
        res.render('tasks/login');
    } else {
        //si no devuelveme al home
        res.redirect("/");
    }
}

// funcion la cual me permite CONSULTAR hacia la db
function loginAuth(req, res) {
    // creamos la constante data la cual recupera la info del form
    const data = req.body;
    // console.log(data);
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM users WHERE username = ?', [data.username], (err, userdata) => {
            if (userdata.length > 0) {
                //si el usuario existe ok
                //METODO PARA AUTENTICAR LA CONTRASEÑA:
                userdata.forEach(element => {
                    //recorremos lo de la db para obtener solo la password
                    bcrypt.compare(data.password, element.password, (err, isMatch) => {
                        //vamos a comparar la info del form con la base de datos:
                        // data.password es lo del form mientras que element.password es lo de la base de datos.
                        if (!isMatch) {
                            res.render('tasks/login', { error: 'Error: incorrect password!!!' });
                        } else {
                            //si encontramos que es igual la contraseña entonces recuperamos su id con ayuda del forEach
                            idUser = element.idUsers;
                            //aqui indicamos que se ha iniciado una sesion de usuarios y reedirigimos a tasks
                            req.session.loggedin = true;
                            req.session.name = element.name;
                            res.redirect("/");
                        }
                    });
                });

            } else {
                // si no existe el usuario mandame error
                // console.log("user already exists");
                res.render('tasks/login', { error: 'Error: User doesn´t exists!!!' });
            }
        });
    });
}

function logout(req, res) {
    if (req.session.loggedin == true) {
        //si existe una sesion iniciada destruye la sesion
        req.session.destroy();
    }
    //si no esta iniciada la sesion entonces manda al login
    res.redirect('/login');
}


module.exports = {
    index: index,
    create: create,
    store: store,
    destroy: destroy,
    update: update,
    updateView: updateView,
    createUser: createUser,
    insertUser: insertUser,
    login: login,
    loginAuth: loginAuth,
    logout: logout
}
// exportamos nuestras funciones las cuales importaremos en routes