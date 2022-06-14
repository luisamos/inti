	
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



	var LIST_CATTERR = [
		{"cod":1, "valor":"ANP - Parque Nacional"},
		{"cod":2, "valor":"ANP - Santuario Nacional"},
		{"cod":3, "valor":"ANP -Reserva Nacional"},
		{"cod":4, "valor":"ANP - Cotos de caza"},
		{"cod":5, "valor":"ANP - Zona reservada"},
		{"cod":6, "valor":"ANP - Reserva paisajistica"},
		{"cod":7, "valor":"ANP - Reserva Comunal"},
		{"cod":8, "valor":"ANP - Refugio de vida silvestre"},
		{"cod":9, "valor":"ANP - Santuario Historico"},
		{"cod":10, "valor":"ANP - Bosque de proteccion"},
		{"cod":11, "valor":"ACR - Area de Conservacion Regional"},
		{"cod":12, "valor":"ACP - Area de Conservacion Privada"},
		{"cod":13, "valor":"Zona de Amortiguamiento"},
		{"cod":14, "valor":"Concesión Forestal con Fines Maderables"},
		{"cod":15, "valor":"Concesión de Conservación"},
		{"cod":16, "valor":"Concesión de Ecoturismo"},
		{"cod":17, "valor":"Concesión Reforestación"},
		{"cod":18, "valor":"Concesión Productos Forestales Diferentes a la Madera"},
		{"cod":19, "valor":"Concesión Plantaciones Forestales"},
		{"cod":20, "valor":"Bosque Local"},
		{"cod":21, "valor":"Bosque de Producción Permanente sin concesionar"},
		{"cod":22, "valor":"Concesiones Mineras"},
		{"cod":23, "valor":"Concesiones Hidrocarburos"},
		{"cod":24, "valor":"Comunidades Nativas"},
		{"cod":25, "valor":"Comunidades Campesinas"},
		{"cod":26, "valor":"Reservas Territoriales"},
		{"cod":27, "valor":"Registro de Plantaciones Forestales"},
		{"cod":28, "valor":"Predio Rural"},
		{"cod":29, "valor":"Ecosistemas fragiles"},
		{"cod":30, "valor":"Sin Categoría - Área de libre disponibilidad del estado"}
	];

	var LIST_FASESSNCVFFS =[
		{"cod":1 , "valor":"Emision de Informe de Priorizacion DCGFFS"},
		{"cod":2 , "valor":"Planificacion de intervencion conjunta"},
		{"cod":3 , "valor":"Ejecucion de la Intervencion Conjunta"},
		{"cod":4 , "valor":"Reporte de Resultados de la  intervencion conjunta"},
		{"cod":5 , "valor":"Seguimiento de las Acciones de control"},
		{"cod":6 , "valor":"Acciones de Sancion"},
        {"cod":7 , "valor":"Reincidencia"}
	];

	var LIST_DRIVERS= [
		{"cod":1 , "valor":"Minería"},
		{"cod":2 , "valor":"Agricultura"},
		{"cod":3 , "valor":"Caminos"},
		{"cod":4 , "valor":"Invasiones"},
		{"cod":5 , "valor":"Infraestructura"},
		{"cod":6 , "valor":"Ganadería"},
        {"cod":7 , "valor":"Cultivo Ilicitos"},
        {"cod":8 , "valor":"Otros"}

	]

	//console.log("LIST_CATTERR", LIST_CATTERR); 
	 
   
	var LEYENDA;
	var graphicSaveCob;
	var loading = dom.byId("loadingImg"); 	
	var ListaIncidenciasActual;
	var ROWINCIDENCIACTIVA;
	//alert("dola");
	
	var pointSymbol =  new PictureFillSymbol({
		"url":"img/icon_green.png",
		"height":50,
		"width":38,
		"type":"esriPMS"
    });
	var pointGraphics = new GraphicsLayer({
                id: 'drawGraphics_UsPoint',
                title: 'Draw Graphics'
            });	
	var pointRenderer = new SimpleRenderer(pointSymbol);
	pointRenderer.label = 'User drawn points';
	pointRenderer.description = 'User drawn points';
	pointGraphics.setRenderer(pointRenderer);
	
	
	var polylineGraphicsLimites = new GraphicsLayer({
                id: 'polyLimitesPolit',
                title: 'Limites Politicos'
            });
	var polylineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 4);		
	var polylineRenderer = new SimpleRenderer(polylineSymbol);
	polylineRenderer.label = ' ';
	polylineRenderer.description = ' ';
	polylineGraphicsLimites.setRenderer(polylineRenderer);
	
	var sls = new SimpleLineSymbol("solid", new Color("#444444"), 3);
    var sfs = new SimpleFillSymbol("solid", sls, new Color([68, 68, 68, 0.25]));
	var mks = new SimpleMarkerSymbol();




    var denunciasTemplate     = new InfoTemplate();
	
	
	
	denunciasTemplate.setTitle("<b>Deforestación</b>");   

	denunciasTemplate.setContent(getContentDenuncias);  
	
	

	
	
	
	 
	var denunciasServicesMap = new ArcGISDynamicMapServiceLayer("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Denuncias/MapServer", {
        "id": "SRV001CAMBIOUSO",
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



    denunciasServicesMap.setInfoTemplates({
        0: { infoTemplate: denunciasTemplate }
    });




    map.addLayer(denunciasServicesMap);

    map.addLayer(polylineGraphicsLimites);

	map.addLayer(pointGraphics);

	map.infoWindow.on('hide', function(){  
            
            $("#divGraficoAvanceLine").hide();
            

    });  


    denunciasServicesMap.setVisibleLayers([0]);	


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


	$('#btnBuscar').on('click', function(event) {		 
		
		let _anio= $("#cboAnio").val();
		let _mes = $("#cboMes").val();

	    if (_anio==="0" && _mes!=="0")	{
	    	alert("Debes indicar el año para filtrar un determinado mes!");
	    	return;
	    }else{
	    	cargarDatos();
	    }

	    let iddep= $("#cboDptos").val();
	     if (iddep!="00"){   
			buscarDpto(this.value);	
		}else{
			map.centerAndZoom([-75.10, -9.11],5);	
        	polylineGraphicsLimites.clear();
		}
	});



	$('#cboDptos').on('change', function() {

		let _anio= $("#cboAnio").val();
		let _mes = $("#cboMes").val();

	    if (_anio==="0" && _mes!=="0")	{
	    	alert("Debes indicar el año para filtrar un determinado mes!");
	    	return;
	    }else{
	    	cargarDatos();
	    }

	    if (this.value!="00"){   
			buscarDpto(this.value);	
		}else{
			map.centerAndZoom([-75.10, -9.11],5);	
        	polylineGraphicsLimites.clear();
		}

	});




  	$('#txtCodRepor').keypress(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){
			
			buscarRepor(this.value);
		}
	});


	$('#txtCut').keypress(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){
			
			buscarCut(this.value);
		}
	});





	

	
	

	


	
	
   
	
    //getAllIncidencias();
    //grabarIncidencia();

    TMPcargarGraficos()

    cargarDatos();
	



	$('#btnLogout').on('click', function(event) {		 
		
		logOut();
	});





	
/********************************************
*********************************************
******************FUNCIONES****************** 
*********************************************
********************************************/


function defineEstadoEvolu(obj){

	let idContenedor = obj.srcElement.id;
	let objsplit     = idContenedor.split("@");
	
	let Estado = objsplit[1];


	//alert(Estado);
    //Estado=1;

	if(Estado==="null") return;


	      $("#divGraficoAvanceLine").show();
		//Estado=1;

		//let FESATB = new Date( GrafCliked.attributes.FESATB);
		//$("#fechaline1").html(FESATB.getDate()+"/"+ (FESATB.getMonth()+1) + "/" + FESATB.getFullYear());

		
        let x=1;
        for (x;x<=7;x++){
        	let element = document.getElementById("divpline"+x);
            element.classList.remove("old");
            element.classList.remove("next");
            element.classList.remove("active");

            
            document.getElementById("iconline"+x).style.opacity = 1 ;
        }

        let IntEstado = parseInt(Estado);
        let y=1;
        for (y;y<=IntEstado;y++){
        	let element2 = document.getElementById("divpline"+y);
            element2.className += " " + "old";
        }

        let elnro = IntEstado +1;
        if (IntEstado ===7){
        	//alert("es");
            //elnro=5
        }else{

        	for (elnro; elnro<=7; elnro++){
	        	let element3 = document.getElementById("divpline"+elnro);
	            element3.className += " " + "next";
	            document.getElementById("iconline"+elnro).style.opacity = 0.1
	        }

        }

        

        let elementP = document.getElementById("divpline"+IntEstado);
        elementP.className += " " + "active";

        
        
        //
							    




	}






 	function filtrarFields4Popup(ObjJson, nombrefilter){

    	let Row = null;

    	$.each(ObjJson, function(x, valor) {
    		if (valor.name===nombrefilter){
    			Row = valor;
    		}
    	}); 

    	return Row;

    }


	function getContentDenuncias(graphic){

    	// GrafCliked=graphic;


    	//return "Hola";

    	//defineEstadoEvolu(graphic.attributes.SNCVFFS);


    	map.infoWindow.resize(310, 300);

       console.log("graphic:",graphic);

        let HtmlDeforestacion="";
        let TableHtml = document.createElement("TABLE");
        TableHtml.style.cssText = "margin:0px !important;padding:0px !important;";
        TableHtml.id = "tbl@"+graphic.attributes.OBJECTID + "@" + graphic.attributes.OBJECTID ;
        let DatosRow = [];

  
        let LIST_FIELDS_DENUNCIAS = ["NOMDEP", "NOMPRO", "NOMDIS", "CUT", "DRIVER", "FECDEN", "CATEG" ,"SNCVFFS","DESCR", "REPOR"];


		$.each(LIST_FIELDS_DENUNCIAS, function(x, valor1) {

			valor= filtrarFields4Popup (graphic._layer._fields, valor1);

        	if(valor!=null){

                let Tr = document.createElement("TR");
                let Td1 = document.createElement("TD"); 
				Td1.style.cssText = "text-align: left; font-weight:bold;";
				Td1.innerHTML = 	valor.alias;
				
				Tr.appendChild(Td1);
                
                let Td2 = document.createElement("TD"); 
				Td2.style.cssText = "text-align: left";				
                if (valor.domain){                                        
                    $.each(valor.domain.codedValues, function(y, val) {	                    
                    	if (val.code == graphic.attributes[valor.name]){                            
                            Td2.innerHTML = val.name;   
                            DatosRow.push({"name": valor.name ,"dato": val.name});
                            //DatosRow.push({valor.name : val.name}); 
                    	}
                    });

                }else{

                	if (valor.type==="esriFieldTypeDate"){
                		//Td2.innerHTML = 	graphic.attributes[valor.name];
               	        //DatosRow.push({"name": valor.name ,"dato": graphic.attributes[valor.name]});

               	        let FechaDato = new Date(graphic.attributes[valor.name]);			       

			            Td2.innerHTML = FechaDato.toLocaleDateString();
               	        DatosRow.push({"name": valor.name ,"dato": FechaDato.toLocaleDateString()});



                	}else{

                		let ValorTdf= "";

                		Td2.innerHTML = 	graphic.attributes[valor.name];
               	        	DatosRow.push({"name": valor.name ,"dato": graphic.attributes[valor.name]})
                		

               	        

                	}
               	    
               	    //DatosRow.push({valor.name : graphic.attributes[valor.name]})
                } 

                Tr.appendChild(Td2);


                TableHtml.appendChild(Tr);

            }
		}); 





		let iconNotif = document.createElement("a"); 
		iconNotif.id = "inc@"+graphic.attributes.SNCVFFS;		
		iconNotif.style.cssText = "cursor:pointer;    font-size:12px; font-weight:bold;float:right";
		//iconNotif.style.cssText = "float:right";
		//iconNotif.className = 'btns';
		iconNotif.innerHTML = 	"Ver fase";
		//iconNotif.elDato = DatosRow;
		iconNotif.onclick = defineEstadoEvolu; 


		// let iconDownKml = document.createElement("a"); 
		// iconDownKml.id = "idwnc@"+graphic.attributes.REPOR + "@"  +graphic.attributes.OBJECTID  ;			
		// //iconDownKml.style.cssText = "background-color: hotpink;cursor:pointer; font-size:12px; font-weight:bold; text-decoration: underline; float:right";
		// iconDownKml.style.cssText = "float:left; cursor: pointer";
		// iconDownKml.className = 'material-icons';
		// iconDownKml.innerHTML = 	"cloud_download";
		// iconDownKml.elDato = DatosRow;
		// iconDownKml.onclick = getKmlDefo; 



		// let iconDownKml2 = document.createElement("a"); 
		// iconDownKml2.id = "idwnc@"+graphic.attributes.REPOR + "@"  +graphic.attributes.OBJECTID  ;					
		// iconDownKml2.style.cssText = "float:left; cursor: pointer";
		// iconDownKml2.className = 'material-icons';
		// iconDownKml2.innerHTML = 	"format_list_numbered";
		// iconDownKml2.alt="Ver reporte";
		// iconDownKml2.elDato = DatosRow;
		// iconDownKml2.onclick = getRptDefo; 


		

		// let Separate = document.createElement("br"); 

        let DivBody       = document.createElement("div");

  //       DivBody.append(iconDownKml);
  //       DivBody.append(iconDownKml2);
         DivBody.append(iconNotif)
  //       DivBody.append(Separate)
        DivBody.append(TableHtml)
        //DivBody.innerHTML = 	HtmlDeforestacion;

		return DivBody;


    }





function logOut(){


	window.open("../gestionmonitoreo/index.html","_top");

	
}



function buscarCut(cut){
    	//alert(reporte);
    	var queryTask = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Denuncias/MapServer/0");  
		var query = new Query();                                     
		query.returnGeometry = true;                                 
		query.outFields = ["OBJECTID"];                        
		query.where =  "CUT ='"+cut+"'";        
		queryTask.execute(query, lang.hitch(this, function (results) {  
		
						//console.log("JbusRpete :",results);		 
						if(results.features.length==0){
							alert("no se encontraron datos");
							return;
						}
						//return;
		                //console.log("result polys hhhhhhhhh: ",results);
		                pointGraphics.clear();
		                var extentX;

						$.each(results.features, function(x, valor) {
	                        let graphic = new Graphic(valor.geometry); 		                 	
		                 	pointGraphics.add(graphic);
		                 	
		                 	var extent = valor.geometry.getExtent().expand(1.5);
		                 	//map.setExtent(extent); 

		                 	if (extentX) {
						      extentX = extentX.union(extent);
						    } else {
						      extentX = new esri.geometry.Extent(extent);
						    }

		                 	//console.log(valor.geometry)

							
						});
						map.setExtent(extentX); 

	 
			  }),lang.hitch(this, function(err){ 
				  alert( "ERR::->"+ err);            	              
			  })
		); 

    }


function buscarRepor(reporte){
    	//alert(reporte);
    	var queryTask = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Denuncias/MapServer/0");  
		var query = new Query();                                     
		query.returnGeometry = true;                                 
		query.outFields = ["OBJECTID"];                        
		query.where =  "REPOR ='"+reporte+"'";        
		queryTask.execute(query, lang.hitch(this, function (results) {  
		
						//console.log("JbusRpete :",results);		 
						if(results.features.length==0){
							alert("no se encontraron datos");
							return;
						}
						//return;
		                //console.log("result polys hhhhhhhhh: ",results);
		                pointGraphics.clear();
		                var extentX;

						$.each(results.features, function(x, valor) {
	                        let graphic = new Graphic(valor.geometry); 		                 	
		                 	pointGraphics.add(graphic);
		                 	
		                 	var extent = valor.geometry.getExtent().expand(1.5);
		                 	//map.setExtent(extent); 

		                 	if (extentX) {
						      extentX = extentX.union(extent);
						    } else {
						      extentX = new esri.geometry.Extent(extent);
						    }

		                 	//console.log(valor.geometry)

							
						});
						map.setExtent(extentX); 

	 
			  }),lang.hitch(this, function(err){ 
				  alert( "ERR::->"+ err);            	              
			  })
		); 

    }


function buscarDpto (iddpto){
		
		var queryTask = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Limites_Politicos_Administrativos/MapServer/0");  
		var query = new Query();                                     
		query.returnGeometry = true;                                 
		query.outFields = ["OBJECTID,NOMBDEP"];                        
		query.where =  "IDDPTO ='"+iddpto+"'";        
		queryTask.execute(query, lang.hitch(this, function (results) {  
		
		                 ////console.log(results);		 
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



function diasEnUnMes(ano, mes) {
	return new Date(ano, mes, 0).getDate();
}

function defineFechas(ano,mes){
	console.log("ano", ano);
	console.log("mes", mes);
			
	
	var fi;
	var ff;
	let strQuery;

	if( ano==="0" && mes==="0"){ 
		return null;
	}
		
	if( ano!="0" && mes=="0"){ //quieren de todo el año
		fi=ano+"-1-1";
		ff=ano+"-12-31";
		//strQuery = " FECDEN <= '"+ff+"' ";
		strQuery = "  (FECDEN >= '"+fi+"' and FECDEN <= '"+ff+"') ";

	}else{	
		var nroDiasMes = diasEnUnMes(ano, mes);
		fi = ano+"-"+mes+"-1";
		ff = ano+"-"+mes+"-"+nroDiasMes;

		strQuery = "  (FECDEN >= '"+fi+"' and FECDEN <= '"+ff+"') ";
	}
	return strQuery;
}


function cargarDatos(){

	//************ Grupo estadistico

	let _Mes  = $("#cboMes").val();
	let _Anio = $("#cboAnio").val();
	let StringQuery="";
	

	let strSqlFechas = defineFechas(_Anio, _Mes);
	let idDep = $("#cboDptos").val();

	if (strSqlFechas!=null && idDep!="00"){
		StringQuery+=strSqlFechas + " and NOMDEP ='"+idDep+"' "; 

	}else if(strSqlFechas!==null && idDep==="00"){
		StringQuery+=strSqlFechas;

	}else if(strSqlFechas===null && idDep!=="00"){
		StringQuery+=" NOMDEP ='"+idDep+"' "; 

	}

	console.log("StringQuery->",StringQuery);

	///secciojn mfilter map////

	let layerDefinitions = [];

	layerDefinitions[0] = StringQuery;
	denunciasServicesMap.setLayerDefinitions(layerDefinitions);

	///////
	//return;


    //SNCVFFS GGGGGGGGGGGGGgggggg
	let statisticDefinition2 = new StatisticDefinition();
    statisticDefinition2.statisticType = "count";
    statisticDefinition2.onStatisticField = "OBJECTID";
    statisticDefinition2.outStatisticFieldName = "TOTAL_OBJECTS";

	let queryTask2 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Denuncias/MapServer/0"); 
	let query2 = new Query();                         		
	query2.groupByFieldsForStatistics = ["SNCVFFS"]; 		
	query2.outStatistics = [statisticDefinition2];   
	query2.where = StringQuery;

	queryTask2.execute(query2, lang.hitch(this, function (results) {

		//console.log("fr5555:",results);

		$("#lblfase_1").html("0");
		$("#lblfase_2").html("0");
		$("#lblfase_3").html("0");
		$("#lblfase_4").html("0");
		$("#lblfase_5").html("0");
		$("#lblfase_6").html("0");
		$("#lblfase_7").html("0");

		let resultados= results.features;	
		let totreg=0;

		$.each(resultados, function(x, valor) {
		    totreg+=valor.attributes.TOTAL_OBJECTS 
			
			if (valor.attributes.SNCVFFS!==null){
				let Codi= valor.attributes.SNCVFFS;
				$("#lblfase_"+Codi).html(valor.attributes.TOTAL_OBJECTS)
			}
		});
		$("#lblfase_total").html(totreg);
					 
	}),lang.hitch(this, function(err){ 
		alert( "ERR qiery task  ::->"+ err);            	              
	}));


	//CATEG GGGGGGGGGGGGGgggggg
	let statisticDefinition3 = new StatisticDefinition();
    statisticDefinition3.statisticType = "count";
    statisticDefinition3.onStatisticField = "OBJECTID";
    statisticDefinition3.outStatisticFieldName = "TOTAL_OBJECTS";

	let queryTask3 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Denuncias/MapServer/0"); 
	let query3 = new Query();                         		
	query3.groupByFieldsForStatistics = ["CATEG"]; 		
	query3.outStatistics = [statisticDefinition3];   
	query3.where = StringQuery;

	queryTask3.execute(query3, lang.hitch(this, function (results) {

		console.log("query3:",results);
		showGrafiCatTerr(results);
					 
	}),lang.hitch(this, function(err){ 
		alert( "ERR qiery task  ::->"+ err);            	              
	}));  



	// DRIVER GGGGGGGGGGGGGgggggg
	let statisticDefinition4 = new StatisticDefinition();
    statisticDefinition4.statisticType = "count";
    statisticDefinition4.onStatisticField = "OBJECTID";
    statisticDefinition4.outStatisticFieldName = "TOTAL_OBJECTS";

	let queryTask4 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Denuncias/MapServer/0"); 
	let query4 = new Query();                         		
	query4.groupByFieldsForStatistics = ["DRIVER"]; 		
	query4.outStatistics = [statisticDefinition4];   
	query4.where = StringQuery;

	queryTask4.execute(query4, lang.hitch(this, function (results) {

		//console.log("query4:",results);
		showGrafiDrivers(results);
					 
	}),lang.hitch(this, function(err){ 
		alert( "ERR qiery task  ::->"+ err);            	              
	}));  

}

function aliasDriver(cod){

	let Alias=cod;
	$.each(LIST_DRIVERS, function(x, valor) { 
		if (valor.cod===cod){
			Alias=valor.valor;
		}
	});
	return Alias;
}

function aliasCateTerr(cod){
	let Alias=cod;
	$.each(LIST_CATTERR, function(x, valor) { 
		if (valor.cod===cod){
			Alias=valor.valor;
		}
	});
	return Alias;

}

function aliasFaseSNFV(cod){

}


function showGrafiCatTerr(datos){

	let results= datos.features;

	let Series = [];
	let alias;

	$.each(results, function(x, valor) { 
		console.log(valor.attributes.TOTAL_OBJECTS);
		alias = aliasCateTerr(valor.attributes.CATEG)
		Series.push({"name": alias, "y":valor.attributes.TOTAL_OBJECTS});

	});


	 // Create the cha   
	Highcharts.chart('divGraficoEstados', {
	    chart: {
	        type: 'column'
	    },
	    title: {
	        text: 'Nro de denuncias por categoria territorial'
	    },
	    subtitle: {
	        text: ''
	    },
	    accessibility: {
	        announceNewData: {
	            enabled: true
	        }
	    },
	    xAxis: {
	        type: 'category'
	    },
	    yAxis: {
	        title: {
	            text: 'Total denuncias'
	        }

	    },
	    legend: {
	        enabled: false
	    },
	    plotOptions: {
	        series: {
	            borderWidth: 0,
	            dataLabels: {
	                enabled: true,
	                format: '{point.y}'
	            }
	        }
	    },

	    tooltip: {
	        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
	        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}</b> of total<br/>'
	    },

	    series: [
	        {
	            name: "Browsers",
	            colorByPoint: true,
	            data: Series
	        }
	    ]
	});



}


function showGrafiDrivers(datos){
	//console.log("cadodod:", datos);

	let results= datos.features;

	let Series = [];
	let alias;

	$.each(results, function(x, valor) { 
		console.log(valor.attributes.TOTAL_OBJECTS);
		alias = aliasDriver(valor.attributes.DRIVER)
		Series.push({"name": alias, "y":valor.attributes.TOTAL_OBJECTS});

	});


	Highcharts.chart('divGraficoDrivers', {
	    chart: {
	        type: 'column'
	    },
	    title: {
	        text: 'Nro de denuncias por Drivers'
	    },
	    subtitle: {
	        text: ''
	    },
	    accessibility: {
	        announceNewData: {
	            enabled: true
	        }
	    },
	    xAxis: {
	        type: 'category'
	    },
	    yAxis: {
	        title: {
	            text: 'Total denuncias'
	        }

	    },
	    legend: {
	        enabled: false
	    },
	    plotOptions: {
	        series: {
	            borderWidth: 0,
	            dataLabels: {
	                enabled: true,
	                format: '{point.y}'
	            }
	        }
	    },

	    tooltip: {
	        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
	        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}</b> of total<br/>'
	    },

	    series: [
	        {
	            name: "Browsers",
	            colorByPoint: true,
	            data: Series
	        }
	    ]
	});


}





function TMPcargarGraficos(){

   



}





function showLoading() {
	esri.show(loading);		  
}


function hideLoading(error) {
	esri.hide(loading);
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
	alert("Ahora pex");

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





});

