import axios from 'axios';
import Swal from "sweetalert2";

document.addEventListener('DOMContentLoaded', () => {
    const formsEliminar = document.querySelectorAll('.eliminar-comentario');

    //revisar que exista los formularios
    if (formsEliminar.length > 0) {
        formsEliminar.forEach(obj => {
            obj.addEventListener('submit', eliminarComentario);
        })
    }
});

function eliminarComentario(e) {
    e.preventDefault();

    Swal.fire({
        title: 'Eliminar comentario',
        text: "Un comentario eliminado no se puede recuperar",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Borrar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {

        if (result.value) {
            //tomar el id del comentario
            const comentarioId = this.children[0].value;

            //crear el objeto
            const datos = {
                comentarioId
            };

            //el this.action y datos es lo que se envia a comentariosControllerFE,
            //ya luego lo que viene es la respuesta que el envia
            axios.post(this.action, datos)
                .then(respuesta => {
                    Swal.fire(
                        'Eliminado!',
                        respuesta.data,
                        'success'
                    );

                    //Eliminar del DOM
                    this.parentElement.parentElement.remove();

                })
                .catch(error => {
                    if (error.response.status === 403 || error.response.status === 404){
                        Swal.fire('Error', error.response.data,'error');
                    }
                });
        }
    });


}
