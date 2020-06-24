document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#ubicacion-meeti')) {
        mosatrarMapa();
    }
});


function mosatrarMapa() {

    //Obtener los valores
    const lat = document.querySelector('#lat').value,
        lng = document.querySelector('#lng').value,
        direccion = document.getElementsByClassName('direccionTomada')[0].outerText;


    const map = L.map('ubicacion-meeti').setView([lat, lng], 14);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1
    }).addTo(map);


    L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    })
        .addTo(map)
        .bindPopup(direccion)
        .openPopup();
}



