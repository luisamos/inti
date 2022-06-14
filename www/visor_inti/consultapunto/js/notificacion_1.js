	
require([
      "esri/request",
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
], function(esriRequest,Point, projection, coordinateFormatter, PictureFillSymbol, webMercatorUtils, 
	PopupTemplate,StatisticDefinition,Graphic,SimpleRenderer,GraphicsLayer,QueryTask,Query,lang,JSON,domConstruct, Color,
	SimpleMarkerSymbol,ClassBreaksRenderer,PictureMarkerSymbol, Geocoder, Popup, InfoTemplate, Legend, 
	ArcGISDynamicMapServiceLayer, Map, SimpleFillSymbol, SimpleLineSymbol ) {
	 
   
	var LEYENDA;	
	var PointInc;
	var CODINCIDSAVE;
	
	var pointSymbol = new PictureFillSymbol({
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
	
	
	
    var map = new Map("map", {
		basemap: "hybrid",
		center: [-75.10, -9.11], // long, lat
		zoom: 5,
		sliderStyle: "small"
		//,infoWindow: popup
    });
	
	$('#btnGraficarIncid').on('click', function(event) {		 
		
		graficarIncidencia();
	});


    $('#btnGrabarIncid').on('click', function(event) {		 
		
		grabarIncidencia();
	});


	 $('#btnCancelaNoti').on('click', function(event) {		 
		
		$("#divGrabarInc").show();
		$("#divNotificar").hide();
		limpiarProcGuardarInc();
	});
   

   $('#btnNotificaInc').on('click', function(event) {		 
		notificarIncidencia()
		
	});

   

	 
   getEntidades();
	
    
	

	
	/********************************************
	*********************************************
	******************FUNCIONES****************** 
	*********************************************
	********************************************/


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
					listarEntidades(result[0].datos);


				  
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

	function validarDatos(){

		// let FechaInc = $('#dtpFechaInc').val();
		// let latitu 

	}

	function grabarIncidencia(){

		let r = confirm("Desea grabar la incidencia?");
		if (r == false) {		  
		  return;
		} 

		let FechaInc = $('#dtpFechaInc').val();
		let Latitud = PointInc.x;
		let longitud =PointInc.y;
		let Tema = $("#cboTema").val();
		let Descrip = $("#txtDescripcion").val();

		console.log("FechaInc", FechaInc);
		console.log("PointInc", PointInc.x);
		console.log("PointInc", PointInc.y);
		console.log("Tema", Tema);
		console.log("Descrip", Descrip);


		//return;


		let Credencial = "abfw45412f";
		let objJson ={"credencial":Credencial, "descrip":Descrip , "codtema":Tema , "fechainci":FechaInc  , "lat":Latitud , "lon":longitud};  	
		let txtJson=JSON.stringify(objJson);			
		let param={datos : txtJson };	
		let h=new Date();  
	    $.post("../controller/guardarIncidencia.php?"+h, param,function(result) { 
		             
				console.log("result  guardar inciednecia  : ", result);	

				let resultado = result[0].result;

				if (resultado==1){

					alert("Se guardo satisfactoriamente!");
				    
				    let r = confirm("Desea notificar a usuarios sobre esta nueva incidencia?");
					if (r == true) {

					  CODINCIDSAVE=result[0].datos


					  $("#divGrabarInc").hide();
					  $("#divNotificar").show();

					  $("#lblNotiIdInc").html(result[0].datos);
					  $("#lblNotiDescInc").html(Descrip);



					}else{



					}
				  
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





	function graficarIncidencia(){

		let Lat = $("#txtLat").val();
		let Lon = $("#txtLon").val();

        drawPointIncidencia(Lat, Lon);


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

