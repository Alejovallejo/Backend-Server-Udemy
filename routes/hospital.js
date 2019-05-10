var express = require('express');



var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Hospitales = require('../models/hospital');


// ===========================
// Obtener los hospitales | Get
// ===========================


app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospitales.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (error, hospitales) => {
      
                if(error){
                    return res.status(500).json({
                
                        ok: false,
                        mensaje: 'Error al Obtener los hospitales',
                        errors: error

                    });
                }

                Hospitales.count({}, (error, conteo) =>{

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total : conteo
                    });
    
                });


    });

});

// ===========================
// Crear Usuario | POST
// ===========================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    Hospitales.find({});

    var hospital = new Hospitales({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario
    });


    hospital.save( (error, hospitalGuardado) => {

        if(error) {
            return res.status(400).json({

                ok: false,
                mensaje: 'Error al Crear el Hospital',
                errors: error
            });

        }

        return res.status(200).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });

});



// ===========================
// Actualizar Hospiutal | PUT
// ===========================



app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;
    

    Hospitales.findById(id, (error, hospital) => {

        if(error){
            return res.status(500).json({

                ok: false,
                mensaje: 'Error al buscar Hospital',
                errors: error

            });
        }


        if(!hospital){

            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + 'no existe',
                errors: {menssage: 'No existe el hospital con este id.'}
            });
        }

        hospital.nombre = body.nombre,
        hospital.img = body.img,
        hospital.usuario = body.usuario

          hospital.save( (error, hospitalGuardado) => {

                if(error) {
                    return res.status(400).json({

                        ok: false,
                        mensaje: 'Error al Actualizar Hospital',
                        errors: error
                    });

                }

                return res.status(200).json({
                    ok: true,
                    hospital: hospitalGuardado
                });

            });


    });

});



// ===========================
// Borrar Un Hospital | DELETE
// ===========================


app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospitales.findByIdAndRemove(id, (error, hospitalBorrado) => {

        if(error){
            return res.status(500).json({

                ok:false,
                mensaje: 'No se pudo Eliminar el Hospital',
                errors: error

            });
        }

        return res.status(200).json({

            ok:true,
            hospital: hospitalBorrado

        });

    });


});


module.exports = app;