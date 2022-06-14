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
	var ROWINCIDENCIACTIVA;
	//alert("dola");
	
	
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


   
     featureLayerIncidencias.on("edits-complete", lang.hitch(this,function(result) {
                			
            	alert("grabo feture");
                console.log(result);
				var featureAdd=result.adds[0];            					          								
				
				
    }));


	
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


	$('#btnGrabarAccion').on('click', function(event) {	

		
		//alert("grabar accion");
		let reaVal = validaBeforeGrabar();
		if (reaVal===true) $("#DivModal").show();
		


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

	
	

	$('#btnLogout').on('click', function(event) {		 
		
		logOut();
	});


	$('#cboTipoaccion').on('change', function() {
		
		if (this.value==="6"){
			$("#divTipoaccion").show();			
		}else{
			$("#divTipoaccion").hide();
		}
	});


	$('#btnDownExcel').on('click', function(event) {		 
		
		exportTableToExcel("tblGrilla");
	});



	
	
   
	
    getAllIncidencias();
    //grabarIncidencia();
	

	
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





function logOut(){


	window.open("../gestionmonitoreo/index.html","_top");

	
}



function validaBeforeGrabar(){
	
    let Credencial = "abfw45412f";
	let descrip=$("#txtDescripcionAccion").val();
	let fechaaccion= $("#dtpFechaAccion").val();
	let tipoaccion=$("#cboTipoaccion").val();
	let idnotif=ROWINCIDENCIACTIVA.Nu_Id_Notificacion;
	let identidad=ROWINCIDENCIACTIVA.Nu_IdEntidad;
	let idincid=ROWINCIDENCIACTIVA.Nu_Id_Incidencia;

    //alert($("#dtpFechaAccion").val());
	
    
    if ($.trim(tipoaccion)===""){
		alert("Seleccione tipo de accion");
        return false;
	}

	if (fechaaccion===""){
		alert("Seleccione una fecha");
        return false;
	}

	if ($.trim(descrip)===""){
        alert("Ingrese una descripcion");
        return false;
	}


	if ($('#inAdjunto')[0].files[0]){
        // alert("no se adjunto archivo");
    	//return false;
    	let fileSize = $('#inAdjunto')[0].files[0].size;
        let siezekiloByte = parseInt(fileSize / 1024);

		if (siezekiloByte>5100){
			alert("El archivo es demasiado pesado para cargarlo, limite maximo es de 5 megas.");
			return false;
		}
		if($('#inAdjunto')[0].files[0].type != "application/x-zip-compressed"){
			 alert("¡Solo se adminiten archivos comprimidos en formato Zip!");
			 return false;
		}
	}

	

	return true;



}


function exeGrabarAccion(){


    let Credencial = "abfw45412f";
	let descrip=$("#txtDescripcionAccion").val();
	
	//let fechaaccion= "12-6-2020" ; //$("#dtpFechaAccion").val();


    var d = new Date($("#dtpFechaAccion").val());
    let mess= d.getMonth()+1
	let fechaaccion= d.getDate() + "-" +  mess + "-" + d.getFullYear() ; //$("#dtpFechaAccion").val();
	//console.log("fecha1:",fechaaccion);
	//console.log("fecha2:",fechaaccion2);


	let tipoaccion=$("#cboTipoaccion").val();
	let idnotif=ROWINCIDENCIACTIVA.Nu_Id_Notificacion;
	let identidad=ROWINCIDENCIACTIVA.Nu_IdEntidad;
	let idincid=ROWINCIDENCIACTIVA.Nu_Id_Incidencia;
	let txtTipoAccion= $("#txtTipoAccion").val() ; //


	if ($.trim(descrip)===""){
        alert("Ingrese una dirección");
	}

	let Formulario = new FormData(document.forms[0]);
	Formulario.append("credencial",Credencial);
	Formulario.append("descrip",descrip);
	Formulario.append("fechaaccion",fechaaccion);
	Formulario.append("idnotif",idnotif);
	Formulario.append("identidad",identidad);
	Formulario.append("idincid",idincid);
	Formulario.append("tipoaccion",tipoaccion);  
	Formulario.append("descripaccion",txtTipoAccion);

	$.ajax({		
        url: '../controller/uploadFile.php',
        type: 'POST',
        data: Formulario,
        async: false,
        success: function (result) {
        	
        	let resultado =JSON.parse(result);

			resultado = resultado[0].result;
			if (resultado==1){

				let WithFile = JSON.parse(result)[0].WithFile;
				if (WithFile===1){

					let resulUploadMove = JSON.parse(result)[0].resulUploadMove
					if (resulUploadMove === "true"){
						alert("Registro Satisfactorio con adjunto!");
					}else{
						alert("Se registro correctamente, pero el adjunto no se pudo cargar!");
					}

				}else{

					alert("RESGISTRO SATISFACTORIO!");
				}

				console.log("resultado pus:", JSON.parse(result));
				
				$("#divGrabarAccionNueva").hide();
				$("#DivModal").hide();
				filtrarDetalles(ROWINCIDENCIACTIVA.Nu_Id_Incidencia);

			}else{
				alert("Intentalo Nuevamente");
				console.log("resultado pus:", JSON.parse(result));
			}

        	//console.log("result add accion ajax b", resultado);
            //alert(result);
        },
        error:function(data){
            alert("Exception");
        },
        cache: false,
        contentType: false,
        processData: false
    });








 //    return;

	 
	// let Credencial = "abfw45412f";
	// let descrip=$("#txtDescripcionAccion").val();
	// let fechaaccion= "01-01-2020" ; //$("#dtpFechaAccion").val();
	// let tipoaccion=$("#cboTipoaccion").val();
	// let idnotif=ROWINCIDENCIACTIVA.Nu_Id_Notificacion;
	// let identidad=ROWINCIDENCIACTIVA.Nu_IdEntidad;
	// let idincid=ROWINCIDENCIACTIVA.Nu_Id_Incidencia;
	
	


	// let objJson ={ "credencial":Credencial
	//               ,"descrip":descrip
	//               ,"fechaaccion":fechaaccion
	//               ,"idnotif":idnotif
	//               ,"identidad":identidad
	//               ,"idincid":idincid
	//               ,"tipoaccion":tipoaccion};  	
	// let txtJson=JSON.stringify(objJson);			
	// let param={datos : txtJson };	
	// let h=new Date();  
 //    $.post("../controller/guardarAccion.php?"+h, param,function(result) { 
	             
	// 		console.log("result grabar accion  : ", result);	
	// 		let resultado = result[0].result;
	// 		if (resultado==1){
	// 			alert("RESGISTRO SATISFACTORIO!");
	// 			$("#divGrabarAccionNueva").hide();
	// 			$("#DivModal").hide();
	// 			filtrarDetalles(ROWINCIDENCIACTIVA.Nu_Id_Incidencia);

	// 		}else{
	// 			alert("Intentalo Nuevamente");
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
				   
					   alert("No se encontraron datos");
					   // $("#pannel_001").html("");
					   // $("#iconLoadFindAdv").hide();
				   
			  }else{
				  
					  tabularResultsIndicencias( Datos );
				      
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

	    ListaIncidenciasActual = results;
	
		//console.log("tabaular",results);
		
		$.each(results, function(x, valor) {
				let Tr = document.createElement("TR");
				
				
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




				let Td1 = document.createElement("TD"); 
				Td1.style.cssText = "text-align: center; color:"+ColorEstado;
				Td1.innerHTML = 	valor.Nu_EstadoDesc;

				let IconEstado = document.createElement("i"); 
				IconEstado.style.cssText = "font-size: 18px;font-weight: bold; color:"+ColorEstado;
				IconEstado.className = 'pe-7s-map-marker';

				//Td1.appendChild(IconEstado);
				
				let Td2 = document.createElement("TD"); 
				Td2.style.cssText = "text-transform:capitalize;color:"+ColorEstado;
				Td2.innerHTML = valor.Tx_CodigoLlave ;

				let Td3 = document.createElement("TD"); 
				Td3.style.cssText = "text-transform:capitalize;";
				Td3.innerHTML = valor.Tx_Descripcion ;

				let Td4 = document.createElement("TD"); 
				Td4.style.cssText = "text-transform:capitalize;";
				Td4.innerHTML = valor.Nu_CodTemaDesc ;

				let Td5 = document.createElement("TD"); 
				Td5.style.cssText = "text-transform:capitalize;";
				// Td5.innerHTML = (valor.Fe_FechaIncidencia == null ? '' : valor.Fe_FechaIncidencia.date);  
				if(valor.Fe_FechaIncidencia != null){
			    	let Fe_FechaIncidencia = new Date(valor.Fe_FechaIncidencia.date);
			        Td5.innerHTML = Fe_FechaIncidencia.toLocaleDateString();
			    }else{
			    	Td5.innerHTML = "";
			    }

				let Td6 = document.createElement("TD"); 
				Td6.style.cssText = "text-transform:capitalize;";
				//Td6.innerHTML = (valor.Fe_FechaNotifca == null ? '' : valor.Fe_FechaNotifca.date); 
				if(valor.Fe_FechaNotifca != null){
			    	let Fe_FechaNotifca = new Date(valor.Fe_FechaNotifca.date);
			        Td6.innerHTML = Fe_FechaNotifca.toLocaleDateString();
			    }else{
			    	Td6.innerHTML = "";
			    }

				let Td7 = document.createElement("TD"); 
				Td7.style.cssText = "text-transform:capitalize;";
				//Td7.innerHTML = (valor.Fe_FechaAccionUlt == null ? '' : valor.Fe_FechaAccionUlt.date); 
				if(valor.Fe_FechaAccionUlt != null){
			    	let Fe_FechaAccionUlt = new Date(valor.Fe_FechaAccionUlt.date);
			        Td7.innerHTML = Fe_FechaAccionUlt.toLocaleDateString();
			    }else{
			    	Td7.innerHTML = "";
			    }
				
				

				let Td8 = document.createElement("TD"); 
				let Td8a = document.createElement("TD"); 
				let Td8b = document.createElement("TD"); 
			    
				
				let iconSel = document.createElement("span"); 
				iconSel.id = "inc"+x + "@" + valor.Nu_Id_Incidencia + "@" +  valor.Nu_IdGis ;
				//iconSel.innerHTML = 	"search";
				iconSel.className = 'pe-7s-link';
				iconSel.style.cssText = "cursor:pointer; font-size:19px; font-weight: bold;color:"+ColorEstado;
				iconSel.onclick = verDetalleIncidencia;

                Td8.appendChild(iconSel);



				let iconSelA = document.createElement("span"); 
				iconSelA.id = "incA"+x + "@" + $.trim(valor.Tx_CodigoLlave) + "@" +  valor.Nu_CodTema ;				
				//iconSelA.className = 'pe-7s-map';
				//iconSelA.style.cssText = "cursor:pointer; font-size:19px; font-weight: bold;color:"+ColorEstado;
				iconSelA.style.cssText = "cursor:pointer;display:block; width: 16px; height: 16px; background-image: url('../img/favicon/favicon-16x16.png');";
				
				iconSelA.onclick = openViewDeforest;

                Td8a.appendChild(iconSelA);




                let iconSelB = document.createElement("span"); 
				iconSelB.id = "incB"+x + "@" + $.trim(valor.Tx_CodigoLlave) + "@" +  valor.Nu_IdGis ;				
				iconSelB.className = 'pe-7s-note2';
				iconSelB.style.cssText = "cursor:pointer; font-size:18px; font-weight: bold;color:";
				//iconSelB.style.cssText = "cursor:pointer;display:block; width: 16px; height: 16px; background-image: url('../img/favicon/favicon-16x16.png');";
				
				iconSelB.onclick = getRptDefo;

                Td8b.appendChild(iconSelB);



                
                



				
				Tr.appendChild(Td8a);
				Tr.appendChild(Td8b);
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


function verDetalleIncidencia(obj){

	    //showLoading hideLoading
	    showLoading();

	    let idContenedor = obj.srcElement.id;
		let objsplit     = idContenedor.split("@");
		
		let IdIncidencia = objsplit[1];
		let IdGis = objsplit[2];
		
		console.log("IdIncidencia",IdIncidencia);
		console.log("IdGis",IdGis);
       	             		                    		                 	

     	//camboar ór querytask
     	setTimeout(function(){ 

		    $.each(ListaIncidenciasActual, function(x, valor) {
		    	if(valor.Nu_Id_Incidencia==IdIncidencia){
                      ROWINCIDENCIACTIVA=valor;
		    	}
		    });
		    //console.log("ROWINCIDENCIACTIVA", ROWINCIDENCIACTIVA);

		    buscarCoberturas(ROWINCIDENCIACTIVA.Nu_CodTema,ROWINCIDENCIACTIVA.Tx_CodigoLlave);
		    
		    dom.byId("lblDesc").innerHTML= "AFECTACIÓN : " + ROWINCIDENCIACTIVA.Tx_Descripcion;
		    
		 //    let point = new Point( {"x": $.trim(ROWINCIDENCIACTIVA.Tx_Latitud), "y":  $.trim(ROWINCIDENCIACTIVA.Tx_Longitud), "spatialReference": {"wkid": 4326 } });				
			// map.centerAndZoom(point,17);
		    
			// let symbol =  new PictureMarkerSymbol({
			//     "url":"img/icon_red2.png",
			//     "height":60,
			//     "width":60,
			//     "type":"esriPMS"
			// });

		 //    var graphic = new Graphic(point, symbol);

   //          map.graphics.add(graphic);

		    $("#divTabla").hide();
 		    $("#divMapa").show();
		    hideLoading();
		    filtrarDetalles(ROWINCIDENCIACTIVA.Nu_Id_Incidencia);
	
		}, 1500);
				       
	                 	
	               
	                 
	             

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



function buscarCoberturas(Tema, CodigoLlave){

    //alert("Se buscaran las cobertiras: tema->"+Tema  + " llave->"+CodigoLlave);
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
                        }else if (results.geometryType=="esriGeometryPoint"){                        	
                         	pointGraphics.add(graphic);	
                         	ArrPoints.push(graphic)                          	
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
	//alert("IdIncidencia:"+IdIncidencia);
    
    let Credencial = "abfw45412f";
	let objJson ={"credencial":Credencial, "IdInci":IdIncidencia};  	
	let txtJson=JSON.stringify(objJson);			
	let param={datos : txtJson };	
	let h=new Date();  
    $.post("../controller/getDetallesIndicenciaUser.php?"+h, param,function(result) { 
	             
				 console.log("result ->  getDetallesIndicenciaUser : ", result);	
	             //return;
	            
				 let resultado = result[0].result;
				 let resultado2 = result[0].result2;
				 
				 if (resultado==1){
				 	  showAcciones(result);
				 }else{
				      alert("Intentalo nuevamente!");					  
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
							   					  	
	    alert("No se encontraron datos");

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

	    //alert("No se encontraron datos de acciones");
	    $("#divAccionesTbl").html("¡AUN NO SE REGISTRAN ACCIONES!");

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
			
			HtmlAcciones += "<b>ACCIONES REALIZADAS</b><br><br>";
			$.each(Datos, function(x, valor2) {
			    if (valor.idIns==valor2.Nu_Id_Entidad){

	                let FechaAccion = new Date(valor2.Fe_FechaAccion.date);
				    HtmlAcciones += "&nbsp;<span style='font-size:13px; color:orange; font-weight:bold' class='pe-7s-check'/>&nbsp;" +  FechaAccion.toLocaleDateString() + " " +  valor2.Tx_DescripcionAccion+"<br>";
		   	        HtmlAcciones += "<hr>";


		   	        let Tr = document.createElement("TR");


		   	        let Td4 = document.createElement("TD");
					Td4.innerHTML = FechaAccion.toLocaleDateString() + " " + valor2.Tx_DescripcionAccion ;

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



				

			
		});

		
		//$("#divAcciones").html(HtmlAcciones);

		

	}
	


}





});

