var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medicos = require('../models/medico');
var Usuarios = require('../models/usuario');


// ===========================
// Busqueda General
// ===========================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var busquedaDeElla = new RegExp( busqueda, 'i' );


    Promise.all([
        buscarHospitales(busqueda,busquedaDeElla), 
        buscarMedicos(busqueda,busquedaDeElla),
        buscarUsuario(busqueda, busquedaDeElla)
    ])
        .then(respuestas => {

            res.status(200).json({
                ok:true,
                hospitales: respuestas[0],
                medico: respuestas[1],
                usuario: respuestas[2]

            });

        });

    });


// ===========================
// Busqueda especifica de coleccion
// ===========================


app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var busquedaDeElla = new RegExp( busqueda, 'i' );
    var promesa;


    switch( tabla ){

        case 'usuarios':
            promesa = buscarUsuario(busqueda, busquedaDeElla);
            break;

        case 'medico':
            promesa = buscarMedicos(busqueda, busquedaDeElla);
            break;


        case 'hospitales':
            promesa = buscarHospitales(busqueda, busquedaDeElla);
            break;


        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'los tipos de busquedas solo son usuarios medicos y hospitales',
                error: { message : 'Tipo  de tabla/o collecion no valido' }
            });


    }


    promesa.then( data => {

        return res.status(200).json({
            ok: true,
            [tabla]: data
            
        });


    });

});

    // ===========================
    // Funciones Especificas
    // ===========================


    function buscarHospitales(busqueda, busquedaDeElla){

        return new Promise((resolve, reject) => {
        
    
            Hospital.find({nombre: busquedaDeElla})
            
                    .populate('usuario', 'nombre email')
                    .exec((error, hospitales) => {
    
                if(error){

                    reject('Error al cargar hospitales', error);
                    
                }else{

                    resolve(hospitales);

                }
    
            });

        });

    }



    function buscarMedicos(busqueda, busquedaDeElla){

        return new Promise((resolve, reject) => {
        
    
            Medicos.find({nombre: busquedaDeElla})
                    .populate('usuario', 'nombre email')
                    .populate('hospital')
                    .exec((error, medico) => {
    
                if(error){

                    reject('Error al cargar medicos', error);
                    
                }else{

                    resolve(medico);

                }
    
            });

        });

    }




    function buscarUsuario(busqueda, busquedaDeElla){

        return new Promise((resolve, reject) => {
        
    
            Usuarios.find({}, 'nombre email rol')

                    .or([{ 'nombre':  busquedaDeElla }, { 'email': busquedaDeElla }])
                    .exec( ( error, usuario ) => {

                        if(error){

                            reject('Error al cargar usuarios', error);

                        
                        }else{

                            resolve(usuario);

                        }

                });
        });

    }

module.exports = app;