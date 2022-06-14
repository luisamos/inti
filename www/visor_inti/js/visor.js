var url = "http://127.0.0.2/servicio/wms",
noche_arcgis = L.esri.basemapLayer("DarkGray");
var nombre_columnas = [
{id: "nom_dpto", nombre: "Departamento"},
{id: "nom_prov", nombre: "Provincia"},
{id: "nom_dist", nombre: "Distrito"},
{id: "nom_comuni", nombre: "Comunidad"},
{id: "federacion", nombre: "Federación"},
{id: "etnia", nombre: "Etnia"},
{id: "estado", nombre: "Estado"},
{id: "nro_titulo", nombre: "Nro. título"},
{id: "anio_titul", nombre: "Año título"},
{id: "area_titul", nombre: "Superficie (ha)"},
{id: "fuente", nombre: "Fuente"},
{id: "id_dist", nombre: "Código"},
];

var marker = null;
var icono_rojo = L.icon({
    iconUrl: "img/icon-green50.png",
    shadowUrl: "img/icon-green50_sombra.png",
    iconAnchor:   [10, 46],
    popupAnchor:  [0, -46]
});
 var ubicar_mapa= false;

var mapa = L.map("map", {
	center: [-9.16381987937149, -74.3754883847398],
	zoom: 6,
	minZoom: 5,
	layers: [noche_arcgis],
	zoomControl: false,
	//crs: L.CRS.EPSG4326
});
L.control.navbar({position:'topleft'}).addTo(mapa);
L.control.zoom({position:'topleft'}).addTo(mapa);

var comunidades_campesinas_midagri = new L.TileLayer.WMS(
	"http://127.0.0.2/servicio/wms", {
	layers: "comunidades_campesinas",
	format: "image/png",
	transparent: true,
	version: "1.1.1",
	crs: L.CRS.EPSG4326,
	name: "comunidades_campesinas",
	alt: "MIDAGRI || Comunidades Campesinas"
}).addTo(mapa);

var comunidades_nativas_midagri = new L.TileLayer.WMS(
	"http://127.0.0.2/servicio/wms", {
	layers: "comunidades_nativas",
	format: "image/png",
	transparent: true,
	version: "1.1.1",
	crs: L.CRS.EPSG4326,
	name: "comunidades_nativas",
	alt: "MIDAGRI || Comunidades Nativas"
}).addTo(mapa);

var predio_rural_midagri = new L.TileLayer.WMS(
	"http://127.0.0.2/servicio/wms", {
	layers: "predio_rural",
	format: "image/png",
	transparent: true,
	version: "1.1.1",
	crs: L.CRS.EPSG4326,
	name: "predio_rural",
	alt: "MIDAGRI || Predio Rural"
});

noche_arcgis.addTo(mapa);

function getFeatureInfo(latlng, nombre_capa)
{
	var proyeccion_32718 = "+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs";
	var proyeccion_4326 = "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees']";

	var rpta = proj4(proyeccion_4326,proyeccion_32718,[latlng.lng,latlng.lat]);

    var punto = this.mapa.latLngToContainerPoint(latlng, this.mapa.getZoom()),
    tamano = this.mapa.getSize(),
    //crs = this.mapa.options.crs,
    crs = L.CRS.EPSG4326,
    sw = crs.project(this.mapa.getBounds().getSouthWest()),
    ne = crs.project(this.mapa.getBounds().getNorthEast());

    var params = {
        request: "GetFeatureInfo",
        service: "WMS",
        srs: crs.code,
        styles: "",
        transparent: "TRUE",
        version: "1.1.1",
        format: "image/png",
        bbox: sw.x + "," + sw.y + "," + ne.x + "," + ne.y,
        height: tamano.y,
        width: tamano.x,
        layers: nombre_capa,
        query_layers: nombre_capa,
        info_format: "text/plain",
        feature_count: 10,
        maxfeatures:10
    };

    params[params.version === "1.3.0" ? "i" : "x"] = punto.x;
    params[params.version === "1.3.0" ? "j" : "y"] = punto.y;

    return this.url + L.Util.getParamString(params, this.url, true);
}

function seleccionar_tabs(evt, cityName){
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++){
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++){
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
} 

$(document).ready(function(){
	$(".modal").modal();
	$(".tabs").tabs();
	$(".g-select").formSelect();
	$(".datepicker").datepicker();
});

$("#btnTabTeclado").on("click", function(e){
	seleccionar_tabs(e, "tabTecla");
	ubicar_mapa= false;		
});

$("#btnTabMapa").on("click", function(e){
	seleccionar_tabs(e, "tabMapa");
	ubicar_mapa= true;		
});

mapa.on('click', function(e){
   	var latlng = e.latlng;
   	console.log(latlng);
   	if(ubicar_mapa)
   	{
   		if(marker != null) 
		{
			mapa.removeLayer(marker);
			$("#tabla").html("");
		}
		marker = L.marker([latlng.lat, latlng.lng], {draggable:true, title:"Mi ubicación", icon: icono_rojo}).addTo(mapa);
   	}
});

$("#btnTabCarga").on("click", function(e){
	seleccionar_tabs(e, "tabCarga");
	ubicar_mapa= false;		
});

$("#btnGraficar").on("click", function(event){
	var latitud = $("#txtLatitud").val();
	var longitud = $("#txtLongitud").val();
	if(marker != null) 
	{
		mapa.removeLayer(marker);
		$("#tabla").html("");
	}

	if( latitud.length == 0 || longitud.length == 0)
	{
		$("#txtLatitud").val("-2.5562194448989453");
		$("#txtLongitud").val("-75.654384783216");
		marker = L.marker([-2.5562194448989453, -75.654384783216], 
			{draggable:true, title: "Mi ubicación", icon: icono_rojo}).addTo(mapa);
	}
	else marker = L.marker([latitud,longitud], {draggable:true, title:"Mi ubicación", icon: icono_rojo}).addTo(mapa);

	var marker_bounds = L.latLngBounds([marker.getLatLng()]);
	mapa.fitBounds(marker_bounds);
	mapa.setZoom(12);	
});

$("#btnConsultar").on("click", function(event){
	if(marker != null)
	{
		$("#tabla").html("");
		mapa.eachLayer(function(layer){
			if(layer.wmsParams != undefined)
			{
				var nombre = layer.wmsParams["name"];
				var capa = layer.wmsParams["alt"];
				var url = getFeatureInfo(marker.getLatLng(), nombre);
		    	console.log(url);
		    	$.ajax({
					url: url,
					contentType: "text/plain",
					success: function(data, status, xhr){						
						var err = typeof data === "string" ? null : data;
						var variable,titulo="", columnas="",filas="", activar_columna=false, activar_fila=false;
						var lineas = data.split('\n');
						var id;
						for(i=2;i<lineas.length-1;i++)
						{
							variable=lineas[i].replace(/^\s*/,'').replace(/\s*$/,'').replace(/ = /,"=").replace(/'/g,'').replace(/Layer/g,'').split('=');
							console.log(i+": "+variable[0] + ", activo: "+activar_fila);

							if(variable[0].indexOf('Feature') == -1)
							{	
								if(i == 2)
								{
									if(variable[0] == "Search returned no results.")
										titulo =  "<blockquote>"+capa.toUpperCase()+": La búsqueda no arrojó resultados.</blockquote>";
									else titulo = "<blockquote>"+capa.toUpperCase()+"</blockquote>";
								}
								else
								{
									id = nombre_columnas.find(e => e.id === variable[0]);
									id = (id=== undefined)? variable[0] : id.nombre;	
									if(activar_columna) columnas += "<th>"+id+"</th>";
									if(activar_fila)filas += "<td>"+variable[1]+"</td>";
								}
							}
							else 
							{								
								if(titulo.indexOf("La búsqueda no arrojó resultados.") == -1)
								{
									url = url.replace("plain","html");
									if(i == 3) 
									{
										activar_columna=true;
										activar_fila=true;
										filas += "<tr>";
									}
									else 
									{
										if(activar_columna) columnas += "<th>///</th>";
										if(activar_fila) filas += "<td><a class='text-lighten-3' href='"+url+"'>Ir</a></tr><tr>";
										activar_columna=false;								
									}									
								}										
							}
						}
						if(activar_fila) filas += "<td><a class='text-lighten-3' href='"+url+"'>Ir</a></tr>";
						
						var texto = "<h6>"+titulo+"</h6><table class='striped'><thead><tr>"+columnas+"</tr></thead><tbody>"+filas+"</tbody></table>";
						$("#tabla").append(texto);
					},
					error: function(xhr, status, error) {
						console.log(error);  
					}
				});
			}    		
		});	
	}
});

$(".checkbox").change(function() {
    if(this.checked) {
        console.log(this);
    }
    console.log($(this).is(":checked"));
});

$('input[type="checkbox"]').change(function(event) {
	if(this.id == "comunidades_campesinas")
	{
		if(this.checked) comunidades_campesinas_midagri.addTo(mapa);
		else comunidades_campesinas_midagri.remove();
	}
	else if(this.id == "comunidades_nativas")
	{
		if(this.checked) comunidades_nativas_midagri.addTo(mapa);
		else comunidades_nativas_midagri.remove();
	}
	else if(this.id == "predio_rural")
	{
		if(this.checked) predio_rural_midagri.addTo(mapa);
		else predio_rural_midagri.remove();
	}	
});
/*var pixelPosition = mapa.latLngToLayerPoint(latlng);
console.log(pixelPosition);
var bounds = this.mapa.getBounds();
sw = L.Projection.SphericalMercator.unproject(bounds.getNorthEast());
console.log(sw);*/