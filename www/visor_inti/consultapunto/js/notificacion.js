	
require([
      "esri/request",
      "dojo/dom",
      "esri/layers/FeatureLayer",
	  "esri/geometry/Point",
	   "esri/geometry/projection",
	  "esri/geometry/coordinateFormatter",
	  "esri/symbols/PictureMarkerSymbol",
	  "esri/geometry/webMercatorUtils",
	  "esri/dijit/PopupTemplate",
	  "esri/tasks/StatisticDefinition",
	  'esri/graphic',
	  'esri/renderers/SimpleRenderer',
	  'esri/layers/GraphicsLayer',
	  "esri/tasks/QueryTask",
      "esri/tasks/query",
	  "dojo/_base/lang",
	  "dojo/json",
      "dojo/dom-construct",
      "esri/Color",
	  "esri/symbols/SimpleMarkerSymbol",
	  "esri/renderers/ClassBreaksRenderer",
	  "esri/symbols/PictureMarkerSymbol",
      "esri/dijit/Geocoder",
      "esri/dijit/Popup",
      "esri/InfoTemplate",
      "esri/dijit/Legend",
      "esri/layers/ArcGISDynamicMapServiceLayer",
      "esri/map",
      "esri/symbols/SimpleFillSymbol",
      "esri/symbols/SimpleLineSymbol", "dojo/domReady!"
], function(esriRequest,dom,FeatureLayer,Point, projection, coordinateFormatter, PictureFillSymbol, webMercatorUtils, 
	PopupTemplate,StatisticDefinition,Graphic,SimpleRenderer,GraphicsLayer,QueryTask,Query,lang,JSON,domConstruct, Color,
	SimpleMarkerSymbol,ClassBreaksRenderer,PictureMarkerSymbol, Geocoder, Popup, InfoTemplate, Legend, 
	ArcGISDynamicMapServiceLayer, Map, SimpleFillSymbol, SimpleLineSymbol ) {


	var LISTA_DPTOS={
	    "01":"AMAZONAS", 
	    "02":"ANCASH", 
	    "03":"APURIMAC", 
	    "04":"AREQUIPA", 
	    "05":"AYACUCHO ", 
	    "06":"CAJAMARCA", 
	    "07":"CALLAO", 
	    "08":"CUSCO", 
	    "09":"HUANCAVELICA", 
	    "10":"HUANUCO", 
	    "11":"ICA", 
	    "12":"JUNiN", 
	    "13":"LA LIBERTAD", 
	    "14":"LAMBAYEQUE", 
	    "15":"LIMA", 
	    "16":"LORETO", 
	    "17":"MADRE DE DIOS", 
	    "18":"MOQUEGUA", 
	    "19":"PASCO", 
	    "20":"PIURA", 
	    "21":"PUNO", 
	    "22":"SAN MARTIN", 
	    "23":"TACNA", 
	    "24":"TUMBES", 
	    "25":"UCAYALI" 
	};
	 
   
	var LEYENDA;
	var graphicSaveCob;
	var loading = dom.byId("loadingImg"); 	
	var ListaIncidenciasActual;
	var ROWINCIDENCIACTIVA;
	var IDTEMAACTIVO;
	var FECHASAT_ACTTIVA;
    var CODIGOLLAVEACTIVO;
    var CODIGODEPAACTIVO;
    var LISTA_ENTIDADES;
    var GLOB_NOMBRETIPO;
    var GLOB_CATEGOROA;
	//alert("dola");
	
	// var pointSymbol = new PictureFillSymbol({
 //    "url":"img/icon_green.png",
 //    "height":50,
 //    "width":38,
 //    "type":"esriPMS"
 //    });

    var pointSymbol = new SimpleMarkerSymbol({
	  "color": [255,0,0,64],
	  "size": 12,
	  "angle": 0,
	  "xoffset": 0,
	  "yoffset": 0,
	  "type": "esriSMS",
	  "style": "esriSMSCircle",
	  "outline": {
	    "color": [255,0,0,255],
	    "width": 2,
	    "type": "esriSLS",
	    "style": "esriSLSSolid"
	  }
	});

    var polylineSymbol   = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 4);		
    var polylineRenderer = new SimpleRenderer(polylineSymbol);

    var polylineGraphicsLimites = new GraphicsLayer({
    	id: 'polyLimitesPolit',
    	title: 'Limites Politicos'
    });

    //INIT SOME SETTINGS VARs
	polylineRenderer.label = ' ';
	polylineRenderer.description = ' ';
	polylineGraphicsLimites.setRenderer(polylineRenderer);

    //alert("d");    
    
    var pointGraphics = new GraphicsLayer({
                id: 'drawGraphics_UsPoint',
                title: 'Draw Graphics'
            });	
    
    
	var pointRenderer = new SimpleRenderer(pointSymbol);
	pointRenderer.label = 'User drawn points';
	pointRenderer.description = 'User drawn points';
	pointGraphics.setRenderer(pointRenderer);


	var featureLayerIncidencias = new FeatureLayer("http://geoservidorperu.minam.gob.pe/arcgis/rest/services/geobosque/reporte_deforestacion/FeatureServer/0", {
                mode: FeatureLayer.MODE_ONDEMAND,
             outFields: ["*"]
    });


   
    featureLayerIncidencias.on("edits-complete", lang.hitch(this,function(result) {
                			
            	alert("grabo feture");
                console.log(result);
				var featureAdd=result.adds[0];            					          								
				
				
    }));





    var deforestacionTemplate     = new InfoTemplate();
	var talaTemplate              = new InfoTemplate();
	var afectaecosisTemplate      = new InfoTemplate();
	
	deforestacionTemplate.setTitle("<b>Deforestación</b>");    
	talaTemplate.setTitle("<b>Tala</b>"); 
	afectaecosisTemplate.setTitle("<b>Ecosistemas Frágiles</b>"); 

	let iconSel = document.createElement("span"); 
	iconSel.innerHTML = 	"search";
	iconSel.className = 'material-icons';
	iconSel.style.cssText = "cursor:pointer;";
	iconSel.onclick = verDetalleIncidencia2;
	
	var deforestacionContent = "<div>" +
	    "<b>Departamento : </b>${NOMDEP} <br> "+ 
		"<b>Provincia : </b>${NOMPRO } <br>" +		
		"<b>Distrito : </b>${NOMDIS } <br>" +		
		"<b>Capital de Provincia: </b>${CAPITAL } <br>" +		
		"<b>Fecha: </b>${FECHA } <br>" +		
		"<b>Categoría territorial: </b>${DOMCATEG } <br>" +		
		"<b>Clasificación de la Cobertura Vegetal MINAM 2015: </b>${COBVEG} <br>" +		
		"<b>Causa del cambio de uso: </b>${DRIVER} <br>" +		
		"<b>Superficie de cambio (ha): </b>${SUPTOT} <br>" +		
		"<b>Código de Reporte: </b>${REPOR} <br>" +
		"<a  onclick='verDetalleIncidencia2()'>xxxxxx</a>"+	
       "</div>";
	
	var talaContent  = "<div>" +
	    "<b>Departamento. : </b>${NOMDEP} <br> "+ 
		"<b>Provincia : </b>${NOMPRO } <br>" +		
		"<b>Distrito : </b>${NOMDIS } <br>" +		
		"<b>Capital de Provincia: </b>${CAPITAL } <br>" +		
		"<b>Fecha: </b>${FECHA } <br>" +		
		"<b>Categoría territorial: </b>${DOMCATEG } <br>" +		
		"<b>Clasificación de la Cobertura Vegetal MINAM 2015: </b>${COBVEG} <br>" +		
		"<b>Código de Reporte: </b>${REPOR} <br>" +	
        "<a href='downloadums.html?idrpt=${REPOR}&tipo=DEFOREST' style='text-decoration: none;' target='_blank' ><span class='icon-download'></span>&nbsp;PDF</a>&nbsp;&nbsp;&nbsp;<a href='downloadums.html?idrpt=${REPOR}&tipo=DEFORESTkml' style='text-decoration: none;' target='_blank' >Shape File</a>" +
        //"<a href='downloadums.html?idrpt=RCU_003_2018&tipo=DEFOREST' style='text-decoration: none;' target='_blank' ><span class='icon-download'></span>&nbsp;PDF</a>&nbsp;&nbsp;&nbsp;<a href='downloadums.html?RCU_003_2018' style='text-decoration: none;' target='_blank' >Shape File</a>" +		 
		"</div>";


	var afectacionecosistema = "<div>"+
	   "</div>";


	deforestacionTemplate.setTitle(iconSel);
	deforestacionTemplate.setContent(iconSel);	
	//deforestacionTemplate.setContent(iconSel);	




	//talaTemplate.setContent(deforestacionContent+iconSel); 
	//afectaecosisTemplate.setContent(deforestacionContent+iconSel); 
	
	 
	var cambiousotalaServicesMap = new ArcGISDynamicMapServiceLayer("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Deforestacion_Tala/MapServer", {
        "id": "SRV001CAMBIOUSO",
        "opacity": 0.75
        //,"visibleLayers":[2]
    });


	var afectaecosistemaMap = new ArcGISDynamicMapServiceLayer("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Afectacion_EF/MapServer", {
        "id": "SRV002AECOSISFRAG",
        "opacity": 0.75
        //,"visibleLayers":[2]
    });
	

    
	
    var map = new Map("map", {
		basemap: "hybrid",
		center: [-75.10, -9.11], // long, lat
		zoom: 5,
		sliderStyle: "small"
		//,infoWindow: popup
    });



    cambiousotalaServicesMap.setInfoTemplates({
        1: { infoTemplate: deforestacionTemplate },
		0: { infoTemplate: talaTemplate }
    });


    afectaecosistemaMap.setInfoTemplates({
        0: { infoTemplate: afectaecosisTemplate }
    });



    map.addLayer(cambiousotalaServicesMap);

    map.addLayer(afectaecosistemaMap);

   	map.addLayer(polylineGraphicsLimites);

   	map.addLayer(pointGraphics);	


    cambiousotalaServicesMap.setVisibleLayers([0,1]);	


    $('#btnRegresarTabla').on('click', function(event) {		 
		
		$("#divMapa").hide();
		$("#divTabla").show();
	});


	$('#btnGrabarAccion').on('click', function(event) {		 
		
		//alert("grabar accion");
		$("#DivModal").show();
		


	});


	$('#btnAddAccion').on('click', function(event) {		 
		
			showLoading();
			setTimeout(function(){ 
				$("#divGrabarAccionNueva").show();
				hideLoading();
			}, 1000);

		

	});

	$('#btnCancelaAccionNew').on('click', function(event) {		 
		
		//alert("grabar accion");
		$("#divGrabarAccionNueva").hide();

	});


    $('#btnExeCancelaAccionNew').on('click', function(event) {		 
		
		//alert("grabar accion");
		$("#DivModal").hide();

	});

	$('#btnExeGrabaAccion').on('click', function(event) {		 
		
		//alert("grabar accion");
		exeGrabarAccion();

	});

	
	 $('#btnDefo').on('click', function(event) {		 
		openCity(event, 'defo');
		
	});

	$('#btnTala').on('click', function(event) {		 
		openCity(event, 'tala');
		
	});

	$('#btnEcosis').on('click', function(event) {		 
		openCity(event, 'ecosis');
		
	});

    $('#btnIncendios').on('click', function(event) {		 
		openCity(event, 'incend');
		
	});






	$('#btnNotificar').on('click', function(event) {
		//alert("vamo a notof");
        showLoading();
		//showLoading();

	    setTimeout(function(){ 
			$("#divMapa").hide();
		    $("#divNotificar").show();
		    hideLoading();
		}, 700);		 
		
		
		
	});



	$('#btnCancelaNoti').on('click', function(event) {	

		closeFrmNotificar();
		limpiarFormNotifica();		
		
	});




	$('#btnNotificaInc').on('click', function(event) {			
		notificarAfectacion();
	});

    $('#btnToolListas').on('click', function(event) {			
		

        if($("#divCntPrincListas").css("display") == "block"){
        	$("#divCntPrincListas").hide();

		}else{
			$("#divCntPrincListas").show();

		}
	});


	//

	$('#dr-departamento-defo').on('change', function() {			
		filtrarByDpto_Defo(this.value);
	});	
	$('#txtCodRepor-defo').keypress(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){			
			filtrarByReport_Defo(this.value);
		}
	});


	$('#dr-departamento-tala').on('change', function() {			
		filtrarByDpto_Tala(this.value);
	});
	$('#txtCodRepor-tala').keypress(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){			
			filtrarByReport_Tala(this.value);
		}
	});


	$('#dr-departamento-ecosis').on('change', function() {			
		filtrarByDpto_Ecosis(this.value);
	});
	$('#txtCodRepor-ecosis').keypress(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){			
			filtrarByReport_Ecosis(this.value);
		}
	});


	$('#dr-departamento-incend').on('change', function() {			
		filtrarByDpto_Incend(this.value);
	});
	$('#txtCodRepor-incend').keypress(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){			
			filtrarByReport_Incend(this.value);
		}
	});


	


	
    //getAllIncidencias();
    cargarIncidenciasMaps();
    getEntidades();
    

    //openCity($("btnDefo"), 'defo');


    $('#btnLogout').on('click', function(event) {		 
		
		logOut();
	});

	

	
/********************************************
*********************************************
******************FUNCIONES****************** 
*********************************************
********************************************/


function logOut(){


	window.open("../gestionmonitoreo/index.html","_top");

	
}
    



function filtrarByDpto_Incend(value){
	//alert("value:"+value);
	//return;

	let statisticDefinition4 = new StatisticDefinition();
	statisticDefinition4.statisticType = "count";
	statisticDefinition4.onStatisticField = "OBJECTID";
	statisticDefinition4.outStatisticFieldName = "TOTALPOLYS";
	let queryTask4 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Incendios/MapServer/3"); //2 Alerta de Incendio Forestal ultimas24
	let query4 = new Query();                         
	query4.groupByFieldsForStatistics = ["CODREP,NOMDEP,FECHA"];
	query4.where =  "CODREP is not null  and CODREP<>'' and ESTADO='Alertado' and CATDEP='"+value+"'";   		
	query4.num = 100; 		
	query4.orderByFields = ["FECHA"]
	query4.outStatistics = [statisticDefinition4];        
	queryTask4.execute(query4, lang.hitch(this, function (results) {
		//console.log("result estatistic",results);
		let arrff = {"CODREP":"REPORTE","NOMDEP":"DEPARTAMENTO","NOMPRO":"PROVINCIA","NOMDIS":"DISTRITO","FECHA":"FECHA","TOTALPOLYS":"TOTALPOLYS"};

		$("#divIncendios").html("");
		unpackDatos(results,"divIncendios",4,arrff);
	}),lang.hitch(this, function(err){ 
	alert( "ERR::->"+ err);            	              
	})
	); 		

}

function filtrarByReport_Incend(value){

	let statisticDefinition4 = new StatisticDefinition();
	statisticDefinition4.statisticType = "count";
	statisticDefinition4.onStatisticField = "OBJECTID";
	statisticDefinition4.outStatisticFieldName = "TOTALPOLYS";
	let queryTask4 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Incendios/MapServer/3"); //2 Alerta de Incendio Forestal ultimas24
	let query4 = new Query();                         
	query4.groupByFieldsForStatistics = ["CODREP,NOMDEP,FECHA"];
	query4.where =  "CODREP='"+value+"'";   		
	query4.num = 100; 		
	query4.orderByFields = ["FECHA"]
	query4.outStatistics = [statisticDefinition4];        
	queryTask4.execute(query4, lang.hitch(this, function (results) {
		//console.log("result estatistic",results);
		let arrff = {"CODREP":"REPORTE","NOMDEP":"DEPARTAMENTO","NOMPRO":"PROVINCIA","NOMDIS":"DISTRITO","FECHA":"FECHA","TOTALPOLYS":"TOTALPOLYS"};

		$("#divIncendios").html("");
		unpackDatos(results,"divIncendios",4,arrff);
	}),lang.hitch(this, function(err){ 
	alert( "ERR::->"+ err);            	              
	})
	); 		

}


function filtrarByDpto_Ecosis(value){

	let statisticDefinition3 = new StatisticDefinition();
	statisticDefinition3.statisticType = "count";
	statisticDefinition3.onStatisticField = "OBJECTID";
	statisticDefinition3.outStatisticFieldName = "TOTALPOLYS";
	let queryTask3 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Afectacion_EF/MapServer/0"); //2 Alerta de Incendio Forestal ultimas24
	let query3 = new Query();                         
	query3.groupByFieldsForStatistics = ["REPOR,NOMDEP,FECSAI"];
	query3.where =  "ESTADO=1 and  NOMDEP='"+value+"'";   		
	query3.num = 100; 		
	query3.orderByFields = ["FECSAI"]
	query3.outStatistics = [statisticDefinition3];        
	queryTask3.execute(query3, lang.hitch(this, function (results) {
		//console.log("result estatistic",results);
		let arrff = {"REPOR":"REPORTE","NOMDEP":"DEPARTAMENTO","NOMPRO":"PROVINCIA","NOMDIS":"DISTRITO","FECSAI":"FECHA","TOTALPOLYS":"TOTALPOLYS"};

		$("#divEcosisDatos").html("");
		unpackDatos(results,"divEcosisDatos",3,arrff);
	}),lang.hitch(this, function(err){ 
	alert( "ERR::->"+ err);            	              
	})
	); 
		
		

}

function filtrarByReport_Ecosis(value){

	let statisticDefinition3 = new StatisticDefinition();
	statisticDefinition3.statisticType = "count";
	statisticDefinition3.onStatisticField = "OBJECTID";
	statisticDefinition3.outStatisticFieldName = "TOTALPOLYS";
	let queryTask3 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Afectacion_EF/MapServer/0"); //2 Alerta de Incendio Forestal ultimas24
	let query3 = new Query();                         
	query3.groupByFieldsForStatistics = ["REPOR,NOMDEP,FECSAI"];
	query3.where =  "REPOR='"+value+"'";   		
	query3.num = 100; 		
	query3.orderByFields = ["FECSAI"]
	query3.outStatistics = [statisticDefinition3];        
	queryTask3.execute(query3, lang.hitch(this, function (results) {
		//console.log("result estatistic",results);
		let arrff = {"REPOR":"REPORTE","NOMDEP":"DEPARTAMENTO","NOMPRO":"PROVINCIA","NOMDIS":"DISTRITO","FECSAI":"FECHA","TOTALPOLYS":"TOTALPOLYS"};

		$("#divEcosisDatos").html("");
		unpackDatos(results,"divEcosisDatos",3,arrff);
	}),lang.hitch(this, function(err){ 
	alert( "ERR::->"+ err);            	              
	})
	); 
		
		

}



function filtrarByDpto_Tala(value){

	let statisticDefinition2 = new StatisticDefinition();
	statisticDefinition2.statisticType = "count";
	statisticDefinition2.onStatisticField = "OBJECTID";
	statisticDefinition2.outStatisticFieldName = "TOTALPOLYS";
	let queryTask22 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Deforestacion_Tala/MapServer/0"); //2 Alerta de Incendio Forestal ultimas24
	let query22 = new Query();                         
	query22.groupByFieldsForStatistics = ["REPOR,NOMDEP,FESATA"];
	query22.where =  "REPOR is not null and ESTADO=1 and NOMDEP='"+value+"'";  		
	query22.num = 100; 		
	query22.orderByFields = ["FESATA"]
	query22.outStatistics = [statisticDefinition2];        
	queryTask22.execute(query22, lang.hitch(this, function (results) {
		//console.log("result estatistic",results);
		let arrff = {"REPOR":"REPORTE","NOMDEP":"DEPARTAMENTO","NOMPRO":"PROVINCIA","NOMDIS":"DISTRITO","FESATA":"FECHA","TOTALPOLYS":"TOTALPOLYS"};

        $("#divTalaDatos").html("");
		unpackDatos(results,"divTalaDatos",2,arrff);
	}),lang.hitch(this, function(err){ 
	alert( "ERR::->"+ err);            	              
	})
	); 
		
		

}

function filtrarByReport_Tala(value){

	let statisticDefinition2 = new StatisticDefinition();
	statisticDefinition2.statisticType = "count";
	statisticDefinition2.onStatisticField = "OBJECTID";
	statisticDefinition2.outStatisticFieldName = "TOTALPOLYS";
	let queryTask22 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Deforestacion_Tala/MapServer/0"); //2 Alerta de Incendio Forestal ultimas24
	let query22 = new Query();                         
	query22.groupByFieldsForStatistics = ["REPOR,NOMDEP,FESATA"];
	query22.where =  "REPOR='"+value+"'";  		
	query22.num = 100; 		
	query22.orderByFields = ["FESATA"]
	query22.outStatistics = [statisticDefinition2];        
	queryTask22.execute(query22, lang.hitch(this, function (results) {
		//console.log("result estatistic",results);
		let arrff = {"REPOR":"REPORTE","NOMDEP":"DEPARTAMENTO","NOMPRO":"PROVINCIA","NOMDIS":"DISTRITO","FESATA":"FECHA","TOTALPOLYS":"TOTALPOLYS"};

        $("#divTalaDatos").html("");
		unpackDatos(results,"divTalaDatos",2,arrff);
	}),lang.hitch(this, function(err){ 
	alert( "ERR::->"+ err);            	              
	})
	); 
		
		

}


function filtrarByDpto_Defo(value){

	//alert(value);
	let statisticDefinition = new StatisticDefinition();
	statisticDefinition.statisticType = "count";
	statisticDefinition.onStatisticField = "OBJECTID";
	statisticDefinition.outStatisticFieldName = "TOTALPOLYS";
	let queryTask = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Deforestacion_Tala/MapServer/1"); //2 Alerta de Incendio Forestal ultimas24
	let query = new Query();                         
	query.groupByFieldsForStatistics = ["REPOR,NOMDEP,FESATA"];
	//query.where =  "FECHA>='01-08-2018' and CODREP is not null";  
	query.where =  "REPOR is not null and ESTADO=1 and NOMDEP='"+value+"'";  	
	query.num = 100; 		
	query.orderByFields = ["FESATA"]
	query.outStatistics = [statisticDefinition];        
	queryTask.execute(query, lang.hitch(this, function (results) {
        //alert("ret");
		//console.log("result estatistic",results);
		let arrff = {"REPOR":"REPORTE","NOMDEP":"DEPARTAMENTO","NOMPRO":"PROVINCIA","NOMDIS":"DISTRITO","FESATA":"FECHA","TOTALPOLYS":"TOTALPOLYS"};
  
        $("#divDeforestacionDatos").html("");
		unpackDatos(results,"divDeforestacionDatos",1, arrff);
	}),lang.hitch(this, function(err){ 
	alert( "ERR::->"+ err);            	              
	})
	);
		
		

}

function filtrarByReport_Defo(value){

	//alert(value);
	let statisticDefinition = new StatisticDefinition();
	statisticDefinition.statisticType = "count";
	statisticDefinition.onStatisticField = "OBJECTID";
	statisticDefinition.outStatisticFieldName = "TOTALPOLYS";
	let queryTask = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Deforestacion_Tala/MapServer/1"); //2 Alerta de Incendio Forestal ultimas24
	let query = new Query();                         
	query.groupByFieldsForStatistics = ["REPOR,NOMDEP,FESATA"];
	//query.where =  "FECHA>='01-08-2018' and CODREP is not null";  
	query.where =  "REPOR='"+value+"'";  	
	query.num = 100; 		
	query.orderByFields = ["FESATA"]
	query.outStatistics = [statisticDefinition];        
	queryTask.execute(query, lang.hitch(this, function (results) {
        //alert("ret");
		//console.log("result estatistic",results);
		let arrff = {"REPOR":"REPORTE","NOMDEP":"DEPARTAMENTO","NOMPRO":"PROVINCIA","NOMDIS":"DISTRITO","FESATA":"FECHA","TOTALPOLYS":"TOTALPOLYS"};
  
        $("#divDeforestacionDatos").html("");
		unpackDatos(results,"divDeforestacionDatos",1, arrff);
	}),lang.hitch(this, function(err){ 
	alert( "ERR::->"+ err);            	              
	})
	);
		
		

}


function closeFrmNotificar(){
        showLoading();

        setTimeout(function(){ 
			$("#divMapa").show();
		    $("#divNotificar").hide();
		    hideLoading();
		}, 700);

}



function notificarAfectacion(){
	

	let ListEntities="";
	let CodLlave = CODIGOLLAVEACTIVO;
	let NomTipo = GLOB_NOMBRETIPO;
	let dpto = CODIGODEPAACTIVO;

	let r = confirm("DESEA CONFIRMAR LA OPERACI\u00D3N?");
	if (r == false) {		  
	  return;
	} 

	//¡FALTA! la fecha
	let FechaInc = FECHASAT_ACTTIVA ;
	//alert("fecha inc:"+ FechaInc);
	let Latitud = "";
	let longitud ="";
	let Tema = IDTEMAACTIVO;
	let Descrip = $("#txtDescripcionNotifica").val();
	let comenta = $("#txtComentaNotifica").val();

	// console.log("FechaInc", FechaInc);
	// console.log("Tema", Tema);
	// console.log("Descrip", Descrip);


	$('input[type=checkbox]:checked').each(function() {
	   console.log("Checkbox " + $(this).prop("id") +  " (" + $(this).val() + ") Seleccionado");
	   ListEntities += $(this).val() + "@";

	});

    ListEntities = ListEntities.slice(0,-1);

    //validacion;
    if ($.trim(ListEntities)===""){
    	alert("Debe seleccionar una entidad");
    	return;
    }
    if ($.trim(Descrip)===""){
    	alert("Ingrese una descripcion");
    	return;
    }
    if($.trim(comenta)===""){
    	alert("Ingrese comentario");
    	return;
    }



	let Credencial = "abfw45412f";
	let objJson ={"dpto": dpto  ,"categoria": GLOB_CATEGOROA,"NomTipo": NomTipo,"credencial":Credencial, 
	              "descrip":Descrip , "comentario": comenta , "codtema":Tema , "fechainci":FechaInc  , 
	              "lat":Latitud , "lon":longitud, "CodLlave" :CodLlave, "ListaInsti": ListEntities, "idtema": IDTEMAACTIVO};  	
	let txtJson=JSON.stringify(objJson);			
	let param={datos : txtJson };
    console.log("param post::",param);
	//return;	
	let h=new Date();  

	showLoading();


	$.post("../controller/notificarAfectacion.php?"+h, param,function(result) { 
	             
			console.log("result  guardar y notificar inciednecia  : ", result);	
			hideLoading();

			let resultado = result[0].result;

			if (resultado==2){
				alert("Este reporte ya fue notificado, no se puede volver a notificar, quiza quiera relizar una notificación reiterativa desde el correo emitido previamente!");
			
			}else if (resultado==1){
				alert("Se ha notificado satisfactoriamente!");
				limpiarFormNotifica();
				closeFrmNotificar();
			}else{

				alert("Intentelo nuevamente en un momento!");
			}
			
	},"json")
	.done(function(){       
	})
	.fail(function(er){
	   alert("Exception::  " );	 
	   console.log("ERROR :  ::: ",er);	   
	})
	.always(function(){       
	});


}


function limpiarFormNotifica(){
	$("#txtDescripcionNotifica").val("");
	$("#txtComentaNotifica").val("");
	listarEntidades(LISTA_ENTIDADES);


	//tbodyListaEntidades
}


function listarEntidades(datos){
		//alert("listando");

        StrHtmBody = "";
		$.each(datos, function(x, valor) {

			    console.log(valor);
                StrHtmBody += "<tr>";
                  StrHtmBody += "<td>";
                  StrHtmBody += x+1; 
                  StrHtmBody += "</td>";
                  StrHtmBody += "<td>"+ valor.Tx_Descripcion +"</td>";                          
                  StrHtmBody += "<td class='center'>";
                    StrHtmBody += "<label>";
                      StrHtmBody += "<input type='checkbox' value='"+valor.Nu_Id_Entidad+"' class='filled-in'/>";
                      StrHtmBody += "<span></span>";
                    StrHtmBody += "</label>";
                  StrHtmBody += "</td>";
                StrHtmBody += "</tr>";

		});

		$("#tbodyListaEntidades").html(StrHtmBody);	

}


function getEntidades(){

		let Credencial = "abfw45412f";
		let objJson ={"credencial":Credencial};  
		let txtJson=JSON.stringify(objJson);			
		let param={datos : txtJson };	
		let h=new Date();  
	    $.post("../controller/listaEntidades.php?"+h, param,function(result) { 
		             
				console.log("result  lista entodades!  : ", result); 
				//return;	

				let resultado = result[0].result;

				if (resultado==1){

					//listar cheks
					//alert("listar entodades en html");
					LISTA_ENTIDADES=result[0].datos
					listarEntidades(LISTA_ENTIDADES);


				  
				}else{
				  alert("Intentalo nuevamente 2!");	
				  console.log(result);					  
				}
					
				
	    },"json")
		.done(function(){       
	    })
	    .fail(function(er){
	       //alert("Exception::  " );	 
	       console.log("ERROR :  ::: ",er);	   
	    })
	    .always(function(){       
	    });

	}



function cargarIncidenciasMaps(){

		let statisticDefinition = new StatisticDefinition();
		statisticDefinition.statisticType = "count";
		statisticDefinition.onStatisticField = "OBJECTID";
		statisticDefinition.outStatisticFieldName = "TOTALPOLYS";
		let queryTask = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Deforestacion_Tala/MapServer/1"); //2 Alerta de Incendio Forestal ultimas24
		let query = new Query();                         
		query.groupByFieldsForStatistics = ["REPOR,NOMDEP,FESATA"];
		//query.where =  "FECHA>='01-08-2018' and CODREP is not null";  
		query.where =  "FESATA>='01-08-2018' and REPOR is not null";  	
		query.num = 100; 		
		query.orderByFields = ["FESATA"]
		query.outStatistics = [statisticDefinition];        
		queryTask.execute(query, lang.hitch(this, function (results) {
            //alert("ret");
			//console.log("result estatistic",results);
			let arrff = {"REPOR":"REPORTE","NOMDEP":"DEPARTAMENTO","FESATA":"FECHA","TOTALPOLYS":"TOTALPOLYS"};

			unpackDatos(results,"divDeforestacionDatos",1, arrff);
		}),lang.hitch(this, function(err){ 
		alert( "ERR::->"+ err);            	              
		})
		);


		let statisticDefinition2 = new StatisticDefinition();
		statisticDefinition2.statisticType = "count";
		statisticDefinition2.onStatisticField = "OBJECTID";
		statisticDefinition2.outStatisticFieldName = "TOTALPOLYS";
		let queryTask22 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Deforestacion_Tala/MapServer/0"); //2 Alerta de Incendio Forestal ultimas24
		let query22 = new Query();                         
		query22.groupByFieldsForStatistics = ["REPOR,NOMDEP,FESATA"];
		query22.where =  "1=1  and REPOR is not null";  
		//query22.where = "CODREP = 'RCU_001_2017' or CODREP = 'RCU_002_2017'"
		query22.num = 100; 		
		query22.orderByFields = ["FESATA"]
		query22.outStatistics = [statisticDefinition2];        
		queryTask22.execute(query22, lang.hitch(this, function (results) {
			//console.log("result estatistic",results);
			let arrff = {"REPOR":"REPORTE","NOMDEP":"DEPARTAMENTO","NOMPRO":"PROVINCIA","NOMDIS":"DISTRITO","FESATA":"FECHA","TOTALPOLYS":"TOTALPOLYS"};

			unpackDatos(results,"divTalaDatos",2,arrff);
		}),lang.hitch(this, function(err){ 
		alert( "ERR::->"+ err);            	              
		})
		); 


		let statisticDefinition3 = new StatisticDefinition();
		statisticDefinition3.statisticType = "count";
		statisticDefinition3.onStatisticField = "OBJECTID";
		statisticDefinition3.outStatisticFieldName = "TOTALPOLYS";
		let queryTask3 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Afectacion_EF/MapServer/0"); //2 Alerta de Incendio Forestal ultimas24
		let query3 = new Query();                         
		query3.groupByFieldsForStatistics = ["REPOR,NOMDEP,FECSAI"];
		query3.where =  "1=1";  		
		query3.num = 100; 		
		query3.orderByFields = ["FECSAI"]
		query3.outStatistics = [statisticDefinition3];        
		queryTask3.execute(query3, lang.hitch(this, function (results) {
			//console.log("result estatistic",results);
			let arrff = {"REPOR":"REPORTE","NOMDEP":"DEPARTAMENTO","NOMPRO":"PROVINCIA","NOMDIS":"DISTRITO","FECSAI":"FECHA","TOTALPOLYS":"TOTALPOLYS"};

			unpackDatos(results,"divEcosisDatos",3,arrff);
		}),lang.hitch(this, function(err){ 
		alert( "ERR::->"+ err);            	              
		})
		); 


		let statisticDefinition4 = new StatisticDefinition();
		statisticDefinition4.statisticType = "count";
		statisticDefinition4.onStatisticField = "OBJECTID";
		statisticDefinition4.outStatisticFieldName = "TOTALPOLYS";
		let queryTask4 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Incendios/MapServer/3"); //2 Alerta de Incendio Forestal ultimas24
		let query4 = new Query();                         
		query4.groupByFieldsForStatistics = ["CODREP,NOMDEP,FECHA"];
		query4.where =  "CODREP is not null  and CODREP<>'' and ESTADO='Alertado'";  		
		query4.num = 100; 		
		query4.orderByFields = ["FECHA"]
		query4.outStatistics = [statisticDefinition3];        
		queryTask4.execute(query4, lang.hitch(this, function (results) {
			//console.log("result estatistic",results);
			let arrff = {"CODREP":"REPORTE","NOMDEP":"DEPARTAMENTO","NOMPRO":"PROVINCIA","NOMDIS":"DISTRITO","FECHA":"FECHA","TOTALPOLYS":"TOTALPOLYS"};

			unpackDatos(results,"divIncendios",4,arrff);
		}),lang.hitch(this, function(err){ 
		alert( "ERR::->"+ err);            	              
		})
		); 


}



function buscarCoberturas (iddpto){
			
			var queryTask = new QueryTask(getUrlLay_ByCodLay("DEPARTAM"));  
			var query = new Query();                                     
			query.returnGeometry = true;                                 
			query.outFields = ["OBJECTID,NOMBDEP"];                        
			query.where =  "IDDPTO ='"+iddpto+"'";        
			queryTask.execute(query, lang.hitch(this, function (results) {  				
		                 //console.log(results);		 
		                 var feature = results.features[0];
		                 if (feature) { 
		                 	
		                 	graphic = new Graphic(feature.geometry); 
		                 	polylineGraphicsLimites.clear();
		                 	polylineGraphicsLimites.add(graphic);
		                 	
		                 	var extent = feature.geometry.getExtent().expand(1.5);
		                 	map.setExtent(extent); 		                 	
		                 }

		             }),lang.hitch(this, function(err){ 
		             	alert( "ERR::->"+ err);            	              
		             })
		             ); 			
			
}


function verDetalleAfectacion(obj){

	///console.log("ver detalle X34555555->-> ", obj);

    let idContenedor = obj.srcElement.id;
	let objsplit     = idContenedor.split("@");
	
	let Tema     = objsplit[0];
	let CodLlave = objsplit[1];

	IDTEMAACTIVO = objsplit[0];
    CODIGOLLAVEACTIVO = objsplit[1];
    CODIGODEPAACTIVO=objsplit[3]; //ras-jueves
    GLOB_NOMBRETIPO = objsplit[2];

    FECHASAT_ACTTIVA = objsplit[4]; 

    //debugger;

    

    let ArrCates =[];


	let URL_srv="";
	let Where="";

	let OutFields=[];
	//alert(Tema);

    // ¡FALTA¡ poner un a variable global de la ruta de los servicios
	if(Tema==1){
		URL_srv = "https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Deforestacion_Tala/MapServer/1";
		Where="REPOR ='"+CodLlave+"'"; 
		OutFields = ["OBJECTID","NOMCATEG"];   
	}
	if(Tema==2){
		URL_srv="https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Deforestacion_Tala/MapServer/0";
		Where="REPOR ='"+CodLlave+"'"; 
		OutFields = ["OBJECTID"];   
	}
	if(Tema==3){
		URL_srv="https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Afectacion_EF/MapServer/0";
		Where="REPOR ='"+CodLlave+"'"; 
		OutFields = ["OBJECTID"];   
	}
	if(Tema==4){		
		URL_srv = "https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Incendios/MapServer/3";
		Where =" CODREP ='"+CodLlave+"'";  
		OutFields = ["OBJECTID"];     
	}

    var queryTask = new QueryTask(URL_srv);  
	var query = new Query();                                     
	query.returnGeometry = true;                                 
	query.outFields = OutFields;                        
	query.where = Where ;      
	queryTask.execute(query, lang.hitch(this, function (results) {  


		    //GLOB_CATEGOROA
		    console.log("results verDetalleAfectacion", results);
            
		    setRowSelect(idContenedor);
            polylineGraphicsLimites.clear();
            pointGraphics.clear();

            if (results.features.length>0){
            	let extentX;
            	let ArrPoints=[];
				$.each(results.features, function(x, valor) {

					let atributo = valor.attributes.NOMCATEG;
					//ArrCates.push();

					if ( ArrCates.indexOf(atributo) == -1 ){
						ArrCates.push(atributo);			             
					}

                    let graphic = new Graphic(valor.geometry); 
                    if (results.geometryType=="esriGeometryPolygon"){
                    	polylineGraphicsLimites.add(graphic);
                    	ArrPoints.push(graphic); 	                 	
	        //          	var extent = valor.geometry.getExtent().expand(1.5);		                 	
	        //          	if(extentX){
					    //     extentX = extentX.union(extent);
					    // }else{
					    //     extentX = new esri.geometry.Extent(extent);
					    // }
					    // map.setExtent(extentX); 

                    }else if (results.geometryType=="esriGeometryPoint"){
                    	//alert("building for esriGeometryPoint!");
                    	pointGraphics.add(graphic);	
                        ArrPoints.push(graphic) 
                    }		                 	                 	

				});
				extentX=esri.graphicsExtent(ArrPoints).expand(2);  
				map.setExtent(extentX); 


				GLOB_CATEGOROA= ArrCates.join(', ')
				
            }else{
                alert("No se encontraron mapas");
            } 		
                 
	}),lang.hitch(this, function(err){ 
		alert( "Exception verDetalleAfectacion : "+ err);            	              
	}));

}


function unpackDatos(datos, nameObjPaste,idtema,arrff){

   //console.log("arrff : ",arrff);

   let Table  = document.createElement("TABLE");
   let TrHead = document.createElement("TR");
   let TdH1 = document.createElement("TD"); 

   TrHead.appendChild(TdH1); 

   //DEFINIR CAMPO LLAVE
   let FieldLlave="";
   let NombreTema="";
    switch(idtema) {
		case 1:
			FieldLlave = "REPOR";
			NombreTema="Deforestacion y/o Tala";
			break;
		case 2:
			FieldLlave = "REPOR";
			NombreTema="Deforestacion y/o Tala";
			break;
		case 3:
			FieldLlave = "REPOR";
			NombreTema="Ecosistemas fragiles";
			break;
		case 4:
			FieldLlave = "CODREP";
			NombreTema="Incendios forestales";
			break;    
	}


    $.each(datos.fields, function(x, valor) {
		if (valor.name!="TOTALPOLYS"){
			let TdH = document.createElement("TD"); 
			TdH.innerHTML    = arrff[valor.name] ; 
			//TdH.innerHTML     = valor.name ; 
			TrHead.appendChild(TdH);       	
		}
   	
    });
    Table.appendChild(TrHead);

    $.each(datos.features, function(x, valor) {

	   	let TrNBody = document.createElement("TR");
	   	let TdB1    = document.createElement("TD");	   	
	    let iconSel = document.createElement("span"); 


	    TrNBody.id = "tr__" + valor.attributes[FieldLlave];
	    TrNBody.className = "rowsResults";	

	    let strFechaSatA="";
	    if (valor.attributes["FESATA"]){
	    	let FechaSatA="";
	    	FechaSatA=  new Date( valor.attributes["FESATA"]);
	    	strFechaSatA=FechaSatA.getDate()+"/"+ (FechaSatA.getMonth()+1) + "/" + FechaSatA.getFullYear()

	    }


		iconSel.id        = idtema + "@" + valor.attributes[FieldLlave] + "@" + NombreTema + "@"  + valor.attributes["NOMDEP"] + "@"  +   strFechaSatA;
		iconSel.innerHTML = "search";
		iconSel.className = "material-icons";
		iconSel.style.cssText = "cursor:pointer;";
		iconSel.onclick       = verDetalleAfectacion;

		TdB1.appendChild(iconSel); 
	   	TrNBody.appendChild(TdB1); 

	   	$.each(valor.attributes, function(x, valor) {
	   		
		    //LISTA_DPTOS
	   		
	   		if(x!="TOTALPOLYS"){
	   			TrNBody.className = "";
	   			let TdB = document.createElement("TD"); 				
				TdB.innerHTML     =  formatarDato(datos.fields,x,valor, idtema); 
				TrNBody.appendChild(TdB);  
	   		}	   		
	   	});

	   	Table.appendChild(TrNBody);
  
    });

    $("#"+nameObjPaste).append(Table); 
 
}


function formatarDato(ArrTipos, NameColumn, DatoRef, idtema){

	




	let Tipo; 
	$.each(ArrTipos, function(x, valor) {
       	if (valor.name==NameColumn){
       		Tipo = valor.type;
       	}
    });


    let Dato;
    switch(Tipo) {
	  case "esriFieldTypeDate":
	    Dato = new Date(DatoRef).toLocaleDateString();;
	    break;
	  default:
	    Dato = DatoRef;	    
	}

	//alert(NameColumn);

	if (NameColumn==="NOMDEP" && idtema!==4){

		Dato = DatoRef + "-" +  LISTA_DPTOS[DatoRef];
	}

	return Dato;

}

function setRowSelect(NombreSelect){

	  //alert(NombreFila);

	  console.log(NombreSelect);

	  tablinks = document.getElementsByClassName("material-icons");
	  //alert(tablinks.length)
	  
	  for (i = 0; i < tablinks.length; i++) {
	   	tablinks[i].style.cssText = "background-color:white;cursor:pointer;";
	    //tablinks[i].className = tablinks[i].className.replace(" rows-active", "");
	    //console.log("");
	    //console.log("Elemento<:",tablinks[i].id);
	    if(tablinks[i].id==NombreSelect){
	    	tablinks[i].style.cssText = "background-color:cyan; cursor:pointer;";

	    }
	  }
	  //$("#"+NombreSelect).style.cssText = "background-color:red";
	  //evt.style.cssText = "background-color:red";

	  $("#btnNotificar").show();

}


function openCity(evt, cityName) {
	  // Declare all variables
	  var i, tabcontent, tablinks;

	  // Get all elements with class="tabcontent" and hide them
	  tabcontent = document.getElementsByClassName("tabcontent");
	  for (i = 0; i < tabcontent.length; i++) {
	    tabcontent[i].style.display = "none";
	  }

	  // Get all elements with class="tablinks" and remove the class "active"
	  tablinks = document.getElementsByClassName("tablinks");
	  for (i = 0; i < tablinks.length; i++) {
	    tablinks[i].className = tablinks[i].className.replace(" active", "");
	  }

	  // Show the current tab, and add an "active" class to the button that opened the tab
	  document.getElementById(cityName).style.display = "block";
	  evt.currentTarget.className += " active";
} 


function exeGrabarAccion(){
	 
	let Credencial = "abfw45412f";
	let descrip=$("#txtDescripcionAccion").val();
	let fechaaccion=$("#dtpFechaAccion").val();
	let tipoaccion=$("#cboTipoaccion").val();
	let idnotif=ROWINCIDENCIACTIVA.Nu_Id_Notificacion;
	let identidad=ROWINCIDENCIACTIVA.Nu_IdEntidad;
	let idincid=ROWINCIDENCIACTIVA.Nu_Id_Incidencia;
	


	let objJson ={ "credencial":Credencial
	              ,"descrip":descrip
	              ,"fechaaccion":fechaaccion
	              ,"idnotif":idnotif
	              ,"identidad":identidad
	              ,"idincid":idincid
	              ,"tipoaccion":tipoaccion};  	
	let txtJson=JSON.stringify(objJson);			
	let param={datos : txtJson };	
	let h=new Date();  
    $.post("../controller/guardarAccion.php?"+h, param,function(result) { 
	             
				 console.log("result grabar accion  : ", result);	
				 let resultado = result[0].result;
				 if (resultado==1){
				 	alert("RESGISTRO SATISFACTORIO!");
				 	$("#divGrabarAccionNueva").hide();
				 	$("#DivModal").hide();
				 	filtrarDetalles(ROWINCIDENCIACTIVA.Nu_Id_Incidencia);

				 }else{
				 	alert("Intentalo Nuevamente 3");
				 }


	             
	            
				 //alert("se bravo");
				
			
    },"json")
	.done(function(){       
    })
    .fail(function(er){
       //alert("Exception::  " );	 
       console.log("ERROR :  ::: ",er);	   
    })
    .always(function(){       
    });

	 
}


function showLoading() {
			esri.show(loading);
		  //map.disableMapNavigation();
		  //map.hideZoomSlider();
}


function hideLoading(error) {
	esri.hide(loading);
  //map.enableMapNavigation();
  //map.showZoomSlider();
}


function grabarIncidencia(){

	    alert("grabarIncidencia");

        let point = new Point( {"x": "-78.158", "y": "-8.256", "spatialReference": {"wkid": 4326 } });		 
		let graphicSaveCob = new Graphic(point, null, null);		


	     // let attr2 = { "descrip" : "ferr" };  			            		         	
      //    graphicSaveCob.setAttributes(attr2);       			
         featureLayerIncidencias.applyEdits( [graphicSaveCob],null, null ,null, lang.hitch(this, function (results) {

				          	alert("error");
				          	console.log("error result", results);
				          }));
}


function getAllIncidencias(){
	 
	let Credencial = "abfw45412f";
	let objJson ={"credencial":Credencial,};  	
	let txtJson=JSON.stringify(objJson);			
	let param={datos : txtJson };	
	let h=new Date();  
    $.post("../controller/listaIncidenciasUser.php?"+h, param,function(result) { 
	             
				 console.log("result  Lista listaIncidencias User  : ", result);	
	             
	            
				 let resultado = result[0].result;
				 //alert(resultado);
				 if (resultado==1){
					 
					  //x + "@" + valor.i_codopera + "@" +  valor.i_codnivel + "@" + valor.v_coddep + "@" + valor.v_codpro + "@" + valor.v_coddis;
					  //let idContenedor = obj.srcElement.id;
					  //console.log();
					  let Datos = result[0].datos;
					  
					  if (Datos.length==0){
						   
							   alert("No se encontraron datos 1");
							   // $("#pannel_001").html("");
							   // $("#iconLoadFindAdv").hide();
						   
					  }else{
						  
							  tabularResultsIndicencias( Datos );
						      
					  }
					  //console.log("###$$$$sssssssssss -> ",ResultadoBusquedaUltim.length);
				      
				 }else{
				      alert("Intentalo nuevamente 4!");	
                      console.log(result);					  
				 }
				
			
    },"json")
	.done(function(){       
    })
    .fail(function(er){
       //alert("Exception::  " );	 
       console.log("ERROR :  ::: ",er);	   
    })
    .always(function(){       
    });

	 
}

   
function tabularResultsIndicencias(results){

	    ListaIncidenciasActual = results;
	
		//console.log("tabaular",results);
		
		$.each(results, function(x, valor) {
				let Tr = document.createElement("TR");
				
				let ColorEstado;
                if (valor.Nu_Estado==1){
                	ColorEstado="red";
                }else if(valor.Nu_Estado==2){
                	ColorEstado="orange";
                }else if(valor.Nu_Estado==3){
                	ColorEstado="#00BFFF"
                }else if(valor.Nu_Estado==4){
                	ColorEstado="green"
                }

				let Td1 = document.createElement("TD"); 
				Td1.style.cssText = "text-align: center; color:"+ColorEstado;
				Td1.innerHTML = 	valor.Nu_EstadoDesc;

				let IconEstado = document.createElement("i"); 
				IconEstado.style.cssText = "font-size: 18px;font-weight: bold; color:"+ColorEstado;
				IconEstado.className = 'pe-7s-map-marker';

				//Td1.appendChild(IconEstado);
				
				let Td2 = document.createElement("TD"); 
				Td2.style.cssText = "text-transform:capitalize;";
				Td2.innerHTML = valor.Nu_Id_Incidencia ;

				let Td3 = document.createElement("TD"); 
				Td3.style.cssText = "text-transform:capitalize;";
				Td3.innerHTML = valor.Tx_Descripcion ;

				let Td4 = document.createElement("TD"); 
				Td4.style.cssText = "text-transform:capitalize;";
				Td4.innerHTML = valor.Nu_CodTemaDesc ;

				let Td5 = document.createElement("TD"); 
				Td5.style.cssText = "text-transform:capitalize;";
				Td5.innerHTML = (valor.Fe_FechaIncidencia == null ? '' : valor.Fe_FechaIncidencia.date);  

				let Td6 = document.createElement("TD"); 
				Td6.style.cssText = "text-transform:capitalize;";
				Td6.innerHTML = (valor.Fe_FechaNotifca == null ? '' : valor.Fe_FechaNotifca.date); 

				let Td7 = document.createElement("TD"); 
				Td7.style.cssText = "text-transform:capitalize;";
				Td7.innerHTML = (valor.Fe_FechaAccionUlt == null ? '' : valor.Fe_FechaAccionUlt.date); 
				
				let Td8 = document.createElement("TD"); 
			    
				
				let iconSel = document.createElement("span"); 
				iconSel.id = "inc"+x + "@" + valor.Nu_Id_Incidencia + "@" +  valor.Nu_IdGis ;
				iconSel.innerHTML = 	"search";
				iconSel.className = 'material-icons';
				iconSel.style.cssText = "cursor:pointer;";
				iconSel.onclick = verDetalleIncidencia;

                Td8.appendChild(iconSel);				
				
				Tr.appendChild(Td8);
				Tr.appendChild(Td2);
				Tr.appendChild(Td1);
				
				Tr.appendChild(Td3);
				Tr.appendChild(Td4);
				Tr.appendChild(Td5);
				Tr.appendChild(Td6);
				Tr.appendChild(Td7);
								
				$("#tbodyTable").append(Tr); 
					
		});	
	
	
	
	
}

function verDetalleIncidencia2(obj){
	//alert("Ahora pex");

}


function verDetalleIncidencia(obj){

	    //showLoading hideLoading
	    showLoading();

	    let idContenedor = obj.srcElement.id;
		let objsplit     = idContenedor.split("@");
		
		let IdIncidencia = objsplit[1];
		let IdGis = objsplit[2];
		
		console.log("IdIncidencia",IdIncidencia);
		console.log("IdGis",IdGis);
       	             		                    		                 	

     	setTimeout(function(){ 


     		
		    
		    
		    $.each(ListaIncidenciasActual, function(x, valor) {
		    	if(valor.Nu_Id_Incidencia==IdIncidencia){
                      ROWINCIDENCIACTIVA=valor;
		    	}
		    });

		    console.log("ROWINCIDENCIACTIVA", ROWINCIDENCIACTIVA);
		    
		    // dom.byId("lblIncId").innerHTML=ROWINCIDENCIACTIVA.Nu_Id_Incidencia;
		    // dom.byId("lblEstado").innerHTML=ROWINCIDENCIACTIVA.Nu_Estado;
		    dom.byId("lblDesc").innerHTML=ROWINCIDENCIACTIVA.Tx_Descripcion;
		    // dom.byId("lblTema").innerHTML=ROWINCIDENCIACTIVA.Nu_CodTema;
		    // let Fe_FechaIncidencia = new Date(ROWINCIDENCIACTIVA.Fe_FechaIncidencia.date);
		    // dom.byId("lblFecInc").innerHTML=(ROWINCIDENCIACTIVA.Fe_FechaIncidencia == null ? '' :   Fe_FechaIncidencia.toLocaleDateString()  ); 

		    // let Fe_FechaNotifca = new Date(ROWINCIDENCIACTIVA.Fe_FechaNotifca.date);
		    // dom.byId("lblFecNotif").innerHTML=(ROWINCIDENCIACTIVA.Fe_FechaNotifca == null ? '' : Fe_FechaNotifca.toLocaleDateString()); 

		    // let Fe_FechaAccionUlt = new Date(ROWINCIDENCIACTIVA.Fe_FechaAccionUlt.date);
		    // dom.byId("lblFecUltAcc").innerHTML=(ROWINCIDENCIACTIVA.Fe_FechaAccionUlt == null ? '' : Fe_FechaAccionUlt.toLocaleDateString());


		    let point = new Point( {"x": $.trim(ROWINCIDENCIACTIVA.Tx_Latitud), "y":  $.trim(ROWINCIDENCIACTIVA.Tx_Longitud), "spatialReference": {"wkid": 4326 } });				
			map.centerAndZoom(point,17);
		    //map.centerAndZoom(feature.geometry,17);

		    
			let symbol =  new PictureMarkerSymbol({
			    "url":"img/icon_red2.png",
			    "height":60,
			    "width":60,
			    "type":"esriPMS"
			  });


		    var graphic = new Graphic(point, symbol);


             map.graphics.add(graphic);


		    $("#divTabla").hide();
 		    $("#divMapa").show();
		    hideLoading();
		    filtrarDetalles(ROWINCIDENCIACTIVA.Nu_Id_Incidencia);
	
		}, 1500);
				       
	                 	
	               
	                 
	             

}


function filtrarDetalles(IdIncidencia){
    
    let Credencial = "abfw45412f";
	let objJson ={"credencial":Credencial, "IdInci":IdIncidencia};  	
	let txtJson=JSON.stringify(objJson);			
	let param={datos : txtJson };	
	let h=new Date();  
    $.post("../controller/getDetallesIndicenciaUser.php?"+h, param,function(result) { 
	             
				 //console.log("result  Lista Acciones  : ", result);	
	             //return;
	            
				 let resultado = result[0].result;
				 let resultado2 = result[0].result2;
				 
				 if (resultado==1){
				 	  showAcciones(result);
				 }else{
				      alert("Intentalo nuevamente 1!");					  
				 }


				 // if (resultado2==1){
				 // 	  showNotificaciones(result);
				 // }else{
				 //      alert("Intentalo nuevamente!");	                      					  
				 // }
				
			
    },"json")
	.done(function(){       
    })
    .fail(function(er){
       //alert("Exception::  " );	 
       console.log("ERROR :  ::: ",er);	   
    })
    .always(function(){       
    });


}


function showNotificaciones(result){

	let Datos = result[0].datos2;

	if (Datos.length==0){
							   					  	
	    alert("No se encontraron datos 2");

	}else{

		//Filtrar los grupos "instituciones"
		let ArrNotifs = [];
		let ArrTmp = [];
		$.each(Datos, function(x, valor) {
			if ( ArrTmp.indexOf(valor.Nu_Id_Notificacion) == -1 ){
				  ArrTmp.push(valor.Nu_Id_Notificacion)
	          ArrNotifs.push({"idIns":valor.Nu_Id_Notificacion, "fechanoti": valor.Fe_FechaNotifca  ,"descrip": valor.Tx_Descripcion});    
			}
		});
		//console.log( "ArrInstitu:", ArrNotifs );


		//Pintar las acciones
		let HtmlNotifs="";
		$.each(ArrNotifs, function(x, valor) {
			let FechaNoti = new Date(valor.fechanoti.date);
			HtmlNotifs += "<b>"+ FechaNoti.toLocaleDateString() +  " " + valor.descrip+"</b><br>";
			$.each(Datos, function(x, valor2) {
			    if (valor.idIns==valor2.Nu_Id_Notificacion){
	                
				    HtmlNotifs += "&nbsp;<span style='font-size:13px; color:orange; font-weight:bold' class='pe-7s-check'/>&nbsp;" +  valor2.Entidad + "<br>";
		   	    }
			});
			HtmlNotifs += "<hr>";
		});

		
		$("#divNotifocaciones").html(HtmlNotifs);

		//console.log("HtmlNotifs", HtmlNotifs);


	}
	//console.log("###$$$$sssssssssss -> ",ResultadoBusquedaUltim.length);


}


function showAcciones(result){

	let Datos = result[0].datos;

	if (Datos.length==0){

	    alert("No se encontraron datos 3");

	}else{

		//Filtrar los grupos "instituciones"
		let ArrInstitu = [];
		let ArrTmp = [];
		$.each(Datos, function(x, valor) {
			if ( ArrTmp.indexOf(valor.Nu_Id_Entidad) == -1 ){
				  ArrTmp.push(valor.Nu_Id_Entidad)
	          ArrInstitu.push({"idIns":valor.Nu_Id_Entidad, "descrip": valor.Tx_DescripcionEntidad});    
			}
		});
		//console.log( "ArrInstitu:", ArrInstitu );


		//Pintar las acciones
		let HtmlAcciones="";
		$.each(ArrInstitu, function(x, valor) {
			//HtmlAcciones += "<b>ACCIONES DE "+ valor.descrip+"</b><br>";
			HtmlAcciones += "<b>ACCIONES REALIZADAS</b><br><br>";
			$.each(Datos, function(x, valor2) {
			    if (valor.idIns==valor2.Nu_Id_Entidad){
	                let FechaAccion = new Date(valor2.Fe_FechaAccion.date);
				    HtmlAcciones += "&nbsp;<span style='font-size:13px; color:orange; font-weight:bold' class='pe-7s-check'/>&nbsp;" +  FechaAccion.toLocaleDateString() + " " +  valor2.Tx_DescripcionAccion+"<br>";
		   	        HtmlAcciones += "<hr>";
		   	    }
			});
			
		});

		
		$("#divAcciones").html(HtmlAcciones);

		//console.log("HtmlAcciones", HtmlAcciones);


	}
	


}





});

