	
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
	  
	var LEYENDA;
	var graphicSaveCob;
	var loading = dom.byId("loadingImg"); 	
	var ListaIncidenciasActual;
	var CODINCIDSAVE;

	var key;
	var url_string = window.location.href;
    var url  = new URL(url_string);
 //    user = url.searchParams.get("user");
	// sid  = url.searchParams.get("sid");
	key  = url.searchParams.get("key");
	


    var polylineSymbol   = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 4);	
    
    var polylineRenderer = new SimpleRenderer(polylineSymbol);
    polylineRenderer.label = '';
	polylineRenderer.description = '';

    var polylineGraphicsLimites = new GraphicsLayer({
    	id: 'polyLimitesPolit',
    	title: 'Limites Politicos'
    });
    
	polylineGraphicsLimites.setRenderer(polylineRenderer);

	
    
    // var pointSymbol = new PictureFillSymbol({
	   //  "url":"img/icon_green.png",
	   //  "height":50,
	   //  "width":38,
	   //  "type":"esriPMS"
    // });

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


    var pointRenderer = new SimpleRenderer(pointSymbol);
	pointRenderer.label = 'User drawn points';
	pointRenderer.description = 'User drawn points';

    var pointGraphics = new GraphicsLayer({
                id: 'drawGraphics_UsPoint',
                title: 'Draw Graphics'
    });	
    
	pointGraphics.setRenderer(pointRenderer);




	var featureLayerIncidencias = new FeatureLayer("http://geoservidorperu.minam.gob.pe/arcgis/rest/services/geobosque/reporte_deforestacion/FeatureServer/0", {
                mode: FeatureLayer.MODE_ONDEMAND,
             outFields: ["*"]
    });


    // featureLayerIncidencias.on("edits-complete", lang.hitch(this,function(result) {
                			
            	
    //             console.log(result);
				// var featureAdd=result.adds[0];            					          								
				
				// if (result.adds.length >=1 ){
				// 	if (featureAdd.success){    
					
				// 	     alert("se grabo");						 
						 
    //         	    }else{
				// 		alert('Ha ocurrido una excepcion, intentalo nuevamente');
				// 	}   
				// }
            	        	
    // }));


     featureLayerIncidencias.on("edits-complete", lang.hitch(this,function(result) {
                			
            	alert("grabo feture");
                console.log(result);
				var featureAdd=result.adds[0];            					          								
				
				// if (result.adds.length >=1 ){
				// 	if (featureAdd.success){    
					
				// 	     alert("se grabo");						 
						 
    //         	    }else{
				// 		alert('Ha ocurrido una excepcion, intentalo nuevamente');
				// 	}   
				// }
            	        	
    }));





     //-------28022020

	
	
	
    var map = new Map("map", {
		basemap: "hybrid",
		center: [-75.10, -9.11], // long, lat
		zoom: 5,
		sliderStyle: "small"
		//,infoWindow: popup
    });




    	map.addLayer(polylineGraphicsLimites);	
    	map.addLayer(pointGraphics);


    $('#btnRegresarTabla').on('click', function(event) {		 
		
		$("#divMapa").hide();
		$("#divTabla").show();
	});


	 $('#btnNotificaInc').on('click', function(event) {	

		notificarIncidencia()
		
	});


	 $('#btnCancelaNoti').on('click', function(event) {		 
		$("#divMapa").hide();
		$("#divNotificar").hide();
		$("#divTabla").show();
		
	});



	 $('#btnDownExcel').on('click', function(event) {		 
		
		exportTableToExcel("tblGrilla");
	});


	$('#btnBusqueda').on('click', function(event) {		 
		
		buscarDatos();
	});




	 $('#txtCodReporte').keypress(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){
			alert("Buscar!");
			buscarByCodRepor(this.value);
		}
	});



	
    getAllIncidencias();
    getEntidades()

    //grabarIncidencia();
    //loadGrafico();
	


$('#btnLogout').on('click', function(event) {		 
		
		logOut();
	});
	
/********************************************
*********************************************
******************FUNCIONES****************** 
*********************************************
********************************************/



function openViewDeforest(obj){
	   	
    	let idContenedor = obj.srcElement.id;
		let objsplit     = idContenedor.split("@");
		
		let Id = objsplit[1];
		let codTema = objsplit[2];
		console.log("id Tx_CodigoLlave:", Id);

		switch (codTema) {	
			case "1":
			    window.open("../tala.html?idRptBus="+Id ,"_blank");
			    break;
			case "2":
			    window.open("../tala.html?idRptBus="+Id ,"_blank");              
			    break;			
			case "3": 
				window.open("../ecosistemas.html?idRptBus="+Id ,"_blank");                
			    break;				
			case "4":
				window.open("../incendios.html?idRptBus="+Id ,"_blank");			    	                
			    break;				
						
		}

		


		
}



function getRptDefo(obj){
	   	
    	let idContenedor = obj.srcElement.id;
		let objsplit     = idContenedor.split("@");
		
		let Id = objsplit[1];
		console.log("id Tx_CodigoLlave:", Id);

		// $.ajax({
		//     url:"archivos/Tala_Deforestacion/"+Id+".pdf",    
		//     type:'HEAD',
		//     error: function()
		//     {
		//     	alert("No existen archivos reporte");
		//     },
		//     success: function()
		//     {
		//     	window.open("archivos/Tala_Deforestacion/"+Id+".pdf","_blank");
		//     }
		// });	 

		/*/*/

		var objJson = {"id":Id , "key":"dsfsdf87ys8fgasfh"};  	
		var txtJson=JSON.stringify(objJson);			
		var param={datos : txtJson };	
		var h=new Date();  
		
		$.post("../controller/getNombFileReporte.php?"+h, param,function(result) { 
					 	
					 console.log("getNombFileReporte ->",result);
					 if (result[0].datos.length>=1){
					 	let Carpeta = result[0].datos[0].Tx_Carpeta;
					 	let Ruta = result[0].datos[0].Tx_Ruta;
					 	window.open("../"+Carpeta+"/"+Ruta ,"_blank");

					 }else{
					 	alert("No existen archivos reporte");
					 }

					 
				
		},"json")
		.done(function(){       
		})
		.fail(function(er){
		   console.log("ERROR :  eroo ::: ",er);	
		   alert("fail");   
		})
		.always(function(){       
		});  
}




function logOut(){


	window.open("../gestionmonitoreo/index.html","_top");

	
}



function buscarDatos (){

	    //alert("buscar");
	    let Departamento = $("#dr-departamento").val(); 
	    let Entidad = $("#dr-entidad").val(); 
	    let Tema  = $("#dr-tema").val(); 
	    let Estado = $("#dr-estado").val(); 
	     let CodRepor = $("#txtCodReporte").val(); 

	    
	    let fechaOne= null 
	    
	    if ($("#fechaOne").val()!==""){
	    	let f1 = new Date($("#fechaOne").val());
	    	fechaOne = f1.getDate()+"-"+ (f1.getMonth()+1) + "-" + f1.getFullYear();
	    }
	    

	    
	    let fechaSecond = null;
	     if ($("#fechaSecond").val()!==""){
	     	let f2 = new Date($("#fechaSecond").val());
	    	fechaSecond = f2.getDate()+"-"+ (f2.getMonth()+1) + "-" + f2.getFullYear(); 
	    }
	     

	    let Credencial = key;
		let objJson ={"CodRepor": CodRepor,"credencial":Credencial, "Departamento":Departamento ,  "Entidad":Entidad  , "Tema":Tema, "Estado":Estado, "fechaOne":fechaOne, "fechaSecond":fechaSecond};  
		let txtJson=JSON.stringify(objJson);			
		let param={datos : txtJson };	
		let h=new Date();
		//debugger; 
		console.log("Bef buscar",objJson); 
	    $.post("../controller/buscarInformacionAfectaciones.php?"+h, param,function(result) { 
		             
				  console.log("result  Lista buscarInformacionAfectaciones  : ", result);
				  //debugger;		             	            
				 let resultado = result[0].result;
				 //alert(resultado);
				 if (resultado==1){					 
					  //x + "@" + valor.i_codopera + "@" +  valor.i_codnivel + "@" + valor.v_coddep + "@" + valor.v_codpro + "@" + valor.v_coddis;
					  //let idContenedor = obj.srcElement.id;
					  //console.log();
					  let Datos = result[0].datos;
					  
					  if (Datos.length==0){						   
							   alert("No se encontraron datos");
							   $("#tbodyTable").html("");
							   // $("#pannel_001").html("");
							   // $("#iconLoadFindAdv").hide();						   
					  }else{
					       //debugger;						  
							  tabularResultsIndicencias(Datos);						      
					  }
					  //console.log("###$$$$sssssssssss -> ",ResultadoBusquedaUltim.length);
				      
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




function buscarByCodRepor(value){

	let QUERYSW  = [];

	let PromiseIncendios = new Promise(function(resolve, reject) {

		let statisticDefinition4 = new StatisticDefinition();
		statisticDefinition4.statisticType = "count";
		statisticDefinition4.onStatisticField = "OBJECTID";
		statisticDefinition4.outStatisticFieldName = "TOTALPOLYSINCEND";
		let queryTask4 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Incendios/MapServer/3"); //2 Alerta de Incendio Forestal ultimas24
		let query4 = new Query();                         
		query4.groupByFieldsForStatistics = ["CODREP,NOMDEP,NOMPRO,NOMDIS,FECHA"];
		query4.where =  "CODREP ='"+value+"'";  		
		query4.num = 100; 		
		query4.orderByFields = ["FECHA"]
		query4.outStatistics = [statisticDefinition4];        
		queryTask4.execute(query4, lang.hitch(this, function (results) {			
		    resolve(results);
		}),lang.hitch(this, function(err){ 
		    alert( "Intentalo nuevamente! :::: -> "+ err);  
		    resolve(null);          	              
		})
		); 		
					        					 
	});

	let PromiseEcosis = new Promise(function(resolve, reject) {

		let statisticDefinition3 = new StatisticDefinition();
		statisticDefinition3.statisticType = "count";
		statisticDefinition3.onStatisticField = "OBJECTID";
		statisticDefinition3.outStatisticFieldName = "TOTALPOLYSECOSIS";
		let queryTask3 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Afectacion_EF/MapServer/0"); //2 Alerta de Incendio Forestal ultimas24
		let query3 = new Query();                         
		query3.groupByFieldsForStatistics = ["REPOR,NOMDEP,NOMPRO,NOMDIS,FECSAI"];
		query3.where =  "REPOR='"+value+"'";    		
		query3.num = 100; 		
		query3.orderByFields = ["FECSAI"]
		query3.outStatistics = [statisticDefinition3];        
		queryTask3.execute(query3, lang.hitch(this, function (results) {
			resolve(results);
		}),lang.hitch(this, function(err){ 
		    alert( "Intente nuevamente::->"+ err);
            resolve(null);
		})
		); 	
					        					 
	});


	let PromiseTala = new Promise(function(resolve, reject) {

		let statisticDefinition2 = new StatisticDefinition();
		statisticDefinition2.statisticType = "count";
		statisticDefinition2.onStatisticField = "OBJECTID";
		statisticDefinition2.outStatisticFieldName = "TOTALPOLYSTALA";
		let queryTask22 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Deforestacion_Tala/MapServer/0"); //2 Alerta de Incendio Forestal ultimas24
		let query22 = new Query();                         
		query22.groupByFieldsForStatistics = ["REPOR,NOMDEP,NOMPRO,NOMDIS,FESATA"];
		query22.where =  "REPOR='"+value+"'";   		
		query22.num = 100; 		
		query22.orderByFields = ["FESATA"]
		query22.outStatistics = [statisticDefinition2];        
		queryTask22.execute(query22, lang.hitch(this, function (results) {
			resolve(results);
		}),lang.hitch(this, function(err){ 
			alert( "ERR::->"+ err);
			resolve(null);            	              
		})
		); 
							        					 
	});


	let PromiseDefo = new Promise(function(resolve, reject) {

		let statisticDefinition = new StatisticDefinition();
		statisticDefinition.statisticType = "count";
		statisticDefinition.onStatisticField = "OBJECTID";
		statisticDefinition.outStatisticFieldName = "TOTALPOLYSDEFO";
		let queryTask = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Deforestacion_Tala/MapServer/1"); //2 Alerta de Incendio Forestal ultimas24
		let query = new Query();                         
		query.groupByFieldsForStatistics = ["REPOR,NOMDEP,NOMPRO,NOMDIS,FESATA"];		
		query.where =  "REPOR ='"+value+"'";   	
		query.num = 100; 		
		query.orderByFields = ["FESATA"]
		query.outStatistics = [statisticDefinition];        
		queryTask.execute(query, lang.hitch(this, function (results) {
        	resolve(results);
		}),lang.hitch(this, function(err){ 
			alert( "ERR::->"+ err);
			resolve(null);            	              
		})
		);
							        					 
	});


	QUERYSW.push(PromiseIncendios);
    QUERYSW.push(PromiseEcosis);
    QUERYSW.push(PromiseTala);
    QUERYSW.push(PromiseDefo);


	Promise.all(QUERYSW).then(values => {
	    alert("all prmi") 	
	    console.log("values:", values);			
			  
     	//corrBval = values[0];  
	   	// corrGval = values[1];  
	   	// corrRval = values[2]; 
	   	// corrNval = values[3];
	   	// corrSWIR1val = values[4];	
      
	   	// calculateDeforestLoss();
	});




}

function busquedaController(disparo, valor){

	// Whr1 = "CODREP is not null  and CODREP<>'' and ESTADO='Alertado' and CATDEP='"+value+"'"; 
	// Whr2 = "ESTADO=1 and  NOMDEP='"+value+"'"; 
	// Whr3 = "REPOR is not null and ESTADO=1 and NOMDEP='"+value+"'"; 
	// Whr4Incend = "REPOR is not null and ESTADO=1 and NOMDEP='"+value+"'";

	let Whr1Defo=null; 
	let Whr2Tala=null;
	let Whr3Ecosis=null;
    let Whr4Incend=null;

    let Whr1Defo_Append=""; 
	let Whr2Tala_Append="";
	let Whr3Ecosis_Append="";
    let Whr4Incend_Append="";

    let Departamento = $("#dr-departamento").val(); // * * *
    let Entidad      = $("#dr-entidad").val();
    let Tema         = $("#dr-tema ").val();
    let Estado       = $("#dr-estado").val();


    if (disparo==="depa"){

    	if(Tema==="0"){
    		//TODAS LAS CAPAS
    		
    		if(Estado==="0"){//todos los estados(sin filtro)

    			Whr1Defo   = " REPOR is not null and NOMDEP='"+Departamento+"' ";							
				Whr2Tala   = " REPOR is not null and NOMDEP='"+Departamento+"' ";									
				Whr3Ecosis = " REPOR is not null and NOMDEP='"+Departamento+"' ";	
				Whr4Incend = " CODREP is not null  and CODREP<>'' and CATDEP='"+Departamento+"' ";
    			
    		}else{ //se filtra por estado(menos incendios, no calza el nombre de campo)

    			Whr1Defo   = " REPOR is not null and NOMDEP='"+Departamento+"' and ESTADO='"+Estado+"' ";							
				Whr2Tala   = " REPOR is not null and NOMDEP='"+Departamento+"' and ESTADO='"+Estado+"' ";									
				Whr3Ecosis = " REPOR is not null and NOMDEP='"+Departamento+"' and ESTADO='"+Estado+"' ";
				Whr4Incend = " CODREP is not null  and CODREP<>'' and CATDEP='"+Departamento+"' ";

    		}			
    		
    	}else{
    		//ALGUNA CAPA

    		if(Estado==="0"){//todos los estados(sin filtro)

    			switch(idtema) {
					case "1":
						Whr1Defo   = "REPOR is not null and NOMDEP='"+Departamento+"'";
						break;
					case "2":
						Whr2Tala   = "REPOR is not null and NOMDEP='"+Departamento+"'";
						break;
					case "3":
						Whr3Ecosis = "REPOR is not null and NOMDEP='"+Departamento+"'";
						break;
					case "4":
						Whr4Incend = "CODREP is not null  and CODREP<>'' and CATDEP='"+Departamento+"'";
						break;    
				}    
    			
    		}else{ //se filtra por estado(menos incendios, no calza el nombre de campo)

                    switch(idtema) {
						case "1":
							Whr1Defo   = " REPOR is not null and NOMDEP='"+Departamento+"' and ESTADO='"+Estado+"' ";
							break;
						case "2":
							Whr2Tala   = " REPOR is not null and NOMDEP='"+Departamento+"' and ESTADO='"+Estado+"' ";	
							break;
						case "3":
							Whr3Ecosis = " REPOR is not null and NOMDEP='"+Departamento+"' and ESTADO='"+Estado+"' ";
							break;
						case "4":
							Whr4Incend = " CODREP is not null  and CODREP<>'' and CATDEP='"+Departamento+"' ";
							break;    
					} 
    			

    		}	

    				

    	}

    }


	busquedaPrincipal();

}


function busquedaPrincipal(Whr1, Whr2, Whr3, Whr4){

	var QUERYSW  = [];

	var PromiseIncendios = new Promise(function(resolve, reject) {

		let statisticDefinition4 = new StatisticDefinition();
		statisticDefinition4.statisticType = "count";
		statisticDefinition4.onStatisticField = "OBJECTID";
		statisticDefinition4.outStatisticFieldName = "TOTALPOLYSINCEND";
		let queryTask4 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Incendios/MapServer/3"); //2 Alerta de Incendio Forestal ultimas24
		let query4 = new Query();                         
		query4.groupByFieldsForStatistics = ["CODREP,NOMDEP,NOMPRO,NOMDIS,FECHA"];
		query4.where =  "CODREP is not null  and CODREP<>'' and ESTADO='Alertado' and CATDEP='"+value+"'";  		
		query4.num = 100; 		
		query4.orderByFields = ["FECHA"]
		query4.outStatistics = [statisticDefinition4];        
		queryTask4.execute(query4, lang.hitch(this, function (results) {			
		    resolve(results);
		}),lang.hitch(this, function(err){ 
		    alert( "Intentalo nuevamente! :::: -> "+ err);  
		    resolve(null);          	              
		})
		); 		
					        					 
	});

	var PromiseEcosis = new Promise(function(resolve, reject) {

		let statisticDefinition3 = new StatisticDefinition();
		statisticDefinition3.statisticType = "count";
		statisticDefinition3.onStatisticField = "OBJECTID";
		statisticDefinition3.outStatisticFieldName = "TOTALPOLYSECOSIS";
		let queryTask3 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Afectacion_EF/MapServer/0"); //2 Alerta de Incendio Forestal ultimas24
		let query3 = new Query();                         
		query3.groupByFieldsForStatistics = ["REPOR,NOMDEP,NOMPRO,NOMDIS,FECSAI"];
		query3.where =  "ESTADO=1 and  NOMDEP='"+value+"'";    		
		query3.num = 100; 		
		query3.orderByFields = ["FECSAI"]
		query3.outStatistics = [statisticDefinition3];        
		queryTask3.execute(query3, lang.hitch(this, function (results) {
			resolve(results);
		}),lang.hitch(this, function(err){ 
		    alert( "Intente nuevamente::->"+ err);
            resolve(null);
		})
		); 	
					        					 
	});


	var PromiseTala = new Promise(function(resolve, reject) {

		let statisticDefinition2 = new StatisticDefinition();
		statisticDefinition2.statisticType = "count";
		statisticDefinition2.onStatisticField = "OBJECTID";
		statisticDefinition2.outStatisticFieldName = "TOTALPOLYSTALA";
		let queryTask22 = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Deforestacion_Tala/MapServer/0"); //2 Alerta de Incendio Forestal ultimas24
		let query22 = new Query();                         
		query22.groupByFieldsForStatistics = ["REPOR,NOMDEP,NOMPRO,NOMDIS,FESATA"];
		query22.where =  "REPOR is not null and ESTADO=1 and NOMDEP='"+value+"'";   		
		query22.num = 100; 		
		query22.orderByFields = ["FESATA"]
		query22.outStatistics = [statisticDefinition2];        
		queryTask22.execute(query22, lang.hitch(this, function (results) {
			resolve(results);
		}),lang.hitch(this, function(err){ 
			alert( "ERR::->"+ err);
			resolve(null);            	              
		})
		); 
							        					 
	});


	var PromiseDefo = new Promise(function(resolve, reject) {

		let statisticDefinition = new StatisticDefinition();
		statisticDefinition.statisticType = "count";
		statisticDefinition.onStatisticField = "OBJECTID";
		statisticDefinition.outStatisticFieldName = "TOTALPOLYSDEFO";
		let queryTask = new QueryTask("https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Deforestacion_Tala/MapServer/1"); //2 Alerta de Incendio Forestal ultimas24
		let query = new Query();                         
		query.groupByFieldsForStatistics = ["REPOR,NOMDEP,NOMPRO,NOMDIS,FESATA"];		
		query.where =  "REPOR is not null and ESTADO=1 and NOMDEP='"+value+"'";   	
		query.num = 100; 		
		query.orderByFields = ["FESATA"]
		query.outStatistics = [statisticDefinition];        
		queryTask.execute(query, lang.hitch(this, function (results) {
        	resolve(results);
		}),lang.hitch(this, function(err){ 
			alert( "ERR::->"+ err);
			resolve(null);            	              
		})
		);
							        					 
	});


	QUERYSW.push(PromiseIncendios);
    QUERYSW.push(PromiseEcosis);
    QUERYSW.push(PromiseTala);
    QUERYSW.push(PromiseDefo);


	Promise.all(QUERYSW).then(values => {
	    alert("all prmi") 				
			  
    //    corrBval = values[0];  
	   // corrGval = values[1];  
	   // corrRval = values[2]; 
	   // corrNval = values[3];
	   // corrSWIR1val = values[4];	
      
	   // calculateDeforestLoss();
	});




	

}




function LanzarAdjunto(obj){

    let Id = obj.srcElement.id;

	$.ajax({
	    url:"files/"+Id+".zip",
	    type:'HEAD',
	    error: function()
	    {
	    	alert("No existen archivos adjuntos");
	        //file not exists
	    },
	    success: function()
	    {
	    	window.open("files/"+Id+".zip","_top");
	        //file exists
	    }
	});

}




function exportTableToExcel(tableID, filename = ''){
    var downloadLink;
    var dataType = 'application/vnd.ms-excel';
    var tableSelect = document.getElementById(tableID);
    var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
    
    // Specify file name
    filename = filename?filename+'.xls':'excel_data.xls';
    
    // Create download link element
    downloadLink = document.createElement("a");
    
    document.body.appendChild(downloadLink);
    
    if(navigator.msSaveOrOpenBlob){
        var blob = new Blob(['\ufeff', tableHTML], {
            type: dataType
        });
        navigator.msSaveOrOpenBlob( blob, filename);
    }else{
        // Create a link to the file
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
    
        // Setting the file name
        downloadLink.download = filename;
        
        //triggering the function
        downloadLink.click();
    }
}


function loadGrafico(){

// Highcharts.chart('divGrafico', {
//     chart: {
//         type: 'line'
//     },
//     title: {
//         text: 'Monthly Average Temperature'
//     },
//     subtitle: {
//         text: 'Source: WorldClimate.com'
//     },
//     xAxis: {
//         categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
//     },
//     yAxis: {
//         title: {
//             text: 'Temperature (°C)'
//         }
//     },
//     plotOptions: {
//         line: {
//             dataLabels: {
//                 enabled: true
//             },
//             enableMouseTracking: false
//         }
//     },
//     series: [{
//         name: 'Tokyo',
//         data: [7.0, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
//     }, {
//         name: 'London',
//         data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
//     }]
// });
	

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

        let Credencial = key;
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
					//$("#divGrabarInc").show();
		            //$("#divNotificar").hide();
					//limpiarProcGuardarInc();

				    
				    
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


function listarEntidades(datos){
		//alert("listando");

        StrHtmBody="";
		$.each(datos, function(x, valor) {

			    //console.log(valor);
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

function listarEntidadesCombo(datos){
	let list = "<option value='00'> Todos </option>";
   //console.log("NOmbres ecossyfragil",results);
   $.each(datos, function(i, item) {	
			 
				 //console.log(item.attributes.NOMEF);
				 list+="<option value="+$.trim(item.Nu_Id_Entidad)+"> "+ $.trim(item.Tx_Descripcion) +" </option>"; 
										  			   
	});

	 $("#dr-entidad")
	.find('option')
	.remove()
	.end()
	.append(list)
	.trigger('chosen:updated')
	;
	
	$("#dr-entidad").formSelect();				
}


function getEntidades(){

		let Credencial = key;
		let objJson ={"credencial":Credencial};  
		let txtJson=JSON.stringify(objJson);			
		let param={datos : txtJson };	
		let h=new Date();  
	    $.post("../controller/listaEntidades.php?"+h, param,function(result) { 
		             
				console.log("result  lista entodades!  : ", result); 
				
				let resultado = result[0].result;

				if (resultado==1){

					//alert("listar entodades en html");
					//listarEntidades(result[0].datos);
					listarEntidadesCombo(result[0].datos);

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
	 
	let Credencial = key;
	let objJson ={"credencial":Credencial};  	
	let txtJson=JSON.stringify(objJson);			
	let param={datos : txtJson };	
	let h=new Date();  
    $.post("../controller/listaIncidencias.php?"+h, param,function(result) { 
	             
				 console.log("result  Lista listaIncidencias  : ", result);		             	            
				 let resultado = result[0].result;
				 //alert(resultado);
				 if (resultado==1){					 
					  //x + "@" + valor.i_codopera + "@" +  valor.i_codnivel + "@" + valor.v_coddep + "@" + valor.v_codpro + "@" + valor.v_coddis;
					  //let idContenedor = obj.srcElement.id;
					  //console.log();
					  let Datos = result[0].datos;
					  
					  if (Datos.length==0){						   
							   alert("No se encontraron datos");
							   // $("#pannel_001").html("");
							   // $("#iconLoadFindAdv").hide();						   
					  }else{
					       //debugger;						  
							  tabularResultsIndicencias(Datos);						      
					  }
					  //console.log("###$$$$sssssssssss -> ",ResultadoBusquedaUltim.length);
				      
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


   
function tabularResultsIndicencias(results){

	$("#tbodyTable").html("");

	    ListaIncidenciasActual = results;
	
		//console.log("tabaular",results);

		//!!! ACA DEBE IR UNA LLAMADA PARA LOS DATOS DEL SERVICIO, SOLO LOS QUE ESTAN COMO RECIEN IDENTIFICADOS
		
		$.each(results, function(x, valor) {
			let Tr = document.createElement("TR");


			// ¡FALTA! ACA SE DEBE USAR EL SERVICIO PARA DEFINIR LOS COLORES				
			let ColorEstado;
            if (valor.Nu_Estado==1){
            	ColorEstado="#000";
            }else if(valor.Nu_Estado==2){
            	ColorEstado="#ff0000";
            }else if(valor.Nu_Estado==3){
            	ColorEstado="#ffaa00"
            }else if(valor.Nu_Estado==4){
            	ColorEstado="#70a800"
            }else if(valor.Nu_Estado==5){
            	ColorEstado="#a80000"
            }

            //Tr.style.cssText = "color:"+ColorEstado;  Tx_CodigoLlave

			let Td1 = document.createElement("TD"); 
			Td1.style.cssText = "text-align: center; color:"+ColorEstado;
			Td1.innerHTML = 	valor.Nu_EstadoDesc;

			let IconEstado = document.createElement("i"); 
			IconEstado.style.cssText = "font-size: 18px;font-weight: bold; color:"+ColorEstado;
			IconEstado.className = 'pe-7s-map-marker';

			//Td1.appendChild(IconEstado);
			
			let Td2 = document.createElement("TD"); 
			Td2.style.cssText = "text-transform:capitalize;";
			Td2.innerHTML = valor.Tx_CodigoLlave ;

			let Td3 = document.createElement("TD"); 
			Td3.style.cssText = "text-transform:capitalize;";
			Td3.innerHTML = valor.Tx_Descripcion ;

			let Td4 = document.createElement("TD"); 
			Td4.style.cssText = "text-transform:capitalize;";
			Td4.innerHTML = valor.Nu_CodTemaDesc ;

			let Td5 = document.createElement("TD"); 
			Td5.style.cssText = "text-transform:capitalize;";

			if(valor.Fe_FechaIncidencia != null){
		    	let Fe_FechaIncidencia = new Date(valor.Fe_FechaIncidencia.date);
		        Td5.innerHTML = Fe_FechaIncidencia.toLocaleDateString();
		    }else{
		    	Td5.innerHTML = "";
		    }				

			let Td6 = document.createElement("TD"); 
			Td6.style.cssText = "text-transform:capitalize;";
			if(valor.Fe_FechaNotifca != null){
		    	let Fe_FechaNotifca = new Date(valor.Fe_FechaNotifca.date);
		        Td6.innerHTML = Fe_FechaNotifca.toLocaleDateString();
		    }else{
		    	Td6.innerHTML = "";
		    }				

			let Td7 = document.createElement("TD"); 
			Td7.style.cssText = "text-transform:capitalize;";
			if(valor.Fe_FechaAccionUlt != null){
		    	let Fe_FechaAccionUlt = new Date(valor.Fe_FechaAccionUlt.date);
		        Td7.innerHTML = Fe_FechaAccionUlt.toLocaleDateString();
		    }else{
		    	Td7.innerHTML = "";
		    }				
			
			let Td8 = document.createElement("TD"); 
			let Td8a = document.createElement("TD"); 

			let Td9 = document.createElement("TD"); 
		    
			
			let iconSel = document.createElement("span"); 
			iconSel.id = "inc"+x + "@" + valor.Nu_Id_Incidencia + "@" +  valor.Nu_IdGis + "@" +  valor.Tx_CodigoLlave  ;
			iconSel.innerHTML = 	"search";
			iconSel.className = 'material-icons';
			iconSel.style.cssText = "cursor:pointer;color:"+ColorEstado;
			iconSel.onclick = verDetalleIncidencia;
			Td8.appendChild(iconSel);



			let iconSelA = document.createElement("span"); 
				iconSelA.id = "incA"+x + "@" + $.trim(valor.Tx_CodigoLlave) + "@" +  valor.Nu_CodTema ;				
				//iconSelA.className = 'pe-7s-map';
				//iconSelA.style.cssText = "cursor:pointer; font-size:19px; font-weight: bold;color:"+ColorEstado;
				iconSelA.style.cssText = "cursor:pointer;display:block; width: 16px; height: 16px; background-image: url('../img/favicon/favicon-16x16.png');";
				
				iconSelA.onclick = openViewDeforest;

                Td8a.appendChild(iconSelA);


			let iconNotif = document.createElement("span"); 
			iconNotif.id = "inc"+x + "@" + $.trim(valor.Tx_CodigoLlave) + "@" +  valor.Nu_IdGis  ;
			iconNotif.className = 'pe-7s-note2';
			iconNotif.style.cssText = "cursor:pointer; font-size:18px; font-weight: bold;color:";
			iconNotif.onclick = getRptDefo;

            	
            Td9.appendChild(iconNotif);				
			
			Tr.appendChild(Td8a);
			Tr.appendChild(Td9);




			Tr.appendChild(Td8);
			Tr.appendChild(Td1);
			Tr.appendChild(Td2);
			
			Tr.appendChild(Td4);
			Tr.appendChild(Td3);
			Tr.appendChild(Td5);
			Tr.appendChild(Td6);
			Tr.appendChild(Td7);
			
			
			$("#tbodyTable").append(Tr); 
				
				
				
		});	
	
	
	
	
}

function cargaVentanaNotifica(obj){

	    //showLoading hideLoading
	    showLoading();

        let idContenedor = obj.srcElement.id;
		let objsplit     = idContenedor.split("@");
		
		let IdIncidencia = objsplit[1];
		let IdGis = objsplit[2];
		
		console.log("IdIncidencia",IdIncidencia);
		console.log("IdGis",IdGis);

	            		                    		                 	

     	setTimeout(function(){


            let RowIncidencia;
		    $.each(ListaIncidenciasActual, function(x, valor) {
		    	if(valor.Nu_Id_Incidencia==IdIncidencia){
                      RowIncidencia=valor;
		    	}
		    });

		    console.log("RowIncidencia", RowIncidencia);

		    dom.byId("lblNotiIdInc").innerHTML=RowIncidencia.Nu_Id_Incidencia;
		    dom.byId("lblNotiDescInc").innerHTML=RowIncidencia.Tx_Descripcion;

		    CODINCIDSAVE=RowIncidencia.Nu_Id_Incidencia;
		    

		    hideLoading();
		    $("#divTabla").hide();
		    $("#divNotificar").show();
		    
	
		}, 1500);
				       
	                 	
	                

}

function verDetalleIncidencia(obj){

	    //showLoading hideLoading
	    showLoading();

	    let idContenedor = obj.srcElement.id;
		let objsplit     = idContenedor.split("@");
		
		let IdIncidencia = objsplit[1];
		let IdGis = objsplit[2];
		let CodLlave = objsplit[3];
		
		console.log("IdIncidencia",IdIncidencia);
		console.log("IdGis",IdGis);

	    // var queryTask = new QueryTask("http://geoservidorperu.minam.gob.pe/arcgis/rest/services/geobosque/atd_corroboradas/MapServer/0");  
		// var query = new Query();                                     
		// query.returnGeometry = true;                                 
		// query.outFields = ["OBJECTID"];                        
		// query.where =  "OBJECTID ="+IdGis;        
		// queryTask.execute(query, lang.hitch(this, function (results) {  
			
	                 // console.log("Results Query: ",results);
	                
	                 // var feature = results.features[0];
	                 // if (feature) { 
	                 	
	                 	//let graphic = new Graphic(feature.geometry); 
	                 	//console.log("graphic grabar:---",graphic);	                 		                    		                 	

	                 	setTimeout(function(){ 

						   // map.centerAndZoom(feature.geometry,17);

						    //map.setLevel(13);
						    let RowIncidencia;
						    $.each(ListaIncidenciasActual, function(x, valor) {
						    	if(valor.Nu_Id_Incidencia==IdIncidencia){
                                      RowIncidencia=valor;
						    	}
						    });

						    console.log("RowIncidencia", RowIncidencia);

						    //let point = new Point( {"x": $.trim(RowIncidencia.Tx_Latitud), "y":  $.trim(RowIncidencia.Tx_Longitud), "spatialReference": {"wkid": 4326 } });				
			                //map.centerAndZoom(point,17);
			                buscarCoberturas(RowIncidencia.Nu_CodTema,RowIncidencia.Tx_CodigoLlave);
			                
			                /*let symbol =  new PictureMarkerSymbol({
							    "url":"img/icon_red2.png",
							    "height":60,
							    "width":60,
							    "type":"esriPMS"
							  });

						    let graphic = new Graphic(point, symbol);
				            map.graphics.add(graphic);*/


						    
						    //dom.byId("lblIncId").innerHTML=RowIncidencia.Nu_Id_Incidencia;
						    dom.byId("lblEstado").innerHTML=RowIncidencia.Nu_Estado;
						    dom.byId("lblEstado2").innerHTML=RowIncidencia.Nu_CodTemaDesc;
						    dom.byId("lblDesc").innerHTML=RowIncidencia.Tx_Descripcion;
						    dom.byId("lblTema").innerHTML=RowIncidencia.Nu_CodTema;
						    dom.byId("lblTema2").innerHTML=RowIncidencia.Nu_EstadoDesc;
						    let Fe_FechaIncidencia = new Date(RowIncidencia.Fe_FechaIncidencia.date);
						    dom.byId("lblFecInc").innerHTML=(RowIncidencia.Fe_FechaIncidencia == null ? '' :   Fe_FechaIncidencia.toLocaleDateString()  ); 

						    if(RowIncidencia.Fe_FechaNotifca != null){
						    	let Fe_FechaNotifca = new Date(RowIncidencia.Fe_FechaNotifca.date);
						        dom.byId("lblFecNotif").innerHTML= Fe_FechaNotifca.toLocaleDateString(); 

						    }else{
						    	dom.byId("lblFecNotif").innerHTML="";
						    }

						    if(RowIncidencia.Fe_FechaAccionUlt != null){
						    	let Fe_FechaAccionUlt = new Date(RowIncidencia.Fe_FechaAccionUlt.date);
						        dom.byId("lblFecUltAcc").innerHTML=Fe_FechaAccionUlt.toLocaleDateString();

						    }else{
						    	dom.byId("lblFecUltAcc").innerHTML="";
						    }
						    
						    
						    $("#divTabla").hide();
                 		    $("#divMapa").show();
						    hideLoading();
						    //alert("Filtrar detalles "+RowIncidencia.Nu_Id_Incidencia);
						    filtrarDetalles(RowIncidencia.Nu_Id_Incidencia);
					
						}, 1500);
				       
	                 	
	                 //}
	                 
	             // }),lang.hitch(this, function(err){ 
	             // 	alert( "ERR::->"+ err);            	              
	             // })
	             // ); 

}


function buscarCoberturas(Tema, CodigoLlave){

    //alert("Se buscaran las cobertiras");
    // ¡FALTA¡ poner un a variable global de la ruta del servicio de tala
   
    let URL_Srv="";
    let Where="";

	if(Tema==1){
		URL_Srv="https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Deforestacion_Tala/MapServer/1";
		Where="REPOR ='"+CodigoLlave+"'";  
	}
	if(Tema==2){
		URL_Srv="https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Deforestacion_Tala/MapServer/0";
		Where="REPOR ='"+CodigoLlave+"'"; 
	}
	if(Tema==3){
		URL_Srv="https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Monitoreo_Afectacion_EF/MapServer/0";
		Where="REPOR ='"+CodigoLlave+"'"; 
	}
	if(Tema==4){
		URL_Srv="https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Incendios/MapServer/3";
		Where="CODREP ='"+CodigoLlave+"'"; 
	}

	var queryTask = new QueryTask(URL_Srv);  
	var query = new Query();                                     
	query.returnGeometry = true;                                 
	query.outFields = ["OBJECTID"];                        
	query.where =  Where;        
	queryTask.execute(query, lang.hitch(this, function (results) {  
		
                //console.log("result polys buscarCoberturas: ",results);
                polylineGraphicsLimites.clear();
                pointGraphics.clear();

                if (results.features.length>0){
                	//alert("Nro fets: "+results.features.length);
                	let extentX;
                	let ArrPoints=[];

					$.each(results.features, function(x, valor) {
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
						    
                        }else if (results.geometryType=="esriGeometryPoint"){
                        	
                         	pointGraphics.add(graphic);	
                         	ArrPoints.push(graphic) 
                         	//extentX=esri.graphicsExtent(ArrPoints);    
                        }		                 	
	                 	

					});

                    extentX=esri.graphicsExtent(ArrPoints).expand(2);  
					map.setExtent(extentX); 
					
                }else{
                    alert("No se encontraron mapas");
                }                

	}),lang.hitch(this, function(err){ 
		alert( "Exception :: "+ err);            	              
	})
	);

}


function filtrarDetalles(IdIncidencia){
    
    let Credencial = key;
	let objJson ={"credencial":Credencial, "IdInci":IdIncidencia};  	
	let txtJson=JSON.stringify(objJson);			
	let param={datos : txtJson };	
	let h=new Date();  
    $.post("../controller/getDetallesIndicencia.php?"+h, param,function(result) { 
	             
				 console.log("result  Lista Acciones  : ", result);	
	             //return;
	            
				 let resultado = result[0].result;
				 let resultado2 = result[0].result2;
				 
				 if (resultado==1){
				 	  showAcciones(result);
				 	  //showEntiesNotif(result[0].entisnotif[0].datos);
				 }else{
				      alert("Intentalo nuevamente!");					  
				 }


				 if (resultado2==1){
				 	  showNotificaciones(result);
				 }else{
				      alert("Intentalo nuevamente!");	                      					  
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


function showNotificaciones(result){

	let Datos = result[0].datos2;

	if (Datos.length==0){
							   					  	
	    //alert("No se encontraron datos");
	    $("#divNotifocaciones").html("SIN NOTIFICACIONES");

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
			//HtmlNotifs += "<b>"+ FechaNoti.toLocaleDateString() +  " " + valor.descrip+"</b><br>";
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

	    //alert("No se encontraron datos");
	    $("#divAccionesTbl").html("SIN ACCIONES");

	}else{

		$("#divAccionesTbl").html("");

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
			HtmlAcciones += "<b>"+ valor.descrip+"</b><br>";
			let TrP = document.createElement("TR");
			let Tda1 = document.createElement("TD"); 
			Tda1.innerHTML = valor.descrip.toUpperCase() ;
			Tda1.style.cssText = "font-weight:bold !important;";
			let Tda2 = document.createElement("TD"); 
			TrP.appendChild(Tda1);
			TrP.appendChild(Tda2);
			$("#divAccionesTbl").append(TrP); 

			$.each(Datos, function(x, valor2) {
			    if (valor.idIns==valor2.Nu_Id_Entidad){
	                let FechaAccion = new Date(valor2.Fe_FechaAccion.date);
				    HtmlAcciones += "&nbsp;<span style='font-size:13px; color:orange; font-weight:bold' class='pe-7s-check'/>&nbsp;" +  FechaAccion.toLocaleDateString() + " " +  valor2.Tx_DescripcionAccion+"<br>";
		   	    
		   	       
		   	        let Tr = document.createElement("TR");


		   	        let Td4 = document.createElement("TD");
					Td4.innerHTML = FechaAccion.toLocaleDateString() + " " + valor2.Tx_DescripcionAccion ;
					Td4.style.cssText = "padding-left:20px !important;";

					let Td8 = document.createElement("TD"); 

					let iconSel = document.createElement("span"); 
					iconSel.id = valor2.Nu_Id_Accion ;
					iconSel.className = 'pe-7s-link';
					iconSel.style.cssText = "cursor:pointer; font-size:19px; font-weight: bold;color:";
					iconSel.onclick = LanzarAdjunto;

	                Td8.appendChild(iconSel);				

					Tr.appendChild(Td4);
					Tr.appendChild(Td8);

					$("#divAccionesTbl").append(Tr); 



		   	    }
			});
			HtmlAcciones+= "<hr>";
		});

		
		//$("#divAcciones").html(HtmlAcciones);

		//console.log("HtmlAcciones", HtmlAcciones);


	}
	


}


function showEntiesNotif(result){

}










});

