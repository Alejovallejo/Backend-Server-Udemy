var express = require('express');


var fileUpload = require('express-fileupload');
var fs = require('fs');



var app = express();








app.use(fileUpload());
//     limits: { fileSize: 50 * 1024 * 1024 },
//   }));




// ===========================
// Importar Modelos
// ===========================
var Usuarios = require('../models/usuario');
var Hospitales = require('../models/hospital');
var Medicos = require('../models/medico');




// ===========================
// Put de la funcion
// ===========================
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if(tiposValidos.indexOf( tipo ) < 0){
        return res.status(400).json({
        ok: false,
        mensaje: 'Tipo de coleccion no es valida',
        errors: { message: 'Tipo de coleccion no es valida' }
        });
    }



    if(!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: {  message: 'Debe de seleccionar una imagen' }
            });

        }
// ===========================
// obtener nombre archivo
// ===========================


var archivo = req.files.imagen;
var nombreCortado = archivo.name.split('.');
var extensionArchivo = nombreCortado[ nombreCortado.length -1 ];


// ===========================
// solo extenciones permitidas
// ===========================

var extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];


        if( extencionesValidas.indexOf( extensionArchivo ) <0 ){

            return res.status(400),json({

                ok:false,
                mensaje: 'Extension no válida',
                errors: { message: 'La extencsionesvalidas son ' + extencionesValidas.join(', ') }

            });

        }


    // ===========================
    // Nopmbre de archivo Personalizado
    // ===========================
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }_${ archivo.name }`;



    // ===========================
    // mover archivo
    // ===========================

    var path = `./imagenes/${ tipo }/${ nombreArchivo }`;
    // var path = (__dirname + `/uploads/${tipo}/${nombreArchivo}`);
    // var path = './server/uploads/' + tipo + '/' + nombreArchivo;

        archivo.mv(path, error => {
            if(error){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al mover el archivo',
                    errors: error

                });
            }

            
            subirPorTipo(tipo, id, nombreArchivo, res);

           

        });


});




function subirPorTipo(tipo, id, nombreArchivo, res){

    if(tipo === 'usuarios'){


        Usuarios.findById(id, ( error, usuario) => {

                var pathViejo = './imagenes/usuarios/' + usuario.img;
                
                

                // Si existe, elimina imagen anterior
                if(fs.existsSync(pathViejo )){
                    fs.unlinkSync(pathViejo);
                }


                usuario.img = nombreArchivo;

                usuario.save((error, usuarioActualizado) => {


                        usuarioActualizado.password = ':)';

                        return res.status(200).json({
                            ok: true,
                            mensaje: 'Imagen de usuario actualizada',
                            usuario: usuarioActualizado
                });

            });

        });
        
    }

    
    if(tipo === 'medicos'){
        
        Medicos.findById(id, ( error, medico) => {

            var pathViejo = './imagenes/medicos/' + medico.img;
            console.log(pathViejo);


            // Si existe, elimina imagen anterior
            if(fs.existsSync(pathViejo )){
                fs.unlinkSync(pathViejo);
            }


            medico.img = nombreArchivo;

            

            medico.save((error, medicoActualizado) => {

                    medicoActualizado.password = ':)';

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        medico: medicoActualizado
            });

        });

    });

        }


    if(tipo === 'hospitales'){

        Hospitales.findById(id, ( error, hospital) => {

            var pathViejo = './imagenes/hospitales/' + hospital.img;
            console.log(pathViejo);


            // Si existe, elimina imagen anterior
            if(fs.existsSync(pathViejo )){
                fs.unlinkSync(pathViejo);
            }


            hospital.img = nombreArchivo;

            

            hospital.save((error, hospitalActualizado) => {

                    hospitalActualizado.password = ':)';

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hospital: hospitalActualizado
            });

        });

    });

        
   }
    

}




module.exports = app;

