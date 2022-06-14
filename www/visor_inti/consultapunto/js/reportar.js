require([
      "esri/request",
      'dojo/promise/all',
      'dojo/dom',
      "esri/geometry/Polyline",
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
	  'dojo/_base/array',
	  'dojox/data/CsvStore',
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
      'esri/tasks/ProjectParameters',
      'esri/SpatialReference',
      'esri/tasks/GeometryService',
      "esri/symbols/SimpleFillSymbol",
      "esri/symbols/SimpleLineSymbol", "dojo/domReady!"
], function(esriRequest,all,dom,Polyline,Point, projection, coordinateFormatter, PictureFillSymbol, webMercatorUtils, 
	PopupTemplate,StatisticDefinition,Graphic,SimpleRenderer,GraphicsLayer,QueryTask,Query,lang,arrayUtils,CsvStore,JSON,domConstruct, Color,
	SimpleMarkerSymbol,ClassBreaksRenderer,PictureMarkerSymbol, Geocoder, Popup, InfoTemplate, Legend, 
	ArcGISDynamicMapServiceLayer, Map,ProjectParameters,SpatialReference, GeometryService, SimpleFillSymbol, SimpleLineSymbol ) {
	 
	 var loading = dom.byId("loadingImg"); 	
   
	var LEYENDA;	
	var PointInc;
	var CODINCIDSAVE;
	var Tipo_Geometria;
	var PUNTO_SEND=null;
	var LISTAINTERESCTAREAS = "";
	
	var pointSymbol = new PictureFillSymbol({
	    "url":"img/icon_green.png",
	    "height":50,
	    "width":38,
	    "type":"esriPMS"
    });

    var gsvc = new GeometryService("https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/Utilities/Geometry/GeometryServer");			
    var paramsProject = new ProjectParameters();
	var sr_geografico = new SpatialReference(4326);
        
    var pointGraphics = new GraphicsLayer({
                id: 'drawGraphics_UsPoint',
                title: 'Draw Graphics'
            });	
        
	var pointRenderer = new SimpleRenderer(pointSymbol);
	pointRenderer.label = 'User drawn points';
	pointRenderer.description = 'User drawn points';
	pointGraphics.setRenderer(pointRenderer);

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
	
    var map = new Map("map", {
		basemap: "hybrid",
		center: [-75.10, -9.11], // long, lat
		zoom: 5,
		sliderStyle: "small"
		//,infoWindow: popup
    });



    map.addLayer(polylineGraphicsLimites);
    map.addLayer(pointGraphics);
	
	$('#btnGraficarIncid').on('click', function(event) {		 		
		graficarIncidencia();
	});

    $('#btnGrabarIncid').on('click', function(event) {		 		
		grabarIncidencia();
	});

	var clickMapa=false;

	$('#elemClickMapa').on('click', function(event) {
	    clickMapa=true;		 		
		
	});


	map.on("click", function(evt){
		if (clickMapa){
			clickMapa=false;
			//console.log("evt mapa:",evt.mapPoint);			
			let graphic = new Graphic(evt.mapPoint);

			showLoading(); 

			paramsProject.geometries = [evt.mapPoint];
		 	paramsProject.outSR      = sr_geografico;  				   
		 	gsvc.project(paramsProject, lang.hitch(this, function (geometries) {
		 		    pointGraphics.clear();
		 			console.log("proy geometries : ", geometries );

					let point = new Point( {"x": geometries[0].x, "y": geometries[0].y, "spatialReference": {"wkid": 4326 } });
					let graphic = new Graphic(point); 
					pointGraphics.add(graphic);	
                   	PUNTO_SEND = geometries[0].x + "," + geometries[0].y;
                   	hideLoading();

                   	executeQueryInteroeprables(graphic);


		     	
		 
			}), function (errPry) {
			    alert('Error en la proyeccion : ' + errPry.details); 
			    console.log("errPry.details ",errPry.details);
			}); 





			// pointGraphics.add(graphic);	
   //          PUNTO_SEND = evt.mapPoint.x + " , " + evt.mapPoint.y;
			//map.centerAt(evt.mapPoint,12);		
		}
	});	


	

	$('#btnCancelaNoti').on('click', function(event) {		 		
		$("#divGrabarInc").show();
		$("#divNotificar").hide();
		limpiarProcGuardarInc();
	});
   
  	$('#btnNotificaInc').on('click', function(event) {		 
		notificarIncidencia()		
	});

    $('#btnTabMapa').on('click', function(event) {		 
		openCity(event, 'tabMapa');		
	});

	$('#btnTabTeclado').on('click', function(event) {		 
		openCity(event, 'tabTecla');		
	});

	$('#btnTabCarga').on('click', function(event) {		 
		openCity(event, 'tabCarga');		
	});

	$('#cboTema').on('change', function() {		 
		switch (this.value) {				
			case "1": 
                $("#contDrivers").show();                    
			    break;			
			case "2":			    
                $("#contDrivers").hide();                    
			    break;			
			case "3":			    
                $("#contDrivers").hide();                    
			    break;
			case "4":			    
                $("#contDrivers").show();                    
			    break;
		}
	});

	$('#cboProyeccion').on('change', function() {		 
		switch (this.value) {				
			case "1": 
                $("#tdZona").hide();                    
			    break;			
			case "2":			    
                $("#tdZona").show();                    
			    break;				
		}
	});

	$('#uploadFormAdjunta').on('change', function(event) {
		//alert("cambio el archuvio");		
		let OptionArchivo = $("#cboTipoArchivo").val();

		if (OptionArchivo==="1"){
			//alert("Preparar carga de shape fiele");

			let fileName = event.target.value.toLowerCase();
            generateFeatureCollection(fileName, "uploadFormAdjunta", "esriGeometryPolygon");


		}else{
			handleCSV(event.target.files[0]);
		}
	});







	 
   getEntidades();
  
   //openCity(event, 'tabTecla');
	
   



	// map.on("load", function(evt){		
	// 	probandoProyection();
	// });	




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




	function executeQueryInteroeprables(punto){
		//alert("executeQueryInteroeprables");

		console.log("punto a consultar:", punto.geometry);
		//return;
		var QUERYS = [];											
		var queryLayers=[]; 

		var PromiseAnp = new Promise(function(resolve, reject) {

			var queryTask = new QueryTask("http://geoservicios.sernanp.gob.pe/arcgis/rest/services/representatividad/peru_sernanp_010201/MapServer/0");  
	        var query = new Query();                                     
	        query.returnGeometry = false;                                 
	        query.outFields = ["anp_cate,anp_nomb"] ;                                    
			query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
	        //query.geometry = this.graphicSaveCob.geometry;             
	        query.geometry = punto.geometry;

	        queryTask.execute(query, lang.hitch(this, function (results) {
	        	//console.log("results w675rg ZA",results.features);
				resolve(results.features);
			}),lang.hitch(this, function(err){ 
				alert( "ERR::->"+ err);
				resolve(null);            	              
			})
			); 

		});	




		var PromiseZa = new Promise(function(resolve, reject) {		

			var queryTask = new QueryTask("http://geoservicios.sernanp.gob.pe/arcgis/rest/services/gestion_de_anp/peru_sernanp_021401/MapServer/0");  
	        var query = new Query();                                     
	        query.returnGeometry = false;                                 
	        query.outFields = ["anp_codi,anp_nomb"] ;                                    
			query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
	        //query.geometry = this.graphicSaveCob.geometry;             
	        query.geometry = punto.geometry;

	        queryTask.execute(query, lang.hitch(this, function (results) {
	        	//console.log("results w675rg ANP",results.features);
				resolve(results.features);
			}),lang.hitch(this, function(err){ 
				alert( "ERR::->"+ err);
				resolve(null);            	              
			})
			); 

		});	



		QUERYS.push(PromiseAnp);
   		QUERYS.push(PromiseZa);
   

		Promise.all(QUERYS).then(values => {

			// console.log("values[0]", values[0].attributes);
			// console.log("values[1]", values[1]);
		 //    alert("all prmi") 	

		    $.each(values[0], function(x, valor) {
		    	LISTAINTERESCTAREAS+= "ANP : " +valor.attributes.anp_cate + " - " +   valor.attributes.anp_nomb  + " ,";
		    });	


		    $.each(values[1], function(x, valor) {
			    LISTAINTERESCTAREAS+= "ZA : " +valor.attributes.anp_codi + " - " +   valor.attributes.anp_nomb  + " ,";
		    });			
				  
	       // corrBval = values[0];  
		   // corrGval = values[1];  
		   // corrRval = values[2]; 
		   // corrNval = values[3];
		   // corrSWIR1val = values[4];	

		   //alert(LISTAINTERESCTAREAS);
	      
		   // calculateDeforestLoss();
		});


		
		
        
				


	}


	function querysintersectCallback_b (querylayers, responseArray){

		var intersectsANP= responseArray[0];
		var intersectsZA = responseArray[1];

		console("intersectsANP ->", intersectsANP);
		console("intersectsZA ->", intersectsZA);

	}	



	function	querysintersectError_b (err){
			alert('OCURRIO UNA EXCEPCION, INTENTELO NUEVAMENTE!');
			console.log( err);
	}	


	function grabarIncidencia(){

		let r = confirm("Desea reportar alerta?");
		if (r == false) {		  
		  return;
		} 


		if (!validarBefore()) return; //validacion


		showLoading();

		
		let Credencial= "abfw45412f";
		let Tema 	  = $("#cboTema").val() + "_" + $("#cboTema option:selected").text();
		let Driver    = $("#cboDriver").val() + "_" + $("#cboDriver option:selected").text(); 		
		let Comenta   = $("#txtDescripcion").val();		
	    let d = new Date($("#dtpFechaInc").val());
	    let mess= d.getMonth()+1
		let fechaafectacion= d.getDate() + "-" +  mess + "-" + d.getFullYear() ; 
		
		let Formulario = new FormData(document.forms[1]);
		Formulario.append("credencial",Credencial);
		Formulario.append("tema",Tema);
		Formulario.append("driver",Driver);
		Formulario.append("comenta",Comenta);
		Formulario.append("fecha",fechaafectacion);		
		Formulario.append("punto",PUNTO_SEND);	
		Formulario.append("listasuperpta",LISTAINTERESCTAREAS);	

		$.ajax({		
	        url: '../controller/alertarAfectacion.php',
	        type: 'POST',
	        data: Formulario,
	        async: true,
	        success: function (result) {
	        	
	        	let resultado =JSON.parse(result);

				resultado = resultado[0].result;
				if (resultado==1){

					let WithFile = JSON.parse(result)[0].WithFile;
					if (WithFile===1){

						let resulUploadMove = JSON.parse(result)[0].resulUploadMove
						if(resulUploadMove === "true"){
							alert("Registro Satisfactorio con archivo adjunto!");
						}else{
							alert("Se registro correctamente, pero el archivo no se pudo cargar");
						}

						clearCampo();

					}else{

						alert("REGISTRO SATISFACTORIO!");
						clearCampo();
					}

					//console.log("resultado pus:", JSON.parse(result));
					
				}else{
					alert("Intentalo Nuevamente");
					//console.log("resultado pus:", JSON.parse(result));
				}

				hideLoading();

	        	//console.log("result add accion ajax b", resultado);
	            //alert(result);
	        },
	        error:function(data){
	            alert("Exception");
	            hideLoading();
	        },
	        cache: false,
	        contentType: false,
	        processData: false
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



	function generateFeatureCollection(fileName, nombForm,tipoInfo){
        	
			//alert('ojj');
			
			
        	var name = fileName.split(".");
            //Chrome and IE add c:\fakepath to the value - we need to remove it
            //See this link for more info: http://davidwalsh.name/fakepath
            name = name[0].replace("c:\\fakepath\\", "");
			
            //dom.byId('upload-status').innerHTML = '<b>Loading… </b>' + name;
            //alert('Loading…'+name);
			
			var spatialRef=new SpatialReference({ wkid: 4326 });
            
            var params = {
                    'name': name,
                    //'targetSR': this.mapa.spatialReference,
					'targetSR':spatialRef,
                    'maxRecordCount': 1,
                    'enforceInputFileSizeLimit': true,
                    'enforceOutputJsonSizeLimit': true
                  };

            //var extent = scaleUtils.getExtentForScale(this.map, 40000);
            //var resolution = extent.getWidth() / this.map.width;
            params.generalize = false;
            //params.maxAllowableOffset = resolution;
			params.maxAllowableOffset = 10;
            params.reducePrecision = false;
            params.numberOfDigitsAfterDecimal = 0;
            
            var myContent = {
                    'filetype': 'shapefile',
                    'publishParameters': JSON.stringify(params),
                    'f': 'json',
                    'callback.html': 'textarea'
                  };
            
			var objForm= dom.byId(nombForm);
			//this.activarWaiting();
            //use the rest generate operation to generate a feature collection from the zipped shapefile
			
            esriRequest({
              url: 'http://www.arcgis.com/sharing/rest/content/features/generate',
              content: myContent,
              form: objForm,
			  //form: this.uploadFormPoint,
              handleAs: 'json',
              load: lang.hitch(this, function (response) {
            	 //alert('ohh');
				 console.log("SHAPE result:",response);
                 if (response.error) {
				  //this.desactivarWaiting();
                  errorHandler(response.error);
                  return;
                 }
				 
				
				let layerName=response.featureCollection.layers[0].layerDefinition.name;
				let tipoGeom =response.featureCollection.layers[0].featureSet.geometryType;
				let geometria=response.featureCollection.layers[0].featureSet.features[0].geometry.rings[0];
				let extent   =response.featureCollection.layers[0].layerDefinition.extent;

				if (tipoGeom==="esriGeometryPoint") {

					let point = new Point( {"x": arrCoords[0][0], "y": arrCoords[0][1], "spatialReference": {"wkid": 4326 } });
					let graphic = new Graphic(point); 
					pointGraphics.add(graphic);	
                    PUNTO_SEND= arrCoords[0][0] + "," + arrCoords[0][1];
					map.centerAndZoom(point,12);

					executeQueryInteroeprables(graphic);

			 	}else{

			 		let PolylineJson = {                     
				       	"paths":[geometria],
				      	"spatialReference":{"wkid":4326}
					};

					let _Polyline = new Polyline(PolylineJson);	
					graphic = new Graphic(_Polyline); 
		         	polylineGraphicsLimites.clear();
		         	pointGraphics.clear();
		         	polylineGraphicsLimites.add(graphic);

		         	let extent = _Polyline.getExtent().expand(1.5);
		         	let center = _Polyline.getExtent().getCenter();
         			PUNTO_SEND= center.x + "," + center.y;
		         	map.setExtent(extent); 

		         	let pointx = new Point( {"x": center.x, "y": center.y, "spatialReference": {"wkid": 4326 } });
					let graphicx = new Graphic(pointx); 
		         	executeQueryInteroeprables(graphicx);	

			 	}

				 
              }),
              error: lang.hitch(this, errorHandler)
            });
            
            
        	
    }


     function errorHandler(error) {
           
            //alert( "Exception ocurred, continue");
			console.log("Exception en errorHandler::"+error);
			//this.desactivarWaiting();
      }	




	function probandoProyection(){

			

        //let Elemento = new Point(220823, 8758017, new SpatialReference({ wkid: 32717 }));

        let JsonPolyline = {
		    "paths":[[[220823 , 8758017], [382472 , 8613067],[187570 , 8606856],[220823 , 8758017]]],
		    "spatialReference":{"wkid":32719}
	  	};
		let polyline = new Polyline(JsonPolyline);

		let Elemento = polyline;

 		paramsProject.geometries = [Elemento];
	 	paramsProject.outSR      = sr_geografico;  				   
	 	gsvc.project(paramsProject, lang.hitch(this, function (geometries) {
	 		console.log("proy geometries  intro: ", geometries );

		}), function (errPry) {
		    alert('Error en la proyeccion : ' + errPry.details); 
		});

	}


	function handleCSV(file) {
            
		    //console.log("Processing CSV: ", file, ", ", file.name, ", ", file.type, ", ", file.size);					
            var reader = new FileReader();
								
  			reader.onload = function(resultado) {
          	             // alert('En handleCSV 2');
  						processCSVData(resultado.target.result);				
      	        	
            };										
  		
            reader.readAsText(file);
    }



    function processCSVData (data) {
			
        //console.log("datazzzzzzzzzz :" ,  data)		
        
        var newLineIndex = data.indexOf("\n");
        var firstLine = lang.trim(data.substr(0, newLineIndex)); //remove extra whitespace, not sure if I need to do this since I threw out space delimiters
        var separator = getSeparator(firstLine);
        console.log("separad9or :",separator );
        var csvStore = new CsvStore({
           	data: data,
           	separator: separator
        });	  	  	 
        var latFieldStrings  = ["lat", "latitude","latitud", "y", "ycenter"];
        var longFieldStrings = ["lon", "long", "longitude", "longitud", "x", "xcenter"];	  	  
        var data_coordenadas = []; 
	    var isUTM=false;
		
        
        csvStore.fetch({

         	onComplete: lang.hitch(this,function(items) {
								 
				var latField, longField;
				var fieldNames = csvStore.getAttributes(items[0]);

				//console.log("fieldNames ---- : " , fieldNames);

				arrayUtils.forEach(fieldNames, function (fieldName) {
				 
					var matchId;
					matchId = arrayUtils.indexOf(latFieldStrings,
					fieldName.toLowerCase());
					if (matchId !== -1) {
				 		latField = fieldName;
					}

					matchId = arrayUtils.indexOf( longFieldStrings , fieldName.toLowerCase() );
					if (matchId !== -1) {
				 		longField = fieldName;
					}
				});

				//Add records in this CSV store as graphics
				arrayUtils.forEach(items, function (item) {

					var attrs = csvStore.getAttributes(item),
					attributes = {};

					// Read all the attributes for  this record/item
					arrayUtils.forEach(attrs, function (attr) {
					 	var value = Number(csvStore.getValue(item, attr));					 
					 	attributes[attr] = isNaN(value) ? csvStore.getValue(item, attr) : value;
					});                

					//console.log("attributes ZZZZZZ - : ",attributes);

					var latitude  = Number(attributes[latField]);
					var longitude = Number(attributes[longField]);

					if(latitude>10 && longitude>10){					 
					 	isUTM=true;
					}						     

					if (isNaN(latitude) || isNaN(longitude)) {
					 	return;
					}						     

					data_coordenadas.push({x:latitude, y:longitude});

				});

				//alert('final dxes');

				preparafetaureDrop(data_coordenadas);		               
	  
        	}),

       	 	onError:lang.hitch(this,function(error) {
            	console.error("Error fetching items from CSV store: ", error);
        	})
		
       	});
	   
	       
      
	}




	function preparafetaureDrop (datos){
	 		  		    
		var tipo= getTipoEntidad(datos)
		loadPoligonoCsv(datos,tipo);	

		   		   
    }	
	    
    function loadPoligonoCsv(datos, tipogeom){

    	//alert("loadPoligonoCsv");
    	Tipo_Geometria=tipogeom;

    	let OptionArchivo = $("#cboTipoArchivo").val();

		     
		let arrCoordsWgeo=[];	
		let arrCoords=[];			   
		for (x=0;x<=datos.length-1; x++){				   
				 arrCoords.push([datos[x].y , datos[x].x]);
				 arrCoordsWgeo.push([datos[x].x , datos[x].y]);
		}

		console.log("arrCoords", arrCoords);

		 
		if (OptionArchivo==="2") { //csv wgs geo
		 	
				 	if (tipogeom==="punto") {

						let point = new Point( {"x": arrCoords[0][1], "y": arrCoords[0][0], "spatialReference": {"wkid": 4326 } });
						let graphic = new Graphic(point); 
						pointGraphics.add(graphic);	
 						PUNTO_SEND = arrCoords[0][1] + ","  + arrCoords[0][0];
						map.centerAndZoom(point,12);
						executeQueryInteroeprables(graphic);

				 	}else{

				 		let PolylineJson = {                     
				       	"paths":[arrCoordsWgeo],
				      	"spatialReference":{"wkid":4326}
						};

						let _Polyline = new Polyline(PolylineJson);	
						graphic = new Graphic(_Polyline); 
			         	polylineGraphicsLimites.clear();
			         	pointGraphics.clear();
			         	polylineGraphicsLimites.add(graphic);

			         	let extent = _Polyline.getExtent().expand(1.5);
	         			let center = _Polyline.getExtent().getCenter();
	         			PUNTO_SEND= center.x + "," + center.y;
			         	map.setExtent(extent); 

			         	let pointx = new Point( {"x": center.x , "y": center.y , "spatialReference": {"wkid": 4326 } });
						let graphicx = new Graphic(pointx); 
			         	executeQueryInteroeprables(graphicx);	

				 	}


		}else if (OptionArchivo==="3" || OptionArchivo==="4" || OptionArchivo==="5"){

					//alert("Hacer una reproyección");
					let Zona;	
					switch (OptionArchivo) {				
						case "3": 
			                Zona = 32717;
						    break;				
						case "4":
						    Zona = 32718;	                
						    break;				
						case "5":
						    Zona = 32719;	                
						    break;
					}

		 			let Elemento;

					if (tipogeom==="punto") {				
						Elemento = new Point(Number(arrCoords[0][0]) , Number(arrCoords[0][1]), new SpatialReference({ wkid: Zona }));	
								
				 	}else{

				 		let PolylineJson = {                     
				       	"paths":[arrCoords],
				      	"spatialReference":{"wkid":Zona}
						};
						Elemento = new Polyline(PolylineJson);				
				 	}

				 	console.log("Elemento:", Elemento);			 
								     		 	 
				 	paramsProject.geometries = [Elemento];
				 	paramsProject.outSR      = sr_geografico;  				   
				 	gsvc.project(paramsProject, lang.hitch(this, function (geometries) {
				 		console.log("proy geometries : ", geometries );

				 		if ( Tipo_Geometria==="punto" ){
				 			
							let point = new Point( {"x": geometries[0].x, "y": geometries[0].y, "spatialReference": {"wkid": 4326 } });
							let graphic = new Graphic(point); 
							pointGraphics.add(graphic);	
							PUNTO_SEND = geometries[0].x + ","  + geometries[0].y;
							map.centerAndZoom(point,12);

							
				         	executeQueryInteroeprables(graphic);	

				 		}else{

				 			

					 		let PolylineJson = {                     
					       	"paths":[geometries[0].paths[0]],
					      	"spatialReference":{"wkid":4326}
							};

							let _Polyline = new Polyline(PolylineJson);	
							graphic = new Graphic(_Polyline); 
				         	polylineGraphicsLimites.clear();
				         	pointGraphics.clear();
				         	polylineGraphicsLimites.add(graphic);

				         	var extent = _Polyline.getExtent().expand(1.5);
				         	let center = _Polyline.getExtent().getCenter();
	         				PUNTO_SEND= center.x + "," + center.y;
				         	map.setExtent(extent); 

				         	let pointc = new Point( {"x": center.x , "y": center.y , "spatialReference": {"wkid": 4326 } });
							let graphicc = new Graphic(pointc); 
				         	executeQueryInteroeprables(graphicc);		

					 	}


						 
				     	
				 
					}), function (errPry) {
					    alert('Error en la proyeccion : ' + errPry.details); 
					});
			 						                         
		}



		/*----------------------------------------------------------------------*/

		// let Elemento = new Point(220823, 8758017, new SpatialReference({ wkid: 32717 }));

		// let JsonPolyline = {
		//     "paths":[[[220823 , 8758017], [382472 , 8613067],[187570 , 8606856],[220823 , 8758017]]],
		//     "spatialReference":{"wkid":32719}
	 //  	};
		// let polyline = new Polyline(JsonPolyline);

		// let Elemento = polyline;

 	// 	paramsProject.geometries = [Elemento];
	 // 	paramsProject.outSR      = sr_geografico;  				   
	 // 	gsvc.project(paramsProject, lang.hitch(this, function (geometries) {
	 // 		console.log("proy geometries  intro: ", geometries );

		// }), function (errPry) {
		//     alert('Error en la proyeccion : ' + errPry.details); 
		// });
		
    }
	    
    function  getTipoEntidad (datos){
		 
     	var tipo="";
		 
 		if(datos.length==1){ //1 ES PUNTO			   
		   
	     	tipo="punto";			     			   
		   
 		}else{ //PUEDE SER POLIGONO O LINEA
  			   			   			    			   
     		if(datos.length>=4){  //posiblemente sea poligono				    					
		   			          
				var ptIni_x=datos[0].x;
				var ptIni_y=datos[0].y;

				var ptFin_x=datos[datos.length-1].x;
				var ptFin_y=datos[datos.length-1].y;		   
		         
			 	if(ptIni_x==ptFin_x && ptIni_y==ptFin_y){						 
		         	tipo="polygon";				   
	         	}else{						  
		         	tipo="linea";
         		}
		 
			  	   
	 		}else{ // pasa como linea
			
			 	tipo="linea";
		 	}
						   
	     }
		 return tipo;
	}



	function getSeparator (string){
			  
		var separators = [",", "      ", ";", "|"];
		var maxSeparatorLength = 0;
		var maxSeparatorValue = "";
		arrayUtils.forEach(separators, function (separator) {
			var length = string.split(separator).length;
			if (length > maxSeparatorLength) {
			    maxSeparatorLength = length;
			    maxSeparatorValue = separator;
			}
		});
		return maxSeparatorValue;
		  	  	  
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


	function listarEntidades(datos){
		//alert("listando");

        StrHtmBody="";
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

		// let Credencial = "abfw45412f";
		// let objJson ={"credencial":Credencial};  
		// let txtJson=JSON.stringify(objJson);			
		// let param={datos : txtJson };	
		// let h=new Date();  
	 //    $.post("../controller/listaEntidades.php?"+h, param,function(result) { 
		             
		// 		//console.log("result  lista entodades!  : ", result); 
		// 		//return;	

		// 		let resultado = result[0].result;

		// 		if (resultado==1){

		// 			//listar cheks
		// 			//alert("listar entodades en html");
		// 			listarEntidades(result[0].datos);


				  
		// 		}else{
		// 		  alert("Intentalo nuevamente!");	
		// 		  console.log(result);					  
		// 		}
					
				
	 //    },"json")
		// .done(function(){       
	 //    })
	 //    .fail(function(er){
	 //       //alert("Exception::  " );	 
	 //       console.log("ERROR :  ::: ",er);	   
	 //    })
	 //    .always(function(){       
	 //    });

	}

	function notificarIncidencia(){


        let r = confirm("CONFIRME NOTIFICACION!");
		if (r == false) {
            return;
		}



		var checkedVals = $('.filled-in:checkbox:checked').map(function() {
		    return this.value;
		}).get();
		

        let StrIds = checkedVals.join("@");
        let Descrip= $("#txtDescripcionNotifica").val();

        let Credencial = "abfw45412f";
		let objJson ={"credencial":Credencial, "idincid":CODINCIDSAVE ,  "idsentidad":StrIds  , "descrip":Descrip};  
		let txtJson=JSON.stringify(objJson);			
		let param={datos : txtJson };	
		let h=new Date();  
	    $.post("../controller/guardarNotificacion.php?"+h, param,function(result) { 
		             
				console.log("result  NOTIFICAR!  : ", result); 
				//return;	

				let resultado = result[0].Resultado[0].result;

				if (resultado==1){

					alert("NOTIFICACION SATISFACTORIA!");
					$("#divGrabarInc").show();
		            $("#divNotificar").hide();
					limpiarProcGuardarInc();

				    
				    
				}else{
				  alert("Intentalo nuevamente!");	
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

	function limpiarProcGuardarInc(){
		$("#txtDescripcion").val("");
		$("#txtLat").val("");
		$("#txtLon").val("");
		map.graphics.clear();

		

		let point = new Point( {"x": "-75.10", "y": "-9.11", "spatialReference": {"wkid": 4326 } });
		map.centerAndZoom(point,5);
	}

	

	function validarBefore(){

		let Tema   = $("#cboTema").val(); 
		let Driver = $("#cboDriver").val(); 		
		let Comenta= $("#txtDescripcion").val();
	    let Fecha  = $("#dtpFechaInc").val();

	    if (PUNTO_SEND===null){
	    	alert("Debe ubicarse en el mapa");
	    	return false;
	    }

	    if (Tema==="0"){
	    	alert("Selecciona un tema");
	    	return false;
	    }else if (Tema=="1" || Tema=="4"){
	    	if(Driver==="0"){
	    		alert("Debes seleccionar un driver ");
	    		return false;
	    	}
	    }

	    if($.trim(Comenta)===""){
	    	alert("Debe relizar un comentario");
	    	return false;
	    }

	    if(Fecha===""){
	    	alert("Ingrese una fecha");
	    	return false;
	    }


	    return true;




	}

	


	function clearCampo(){



			
		$("#txtDescripcion").val("");
	    $("#dtpFechaInc").val("");
	    PUNTO_SEND=null;

	    LISTAINTERESCTAREAS="";



	}





	function graficarIncidencia(){

		let Cbo = $("#cboProyeccion").val();
		let Lat = $("#txtLat").val();
		let Lon = $("#txtLon").val();
		let cboZona = $("#cboZona").val();

		if (Cbo==="1"){

			let Lat = $("#txtLat").val();
			let Lon = $("#txtLon").val();

			PUNTO_SEND = Lat +  ","  + Lon ;

	        drawPointIncidencia(Lat, Lon);


	        let pointc = new Point( {"x": Lat, "y": Lon , "spatialReference": {"wkid": 4326 } });
			let graphicc = new Graphic(pointc); 
         	executeQueryInteroeprables(graphicc);	

		}else{

			//alert("reptoycetar");

			Elemento = new Point(Number(Lat) , Number(Lon), new SpatialReference({ wkid: Number(cboZona) }));	

			paramsProject.geometries = [Elemento];
		 	paramsProject.outSR      = sr_geografico;  				   
		 	gsvc.project(paramsProject, lang.hitch(this, function (geometries) {
		 		console.log("proy geometries : ", geometries );

		 		let point = new Point( {"x": geometries[0].x, "y": geometries[0].y, "spatialReference": {"wkid": 4326 } });
				let graphic = new Graphic(point); 
				pointGraphics.add(graphic);	

				map.centerAndZoom(point,12);

				PUNTO_SEND = geometries[0].x +  ","  + geometries[0].y ;


				
	         	executeQueryInteroeprables(graphic);	


				 
		     	
		 
			}), function (errPry) {
			    alert('Error en la proyeccion : ' + errPry.details); 
			});

		}

		


	}

	function drawPointIncidencia(lat, lon){
        
		let point = new Point( {"x": lat, "y": lon, "spatialReference": {"wkid": 4326 } });	
		PointInc = point;
		map.centerAndZoom(point,17);

		let symbol =  new PictureMarkerSymbol({
		    "url":"img/icon_red2.png",
		    "height":60,
		    "width":60,
		    "type":"esriPMS"
		  });

	    let graphic = new Graphic(point, symbol);
        map.graphics.add(graphic);


        

	}






	
	
});

