/****************************************************************
* 52°North WPS OpenLayers Client
*
* for using WPS-based processes in browser-based applications.
* Copyright (C) 2010
* Janne Kovanen, Finnish Geodetic Institute
* Raphael Rupprecht, Institute for Geoinformatics
* 52North GmbH
*
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU Lesser General Public
* License as published by the Free Software Foundation; either
* version 2.1 of the License, or (at your option) any later version.
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
* Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public
* License along with this library; if not, write to the Free Software
* Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
*
***************************************************************/
 
/**
 * Class: WOC.ComplexData
 *     Handles WPS complex data.
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 */
WOC.ComplexData = OpenLayers.Class({
        /**
     * Constructor: WOC.ComplexData
         */
        initialize: function() {
                /**
                 * Variable: formats
                 * {Array{WOC.Format}} An array of allowed formats.
                 *     The first is the default choice.
                 */
                var formats = new Array();
                /**
                 * Variable: maximumMegabytes
                 * {Double} The allowed size of the data in megabytes.
                 *     By default the size is set to zero -> Any sized files are allowed!
                 */
                var maximumMegabytes = 0;
                
                /**
                 * Method: parseFromNode
                 *     Parses the object data from an input/output form choice's
                 *     complex data structure.
                 *
                 * Parameters:
                 * complexDataNode - {DOMElement} A node, from which the objects
                 *      properties are parsed, like the wps:ComplexData element.
                 */
                this.parseFromNode = function(complexDataNode) {
                        var format = new WOC.Format();
                        // Reading the formats!
                        // Default format.
                        var def = WOC.getElementsByTagNameNS(
                                        complexDataNode, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'Default')[0];
                        var formatNode = WOC.getElementsByTagNameNS(
                                        def, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'Format')[0];
                        format.parseFromNode(formatNode);
                        formats.push(format);
                        // Supported formats.
                        var sup = WOC.getElementsByTagNameNS(
                                        complexDataNode, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'Supported')[0];
                        var supportedFormatNodes = WOC.getElementsByTagNameNS(
                                        sup, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'Format');
                        for(var k=0; k<supportedFormatNodes.length; k++) {
                                format = new WOC.Format();
                                format.parseFromNode(supportedFormatNodes[k]);
                                formats.push(format);
                        }
                        // Maximum megabytes
                        if(complexDataNode.hasAttribute('maximumMegabytes')) {
                                maximumMegabytes = complexDataNode.attributes.getNamedItem(
                                                'maximumMegabytes').nodeValue;
                        }
                }
                
                /**
                 * Method: getFormats
                 *     Returns the formats.
                 *
                 * Returns:
                 * {Array{WOC.Format}} An array of allowed formats.
                 *     The first is the default choice.
                 */
                this.getFormats = function() {
                        return formats;
                }
                
                /**
                 * Method: getMaximumMegabytes
                 *     Returns the maximum allowed size of the data in megabytes
                 *
                 * Returns:
                 * {Double} The allowed size of the data in megabytes.
                 *     If the size is 0, then any sized files are allowed!
                 */
                this.getMaximumMegabytes = function() {
                        return maximumMegabytes;
                }
                
                /**
                 * Method: createDescriptionTableData
                 *     Creates a description of the data into a table data (td) element.
                 * 
                 * Parameters: 
                 * td - {DOMElement} Table data, where the description is put.
                 * id - {String} The identifier of the data.
                 * map - {OpenLayers.Map} The map for which the descriptions are made.
                 */
                 this.createDescriptionTableData = function(td, id, map) {
                         var xmlSupported = false;
                         var imageDataSupported = false;
 						var base64shpSupported = false;
 						
                         for(var j=0; j<formats.length; j++) {
                                 var defaultMimeType = formats[j].getMimeType().toLowerCase();
                                 // MIME type = XML
 								if(defaultMimeType == "text/xml") 
 								{                                        
                                     xmlSupported = true;
                                 } 
 								// MIME type = image
 								else if(defaultMimeType == "image/jpeg" ||
 										  defaultMimeType == "image/gif" ||
 										  defaultMimeType == "image/png" ||
 										  defaultMimeType == "image/png8" ||
 										  defaultMimeType == "image/tiff" ||
 										  defaultMimeType == "image/tiff8" ||
 										  defaultMimeType == "image/geotiff" ||
 										  defaultMimeType == "image/geotiff8" ||
 										  defaultMimeType == "image/svg") 
 								{                   
                                     imageDataSupported = true;
                                 } 
 								// MIME type = SHP
 								else if(defaultMimeType == "application/x-zipped-shp" && 
 										formats[j].getEncoding().toLowerCase() == "base64"){
 									base64shpSupported = true;
 								}
                         }
                         // create the select for the XML/GML/KML layers which can be selected for process's complexdata input
 						var selectList = document.createElement('select');
                         selectList.style.width = '100%';
                         selectList.name = id;
                         selectList.id = id;
                         if(xmlSupported) {
                             for(var j=0; j<map.layers.length; j++) {						// gehe durch alle layer der map
                                     var layerClassName = map.layers[j].CLASS_NAME;
                                     if(layerClassName == "OpenLayers.Layer.WFS" ||			// prüfe den class_name
                                        layerClassName == "OpenLayers.Layer.GML" ||
                                        layerClassName == "WOC.VectorStoringGML" ||
 									   layerClassName == "WOC.VectorStoringKML" ||
                                        layerClassName == "OpenLayers.Layer.Vector") {
                                             var option = document.createElement('option');
                                             option.value = map.layers[j].id;
                                             option.text = map.layers[j].name;
                                             selectList.appendChild(option);
                                     }
                             }
                         }
                         if(imageDataSupported) {
 							for(var j=0; j<map.layers.length; j++) {
 									var layerClassName = this.map.layers[j].CLASS_NAME;
 									if(layerClassName == "OpenLayers.Layer.WMS") {
 											var option = document.createElement('option');
 											option.value = map.layers[j].id;
 											option.text = map.layers[j].name;
 											selectList.appendChild(option);
 									}
 							}
                         }
 						if(base64shpSupported){
 							// if shp is supported add a file chooser to the table cell
 							var labelDiv = $("<div style='float:left;padding-top:7px;padding-right:5px;'>SHP </div>");
 							var shpFileChooser = $("<input type='file' id='shpFileChooser_"+id+"' class='browse' />");
 							td.appendChild(labelDiv[0]);
 							td.appendChild(shpFileChooser[0]);
 						}
                         td.appendChild(selectList);
                 }
                
                /**
                 * Method: getInputXMLStrFromDOMElement
                 *     Sets the complex input data into the XML string that is returned.
                 * Parameters:
                 * element - {DOMElement} Element, whose value defines the selected
                 *     layer.
                 * map - {OpenLayers.Map} The map for which the input XML is made for.
                 *
                 * Returns:
                 * {String} An XML string presenting what input is given.
                 *
                 * Throws:
                 * {LayerNullEx} No layer could be found, which could be used
                 *     to create the string.
                 * {UnsupportedLayerTypeEx} The type of the selected layer is 
                 *     unsupported. Supported layers include <OpenLayers.Layer.WFS>,
                 *     <OpenLayers.Layer.WMS> and <WOC.VectorStoringGML>
                 */
                 this.getInputXMLStrFromDOMElement = function(element, map) {
                         var inputsXMLStr = "";
                         var optionIndex = element.options.selectedIndex;
                         var layerName = element.options[optionIndex].firstChild.nodeValue;
                         var layerValue = "";
                         if(element.options[optionIndex].hasAttribute('value')) {
                                 layerValue = element.options[optionIndex].attributes.
                                                 getNamedItem('value').nodeValue;
                         }
                         var layer = null;
                         for(var j=0; j<map.layers.length; j++) {
                                 if(layerValue == "") {
                                         // Comparing layer names.
                                         if(map.layers[j].name == layerName) {
                                                 layer = map.layers[j];
                                         }
                                 } else {
                                         // Comparing layer id's. This is the default choice!
                                         if(map.layers[j].id == layerValue) {
                                                 layer = map.layers[j];
                                         }
                                 }
                         }
                         if(!layer) { 
                                 throw 'LayerNullEx';
                         }
 						// ### This layer is deprecated. To be removed in OpenLayers 3.0. Instead use OpenLayers.Layer.Vector
                         if(layer.CLASS_NAME == "OpenLayers.Layer.WFS") {
                                 // reference to the original source is added to the request!
                                 var referenceString = layer.getFullRequestString();				// example: "http://giv-wps.uni-muenster.de:8080/geoserver/wfs?typename=ns1%3Atasmania_roads&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&SRS=EPSG%3A4326"
                                 // The ampersand needs to be replaced!
                                 //referenceString = referenceString.replace(/&/g,"&amp;");
                                 // escape(referenceString); // Can't be used!!!
                                 // referenceString = encodeURI(referenceString);
                                 
                                 // Check that the WMS or WFS supports the requested schema!
                                 //
                                 // The outputFormat attribute is used to specify what schema
                                 // description language should be used to describe features.
                                 // The default value of XMLSCHEMA means that the Web Feature
                                 // Service must generate a GML2 application schema that can
                                 // be used to validate the GML2 output of a GetFeature request
                                 // or feature instances specified in Transaction operations.
                                 var selectedSchema = "";
                                 var selectedMimeType = "";
                                 var selectedEncoding = "";
                                 // Use GML2 schema if available.
                                 for(var k=0; k<formats.length; k++) {
                                         var schema = formats[k].getSchema();
                                         if(schema != "" && schema.length > 32) {
                                                 if(schema.substring(0,32) ==
                                                                 "http://schemas.opengis.net/gml/2") {
                                                         selectedSchema = schema;
                                                         selectedMimeType = formats[k].getMimeType();
                                                         selectedEncoding = formats[k].getEncoding();
                                                         // Ending the loop. GML2 the favored schema!
                                                         k = formats.length;
                                                 } else if(schema.substring(0,32) == 
                                                                 "http://schemas.opengis.net/gml/3") {
                                                         selectedSchema = schema;
                                                         selectedMimeType = formats[k].getMimeType();
                                                         selectedEncoding = formats[k].getEncoding();
                                                 }
                                         }
                                 }
                                 if(selectedSchema.length > 32) {
                                         // A schema was found!
                                         if(referenceString.toLowerCase().search("&outputformat") == -1) {
                                                 // No output format has been defined!
                                                 if(selectedSchema.substring(0,32) == 
                                                                 "http://schemas.opengis.net/gml/2") {
                                                         referenceString += "&outputFormat=GML2";
                                                 } else if(selectedSchema.substring(0,32) == 
                                                                 "http://schemas.opengis.net/gml/3") {
                                                         referenceString += "&outputFormat=GML3";
                                                 }
                                         } else {
                                                 // Output format has already been defined.
                                                 // TODO Replace the old output format!?!?
                                                 
                                                 
                                                 
                                         }
                                 } else {
                                         // TODO No schema was found for the complex data!
                                         
                                         
                                         
                                 }
                                 if(referenceString.search("&BBOX") == -1) {
                                         // No bounding box is used!
                                         referenceString += "&BBOX=" + layer.getExtent().toBBOX(9);
                                         // referenceString += "&amp;BBOX=" + layer.getExtent().toBBOX(9);
                                 }
                                 //referenceString = referenceString.replace(/&/g,"&amp;");
                                 //.replace(/=/g,"%3D");
                                 //selectedMimeType = selectedMimeType.replace(/&/g,"&amp;");
                                 //.replace(/=/g,"%3D");
                                 //selectedSchema = selectedSchema.replace(/&/g,"&amp;");
                                 //.replace(/=/g,"%3D");
                                 //selectedEncoding = selectedEncoding.replace(/&/g,"&amp;");
                                 //.replace(/=/g,"%3D");
                                 inputsXMLStr += "<wps:Reference";
                                 // MIME type, encoding, schema (optional)!
                                 if(selectedMimeType != "") {
                                         inputsXMLStr += " mimeType=\"" + selectedMimeType + "\"";
                                         if(selectedSchema != "") {
                                                 inputsXMLStr += " schema=\"" + selectedSchema + "\"";
                                         }
                                         if(selectedEncoding != "") {
                                                 inputsXMLStr += " encoding=\"" + selectedEncoding + "\"";
                                         }
                                 }
                                 inputsXMLStr += " xlink:href=\"" + referenceString + "\"";
                                 // The default method is GET and we will use it!
                                 inputsXMLStr += " method=\"GET\"";
                                 inputsXMLStr += " />";
                         } 
 						// ### GML or KML OpenLayers.Layer.Vector
 						else if(layer.CLASS_NAME == "OpenLayers.Layer.Vector") {
                         	// WFS requested layerdata
                         	
                         	// #### Reference approach ###### reference to the original source is added to the request! WFS                       	
                         	/*var wfsReference = layer.protocol.url+"?";
                         	wfsReference += "SERVICE=WFS&";
                         	wfsReference += "VERSION=1.0.0&";
                         	wfsReference += "REQUEST=GetFeature&"
                         	wfsReference += "TYPENAME=";
                         		var featureNsSplit = layer.protocol.featureNS.split("/");		// "http://www.openplans.org/ns1" => split
                         		var featureNS = featureNsSplit[featureNsSplit.length-1];		// TODO: dirty hack
                         		wfsReference += featureNS+":"+layer.protocol.featureType+"&";	// example: ns1:tasmania_roads
                         	wfsReference += "SRS="+layer.protocol.srsName+"&";
                         	wfsReference += "OUTPUTFORMAT=GML3";
                         	
                         	wfsReference = wfsReference.replace(/&/g,"&amp;");//.replace(/=/g,"%3D");
                         																	/* example: http://giv-wps.uni-muenster.de:8080/geoserver/wfs?
                             																*			typename=ns1%3Atasmania_roads&
                             																*			SERVICE=WFS&
                             																*			VERSION=1.0.0&
                             																*			REQUEST=GetFeature&
                             																*			SRS=EPSG%3A4326
                             																*/
                             																/* 		    http://ows7.lat-lon.de/haiti-wfs/services?
                             																 * 			service=WFS&amp;
                             																 * 			request=getfeature&amp;
                             																 * 			typename=app:hti_wellsprp_well_minustah&amp;
                             																 *	 		outputFormat=GML3&amp;
                             																 * 			version=1.1.0"
                             																 */
                             /*inputsXMLStr += "<wps:Reference";
                             inputsXMLStr += " schema=\"http://schemas.opengis.net/gml/3.1.1/base/feature.xsd\"";
                             inputsXMLStr += " xlink:href=\"" + wfsReference + "\"";
                             // The default method is GET and we will use it!
                             inputsXMLStr += " method=\"GET\"";								// TODO: POST METHOD!
                             inputsXMLStr += " />";*/
                         	
                         	//#### get the GML or KML from the map layer and add it to the wps execute reuquest #####
                             if(layer.features.length != 0) {
 								
 								// ### determine which layer type: GML or KML
 								
 								// ### layer has been created from file -> data approach
 								if(layer.protocol.CLASS_NAME == "OpenLayers.Protocol.HTTP"){
 									switch(layer.protocol.format.CLASSNAME){
 										case "OpenLayers.Format.KML":		// TODO!
 											alert("KML datei");
 											inputsXMLStr += "<wps:Data><wps:ComplexData";                              
 											inputsXMLStr += " mimeType=\"text/xml\"";				// MIME type, encoding, schema (optional)!
 											inputsXMLStr += " encoding=\"UTF-8\"";
 											inputsXMLStr += " schema=\""+ layer.protocol.format.kmlns +"\"";
 											inputsXMLStr += ">";  
 											
 											var kmlFormat = new OpenLayers.Format.KML();				
 											kmlData = kmlFormat.write(layer.features);											
 											
 											if(kmlData.match(/&amp;/g) == null){
 												kmlData = kmlData.replace(/&/g,"&amp;");
 											}
 											else if(kmlData.match(/-/g) != null){
 												kmlData = kmlData.replace(/-/g,"&#45;");
 											}
 											
 											inputsXMLStr += kmlData;
 											
 											inputsXMLStr += "</wps:ComplexData></wps:Data>";												
 											break;
 										/*case "OpenLayers.Format.GML":		// TODO!
 											alert("GML datei");
 											inputsXMLStr += "<wps:Data><wps:ComplexData";                              
 											inputsXMLStr += " mimeType=\"text/xml\"";				// MIME type, encoding, schema (optional)!
 											inputsXMLStr += " encoding=\"UTF-8\"";
 											inputsXMLStr += " schema=\""+ layer.protocol.format.gmlns +"\"";
 											inputsXMLStr += ">"; 		
 											
 											var gmlFormat = new OpenLayers.Format.GML.v3;					
 											inputsXMLStr += gmlFormat.write(layer.features);											
 											
 											inputsXMLStr += "</wps:ComplexData></wps:Data>";											
 											break;*/
 										default:
 											alert("Exception in getInputXMLStrFromDOMElement: "+
 												"Layer Format unknown.");
 									}
 								}
 								// ### layer has been created from WFS
 								else if(layer.protocol.CLASS_NAME == "OpenLayers.Protocol.WFS" ||
 										layer.protocol.CLASS_NAME == "OpenLayers.Protocol.WFS.v1" ||
 										layer.protocol.CLASS_NAME == "OpenLayers.Protocol.WFS.v1_0_0" ||
 										layer.protocol.CLASS_NAME == "OpenLayers.Protocol.WFS.v1_1_0")
 								{
 									if(layer.protocol.outputFormat == "GML3"){
 										
 										// #### Reference approach ###### reference to the original source (WFS) is added to the request                      	
 										var wfsReference = layer.protocol.url+"?";
 										wfsReference += "SERVICE=WFS&";
 										wfsReference += "VERSION=1.0.0&";
 										wfsReference += "REQUEST=GetFeature&"
 										wfsReference += "TYPENAME=";
 											var featureNsSplit = layer.protocol.featureNS.split("/");		// "http://www.openplans.org/ns1" => split
 											var featureNS = featureNsSplit[featureNsSplit.length-1];		// TODO: dirty hack
 											wfsReference += featureNS+":"+layer.protocol.featureType+"&";	// example: ns1:tasmania_roads
 										wfsReference += "SRS="+layer.protocol.srsName+"&";
 										wfsReference += "OUTPUTFORMAT=GML3";
 										
 										wfsReference = wfsReference.replace(/&/g,"&amp;");
 										
 										inputsXMLStr += "<wps:Reference";
 										inputsXMLStr += " schema=\"http://schemas.opengis.net/gml/3.1.1/base/feature.xsd\"";
 										inputsXMLStr += " xlink:href=\"" + wfsReference + "\"";
 										// The default method is GET and we will use it!
 										inputsXMLStr += " method=\"GET\"";								// TODO: POST METHOD
 										inputsXMLStr += " />";
 										
 										/* ### data approach - reading the GML from the OpenLayers.Layer.Vector ####	// TODO!
 										inputsXMLStr += "<wps:Data><wps:ComplexData";                              
 										inputsXMLStr += " mimeType=\"text/xml\"";				// MIME type, encoding, schema (optional)!
 										inputsXMLStr += " encoding=\"UTF-8\"";
 										inputsXMLStr += " schema=\"http://schemas.opengis.net/gml/3.1.1/base/feature.xsd\"";		// TODO
 										inputsXMLStr += ">"; 
 										
 										var gmlOptions = {
 											featurePrefix: layer.protocol.featurePrefix,
 											featureType: layer.protocol.featureType,	// example: "tasmania_fires"
 											featureNS: layer.protocol.featureNS		// "http://www.openplans.org/ns3"
 										};				
 										format = new OpenLayers.Format.GML.v3(gmlOptions);					
 										layerXML = format.write(layer.features);*/
 									
 									} else {
 										alert("Exception in getInputXMLStrFromDOMElement: "+
 												"WFS GML layer should have outputFormat GML3.");
 									}
 								}										
                             } else {
 							    alert("Exception in getInputXMLStrFromDOMElement: "+
 										"Layer features are empty!");
 							}              	
                         }
                         else if(layer.CLASS_NAME == "OpenLayers.Layer.WMS") {
                                 // reference to the original source is added to the request!
                                 var referenceString = layer.getFullRequestString();
                                 // Create a bounding box for the current view!
                                 if(referenceString.search("&BBOX") == -1) {
                                         // No bounding box is used!
                                         referenceString += "&BBOX=" + 
                                                 encodeURI(layer.getExtent().toBBOX(9));
                                 }
                                 referenceString = referenceString.replace(/&/g,"&amp;");
                                 inputsXMLStr += "<wps:Reference";
                                 // TODO MIME type, encoding, schema (optional) to referenced WMS query!
                                 inputsXMLStr += " xlink:href=\"" + referenceString + "\"";
                                 // The default method is GET and we will use it!
                                 inputsXMLStr += " method=\"GET\"/>";
                         } 
 						// the layer stores GML which is a wps response. the VectorStoringGML class extends the OpenLayers.Layer.Vector class
 						// and just adds a gml attribute to it.
 						else if(layer.CLASS_NAME == "WOC.VectorStoringGML") {
                                 if(layer.features.length != 0) {
                                         inputsXMLStr += "<wps:Data><wps:ComplexData";
                                         inputsXMLStr += " mimeType=\"text/xml\"";
                                 		//inputsXMLStr += " schema=\""+ layer.protocol.format.gmlns +"\"";
 										inputsXMLStr += " schema=\"http://schemas.opengis.net/gml/3.1.1/base/feature.xsd\"";
                                         inputsXMLStr += " encoding=\"UTF-8\"";
                                         inputsXMLStr += ">";
 										
 										var layerGML = layer.getGML();
 										
 										if(layerGML.match(/&amp;/g) == null){
 											layerGML = layerGML.replace(/&/g,"&amp;");
 										}
 										else if(layerGML.match(/-/g) != null){
 											layerGML = layerGML.replace(/-/g,"&#45;");
 										}
                                         
 										inputsXMLStr += layerGML;
                                         
 										inputsXMLStr += "</wps:ComplexData></wps:Data>";
                                 }
                         } else if(layer.CLASS_NAME == "WOC.VectorStoringKML") {
                                 if(layer.features.length != 0) {
                                         inputsXMLStr += "<wps:Data><wps:ComplexData";
                                         inputsXMLStr += " mimeType=\"text/xml\"";
                                 		//inputsXMLStr += " schema=\""+ layer.protocol.format.kmlns +"\"";
 										inputsXMLStr += " schema=\"http://schemas.opengis.net/kml/2.2.0/ogckml22.xsd\"";
                                         inputsXMLStr += " encoding=\"UTF-8\"";
                                         inputsXMLStr += ">";
 										
 										var layerKML = layer.getKML();
 										
 										if(layerKML.match(/&amp;/g) == null){
 											layerKML = layerKML.replace(/&/g,"&amp;");
 										}
 										else if(layerKML.match(/-/g) != null){
 											layerKML = layerKML.replace(/-/g,"&#45;");
 										}
                                         
 										inputsXMLStr += layerKML;
                                         
 										inputsXMLStr += "</wps:ComplexData></wps:Data>";
                                 }
                         } 						
 						else {
                                 throw 'UnsupportedLayerTypeEx';
                         }
                         return inputsXMLStr;
                 }
                 
                 /**
                  * Method: getInputBase64EncodedSHPFromDOMElement
                  *     Sets the complex input data in case there is a shp file selected.
                  * Parameters:
                  * element - {DOMElement} Element, whose value has the shp file
                  *
                  * Returns:
                  * {String} An XML string presenting what input is given.
                  *
                  * Throws:
                  * {LayerNullEx} No layer could be found, which could be used
                  *     to create the string.
                  * {UnsupportedLayerTypeEx} The type of the selected layer is 
                  *     unsupported. Supported layers include <OpenLayers.Layer.WFS>,
                  *     <OpenLayers.Layer.WMS> and <WOC.VectorStoringGML>
                  */
                  this.getInputBase64EncodedSHPFromDOMElement = function(element) {
                     
        				var inputsXMLStr = "";										// the result string
        					inputsXMLStr += "<wps:Data><wps:ComplexData";                              
        					inputsXMLStr += " mimeType=\"application/x-zipped-shp\"";		// MIME type, encoding, schema (optional)!
        					inputsXMLStr += " encoding=\"Base64\"";
        					inputsXMLStr += ">";  

        					//alert(encode6422(element.files[0].getAsBinary()));
        					inputsXMLStr += encode6422(element.files[0].getAsBinary());
        				 
        					inputsXMLStr += "</wps:ComplexData></wps:Data>";
                     						
        					//else {
                         //         throw 'UnsupportedLayerTypeEx';
                         //}
                     return inputsXMLStr;
                  }
         },
         
        CLASS_NAME:"WOC.ComplexData"
});