import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
   const asistencia = document.querySelector('#confirmar-asistencia');

   if (asistencia){
       asistencia.addEventListener('submit', confirmAsistencia);
   }
});


function confirmAsistencia(e) {
    e.preventDefault();

    const btn = document.querySelector('#confirmar-asistencia input[type="submit"]');
    let accion = document.querySelector('#accion').value;
    const mensaje = document.querySelector('#mensaje');

    const datos = {
        accion
    };



    axios.post(this.action, datos)
        .then(respuesta => {
            if (accion === 'confirmar'){
                document.querySelector('#accion').value = 'cancelar';
                btn.value = 'Cancelar';
                btn.classList.remove('btn-azul');
                btn.classList.add('btn-rojo');
            }else{
                document.querySelector('#accion').value = 'confirmar';
                btn.value = 'Si';
                btn.classList.remove('btn-rojo');
                btn.classList.add('btn-azul')
            }
            //mostrar un mensaje
            if (mensaje.hasChildNodes()){
                mensaje.removeChild(mensaje.firstChild);
            }
            mensaje.appendChild(document.createTextNode(respuesta.data))
        })
}
