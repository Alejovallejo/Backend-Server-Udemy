var express = require('express');



var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Medicos = require('../models/medico');


// ===========================
// Obtener los hospitales | Get
// ===========================


app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medicos.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (error, medicos) => {
      
                if(error){
                    return res.status(500).json({
                
                        ok: false,
                        mensaje: 'Error al Obtener los Medicos',
                        errors: error

                    });
                }

                Medicos.count({}, (error, conteo) =>{

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
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

    Medicos.find({});

    var medico = new Medicos({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario,
        hospital: body.hospital
    });


    medico.save( (error, MedicoGuardado) => {

        if(error) {
            return res.status(400).json({

                ok: false,
                mensaje: 'Error al Crear el Medico',
                errors: error
            });

        }

        return res.status(200).json({
            ok: true,
            medico: MedicoGuardado
        });

    });

});



// ===========================
// Actualizar Hospiutal | PUT
// ===========================



app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;
    

    Medicos.findById(id, (error, hospital) => {

        if(error){
            return res.status(500).json({

                ok: false,
                mensaje: 'Error al buscar el Medico',
                errors: error

            });
        }


        if(!medico){

            return res.status(400).json({
                ok: false,
                mensaje: 'El Medico con el id ' + id + 'no existe',
                errors: {menssage: 'No existe el Medico con este id.'}
            });
        }

        medico.nombre = body.nombre,
        medico.img = body.img,
        medico.usuario = body.usuario,
        medico.hospital = body.hospital
        

          medico.save( (error, MedicoGuardado) => {

                if(error) {
                    return res.status(400).json({

                        ok: false,
                        mensaje: 'Error al Actualizar El Medico',
                        errors: error
                    });

                }

                return res.status(200).json({
                    ok: true,
                    medico: MedicoGuardado
                });

            });


    });

});



// ===========================
// Borrar Un Hospital | DELETE
// ===========================


app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medicos.findByIdAndRemove(id, (error, MedicoBorrado) => {

        if(error){
            return res.status(500).json({

                ok:false,
                mensaje: 'No se pudo Eliminar el Medico',
                errors: error

            });
        }

        return res.status(200).json({

            ok:true,
            medico: MedicoBorrado

        });

    });


});


module.exports = app;