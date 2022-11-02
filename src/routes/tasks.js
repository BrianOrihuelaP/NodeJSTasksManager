// En esta seccion importamos y exportamos las rutas, navegacion entre nuestro sistema
// es lo equivalente a los beans en spring mvc
const express = require('express');
const TaskController = require('../Controllers/TaskController');
const router = express.Router();
//Router para crear manejadores de rutas montables y modulares. 
// Una instancia Router es un sistema de middleware y direccionamiento completo

router.get('/tasks',TaskController.index);
router.get('/create',TaskController.create);
router.post('/create',TaskController.store);
router.post('/tasks/delete',TaskController.destroy);
router.get('/tasks/update/:id',TaskController.update);
router.post('/tasks/update/:id',TaskController.updateView);

//aqui recuperamos el hbs con el metodo get para la visualizacion
router.get('/user',TaskController.createUser); 
//aqui llamamos la funcion que nos recuperara la info del form de manera post
router.post('/user',TaskController.insertUser);

//aqui recuperamos el hbs con el metodo get para la visualizacion
router.get('/login',TaskController.login);
//aqui llamamos la funcion que nos recuperara la info del form de manera post para la auth
router.post('/login',TaskController.loginAuth);
//recupera la funcion que destruye la sesion
router.get('/logout',TaskController.logout);

module.exports = router;