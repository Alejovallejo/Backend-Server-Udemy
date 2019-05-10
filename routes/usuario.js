var express = require('express');
var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;


var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// ==========================================
// Obtener todos los usuarios
// ==========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }

                Usuario.count({}, (error, conteo) =>{

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                    total : conteo
                });

            });



            });
});



// ==========================================
// Crear un nuevo usuario
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    Usuario.find({}, 'nombre email img role');

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role.toUpperCase()
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });


    });

});



// ==========================================
// Actualizar Usuario
// ==========================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    
    var id = req.params.id;
    var body = req.body;
    
    Usuario.findById(id, (err, usuario) => {

        

        if(err){
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar usuario',
            errors: err
    
        });
    
    }

    if(!usuario ){

        return res.status(400).json({
            ok: false,
            mensaje: 'El usuario con el id ' + id + 'no existe ',
            errors: {menssage: 'No existe un usuario con ese ID'}
    
        });
    }


    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role.toUpperCase();

    usuario.save((err, usuarioGuardado) =>{


        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar usuario',
                errors: err
        
            });
            

        }

            usuarioGuardado.password = ':)';

            return res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
            
        });


    });

 
});



// ===========================
// Borrar un Usuario
// ===========================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (error, usuarioBorrado) => {

        if(error){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar usuario',
                errors: error
        
            });   

        }
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioBorrado
            });

    });

});



module.exports = app;
