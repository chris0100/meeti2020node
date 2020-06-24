import {OpenStreetMapProvider} from 'leaflet-geosearch';
import asistencia from './asistencia';
import eliminarCOmentario from './eliminarComentario';

const lat = document.querySelector('#lat').value || 3.42158;
const lng = document.querySelector('#lng').value || -76.5205;
//const direccion = document.querySelector('#direccion').value || '';
const map = L.map('mapid').setView([lat, lng], 12);
let markers = new L.FeatureGroup().addTo(map);
let marker;

//Colocar el pin en edicion
if (lat && lng) {
    //agregar el pin
    marker = new L.marker([lat,lng], {
        draggable: true,
        autoPan: true
    })
        .addTo(map)
        .bindPopup(direccion)
        .openPopup();

    //asignar al contenedor markers
    markers.addLayer(marker);
}

document.addEventListener('DOMContentLoaded', () => {
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1
    }).addTo(map);


    //buscar la direccion
    const buscador = document.querySelector('#formBuscador');
    buscador.addEventListener('input', buscarDireccion);
});


//Busca la direccion que se coloco en el input
function buscarDireccion(e) {
    if (e.target.value.length > 7) {

        //Si existe un pin anterior limpiarlo
        markers.clearLayers();


        //utiliza el provider y GeoCoder
        //const geocodeService = L.esri.Geocoding.geocodeService();

        const provider = new OpenStreetMapProvider();

        provider.search({
            query: e.target.value
        })
            .then((resultado) => {

                //geocodeService.reverse().latlng(resultado[0].bounds[0], 16).run(function (error, result) {
                //  console.log(result);

                llenarInputs(resultado[0]);

                //mostrar el mapa con el primer resultado
                map.setView(resultado[0].bounds[0], 16);

                //agregar el pin
                marker = new L.marker(resultado[0].bounds[0], {
                    draggable: true,
                    autoPan: true
                })
                    .addTo(map)
                    .bindPopup(resultado[0].label)
                    .openPopup();

                //asignar al contenedor markers
                markers.addLayer(marker);

                //detectar movimiento del marker
                marker.on('moveend', function (e) {
                    marker = e.target;
                    const posicion = marker.getLatLng();
                    map.panTo(new L.LatLng(posicion.lat, posicion.lng));
                });


            })
        //});
    }
}


//Llena los input de acuerdo a lo ingresado y localizado en el mapa
function llenarInputs(resultado) {
    const arregloResultado = resultado.label.split(',');
    document.querySelector('#direccion').value = arregloResultado[0];
    document.querySelector('#ciudad').value = Number(arregloResultado[arregloResultado.length - 2]) ?
        (arregloResultado[arregloResultado.length - 4]) : arregloResultado[arregloResultado.length - 3];

    document.querySelector('#estado').value = Number(arregloResultado[arregloResultado.length - 2]) ?
        (arregloResultado[arregloResultado.length - 3]) : arregloResultado[arregloResultado.length - 2];


    document.querySelector('#pais').value = arregloResultado[arregloResultado.length - 1];
    document.querySelector('#lat').value = resultado.y;
    document.querySelector('#lng').value = resultado.x;
}







