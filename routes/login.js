var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');



//gOOGLE
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);



// ===========================
// Autenticacion de Google
// ===========================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.img,
        google: true,
        payload: payload
    }

  }



app.post('/google', async(req, res) => {


    var token = req.body.token;

    var googleUser = await verify(token)
                    .catch( e => {
                        return res.status(403).json({
                            ok:false,
                            mesaje: 'Token no valido'

                        });
                    });


    Usuario.findOne({ email: googleUser.email }, (error, usuarioDB) => {

        if(error){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Buscar Usuarios',
                errors: error
        
            });   

        }

        if(usuarioDB){
            
            if(usuarioDB.google === false){
            
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar autenticacopm normal',
            
                });   
            }else{

            var token = jwt.sign({ usuario: UsuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

            res.status(200).json({
                ok: true,
                usuario: UsuarioDB,
                token: token,
                id: UsuarioDB._id

                     });


            }

        } else {

            //El usuario no existe.. hay qeu crearlo

            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';


            usuario.save((error, usuarioDB) => {



            }

        }



    });


    // return res.status(200).json({

    //     ok:true,
    //     mensaje: 'OK!',
    //     googleUser: googleUser

    // });

});



// ===========================
// Autentincacion Normal
// ===========================






app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (error, UsuarioSB) => {

        if(error){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Buscar Usuarios',
                errors: error
        
            });   

        }

        if(!UsuarioSB){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - email',
                errores: error
            });
        }

        if(!bcrypt.compareSync( body.password, UsuarioSB.password ) ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - password',
                errores: error
            });
        }

        //Crear un token!!
        UsuarioSB.password = ':)';
        var token = jwt.sign({ usuario: UsuarioSB }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: UsuarioSB,
            token: token,
            id: UsuarioSB._id
        });

    });


});

module.exports = app;



/* login Fernando 


  var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token!!!
        usuarioDB.password = ':)';

        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    });


*/
