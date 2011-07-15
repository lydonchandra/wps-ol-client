/**
* 52°North WPS OpenLayers Client
* for using WPS-based processes in browser-based applications.
* 
* Copyright (C) 2010
* Janne Kovanen, Finnish Geodetic Institute
* Raphael Rupprecht, Institute for Geoinformatics
* 52North GmbH
* 
* This program is free software; you can redistribute it and/or
* 
* modify it under the terms of the GNU General Public License
* as published by the Free Software Foundation; either version 2
* of the License, or (at your option) any later version.
* 
* This program is distributed in the hope that it will be useful,
* 
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
* 
* You should have received a copy of the GNU General Public License
* 
* along with this program; if not, write to the Free Software
* Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
**/

	function WFSClient(initial_services) {
		var control = { };    					
		
		control.CLASS_NAME = "WFSClient";
		control.services = initial_services;
		control.features = [];
		
		// the jQuery selectors
		control.div = 				null;		// attention: div.wfsControlDiv (is a class, not an id)
		control.serviceSelect = 	null;
		control.addServiceText = 	null;
		control.featureSelect = 	null;
			
		control.init = function(){
			this.loadHTML();
		};
		
		control.loadHTML = function(){
			var div_opener = $("<div id='wfs_control_opener'></div>"); 
			var div_closer = $("<div id='wfs_control_closer'>X</div>");
			var div = $("<div class='wfsControlDiv' style='display:none;'></div>");
			this.div = div;
			$("body").append(div_opener).append(div);
			
			div_opener.click(function(event){
				//div.css("visibility","visible");
				wfsClient.div.show("fast");
				event.stopPropagation();
			});
			this.div.append(div_closer);
			div_closer.click(function(event){
				wfsClient.div.hide("fast");
				event.stopPropagation();
			});

			div.append(
				"<h1>WFS Control</h1>"+
				
				"Add WFS service:<br />"+
				"<input id='addServiceText' type='text' size='50' />"+
				"<input id='addServiceButton' type='button' size='50' value='Add' />"+
				
				"Current selected service:<br />"+
				"<select id='services'></select>"+
				
				"<p><div id='featureSelectContainer'></div></p>"
			);
			this.serviceSelect = $("select#services");
			this.addServiceText = $("input#addServiceText");
		
			
			// add the service URLs to the selectServices GUI element, after that, call the getCapabilities of this service
			this.fillServices();			
			
			this.activateListener("addServiceButton"); 	// activate the GUI listener			
			this.activateListener("services"); 			// activate the GUI listener: on change of the selectService selectBox		
		};
		

		/**
		* Fills the services selectbox by reading the services array 
		*/		
		control.fillServices = function(){			
			// case: no service in the initial_services array
			if(this.services.length == 0){
				this.alert("error","No WFS service in the list.");
				return;
			}
			
			// set the loading icon
			$("div#featureSelectContainer").html("<img src='img/loader.gif' border='0' />");
			
			for(var i=0; i< this.services.length; i++){
				this.serviceSelect.append("<option value='"+this.services[i]+"'>"+this.services[i]+"</option>");
			}
			
			// getCapabilities of the selected service
			this.getCapabilities(this.getCapabilitiesSuccess, this.getCapabilitiesFailure);
		};
		
		/**
		*
		*/		
		control.activateListener = function(id){
			var selector = $("#"+id);
			switch(id){
				case "addServiceButton":
					/*
					* 0. clear the old featureSelect if there is one
					* 1. get the newServiceURL from the input (check if its valid)
					* 2. add the service URL to the services array (if not already inside)
					* 3. add the service URL as select option and mark it as selected
					* 4. clear the input element
					* 5. call the getCapabilities - it will take the currently selected service URL 
					*/
					selector.click(function(){															
						
						var newServiceURL = wfsClient.addServiceText.val();								// 1. 
						if(!wfsClient.isValidURL(newServiceURL)){ 										// 1.2
							wfsClient.alert("error","The service URL is invalid."); 
							return;
						}						
						
						if(wfsClient.isURLinSericeList(newServiceURL)){ 								// 2.
							wfsClient.alert("error","The service URL is already in the list."); 
							wfsClient.addServiceText.val("");	// clear the url from the input
							return; 
						}	
						
						// set the loading icon 
						$("div#featureSelectContainer").html("<img src='img/loader.gif' border='0' />");							
						
						wfsClient.services.push(newServiceURL);											// 2.
						
						wfsClient.serviceSelect.append("<option value='"+newServiceURL+"'>"+newServiceURL+"</option>");		// 3.1
						wfsClient.serviceSelect.val(newServiceURL);												// 3.2
						wfsClient.addServiceText.val("");													// 4.
						
						wfsClient.clearAlert();									// clear old alert messages	
						
						wfsClient.getCapabilities(wfsClient.getCapabilitiesSuccess, wfsClient.getCapabilitiesFailure);
					});
					break;	
				case "addFeatureToMapButton":
					selector.click(function(){
						wfsClient.clearAlert();									// clear old alert messages
						// get the featureType that is selected
						var name = wfsClient.featureSelect.val();			// example: ns1:tasmania_roads
						
						// add the wfs feature as OpenLayers.Layer.Vector to the map
						wfsClient.addWfsLayerToMap(name);
					});
					break;	
				case "services":
					selector.change(function(){
						//var newServiceURL = $(this).val();
						// set the loading icon 
						$("div#featureSelectContainer").html("<img src='img/loader.gif' border='0' />");						
						
						wfsClient.getCapabilities(wfsClient.getCapabilitiesSuccess, wfsClient.getCapabilitiesFailure);
					});
					break;
			}
		};
		
		/**
		* Takes the current selected service in the serviceSelect and requests its get capabilities
		*/
		control.getCapabilities = function(targetSuccessFunction, targetFailureFunction){
			var requestXML = "<?xml version='1.0' encoding='UTF-8'?>";
				requestXML += 					
						'<wfs:GetCapabilities'+
							' service="WFS"'+
							' version="1.0.0"'+
							' xmlns:wfs="http://www.opengis.net/wfs"'+
							' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
							' xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd"'+
						'/>';
				
			var options = new Object();
				options.method = 'POST';
				options.asynchronous = true;
				options.contentType = 'text/xml';
				options.onComplete = OpenLayers.Function.bind(targetSuccessFunction, this);
				options.onFailure = OpenLayers.Function.bind(targetFailureFunction, this);
				options.postBody = requestXML;
			
			var url = this.serviceSelect.val();
			
			new OpenLayers.Ajax.Request(url, options);
		};
		
		control.getCapabilitiesSuccess = function(response){
			var xml = response.responseText;
			
			var wfsFeatures = [];
				wfsFeatures = this.parseXML(xml, "FeatureType");
				
			
			if(wfsFeatures.length == 0){
				this.alert("error","Parsing the GetCapabilities failed!");
				$("div#featureSelectContainer").html(" ");
			} else {
				// create a selectbox out of the featureTypes
				$("div#featureSelectContainer").html(
					"WFS Features: <br />"+
					"<select id='features'></select>"+
					"<input id='addFeatureToMapButton' type='button' value='Add to map' />"
				);
				this.activateListener("addFeatureToMapButton");
				
				this.featureSelect = $("select#features");	
				
				for(var i=0; i< wfsFeatures.length; i++){
					var name = wfsFeatures[i].find("Name").text();
					
					// save an assosiative array of the featureNames and feature nodes
					this.features[name] = wfsFeatures[i];
					
					this.featureSelect.append("<option value='"+name+"'>"+name+"</option>");
				}
				
			}
		};
		
		control.getCapabilitiesFailure = function(){
			this.alert("error","WFS request failed, check your URL.");
		};
		
		control.addWfsLayerToMap = function(name){
			//var featureNode = this.features[name];
			var featureNS = wfsClient.features[name][0].featureNS;
			
			// case: first entering this method, the featureNamespace is unknown, first send describeProcess
			if(featureNS == undefined){
				this.describeFeatureAndSetNamespace(name);		// will call this method (addWfsLayerToMap) again, to enter the else 				
			} 
			// case: the describeProcess has been processed and the namespace is now set
			else {
				var name = name.split(":")[1];											// example: ns1:tasmania_roads -> tasmania_road					
				
				var in_options = {
					'internalProjection': new OpenLayers.Projection("EPSG:4326"),		//TODO: get the map projection
					'externalProjection': new OpenLayers.Projection("EPSG:4326")
				};			
				var gmlOptions = {
					featureType: name /*"tasmania_roads"*/,
					featureNS: featureNS //"http://www.openplans.org/ns1"
				};				
				var gmlOptionsIn = OpenLayers.Util.extend(
					OpenLayers.Util.extend({}, gmlOptions),
					in_options
				);
				var vectorLayer = new OpenLayers.Layer.Vector(name+" GML3, WFS 1.0.0", {
					strategies: [new OpenLayers.Strategy.BBOX()],								// only pulls the feature currently visible in the map display
					protocol: new OpenLayers.Protocol.WFS({
						url: this.serviceSelect.val(),
						featureType: name,									// required
						featureNS: featureNS,								// optional
						version: "1.0.0",
						formatOptions: {outputFormat: 'GML3'},			
						outputFormat: "GML3",
						readFormat: new OpenLayers.Format.GML.v3(gmlOptionsIn)					// GML3 parser with options
					})
				});	
				
				map.addLayer(vectorLayer);
				map.setCenter(map.getCenter());			// TODO: find the right redraw method...
				map.controls[8].updateDescription()		// update the WPS controls, that there are new layers
			}
			

		};
		
		control.describeFeatureAndSetNamespace = function(typeName){
			var requestXML = '<?xml version="1.0" ?>'+
				'<wfs:DescribeFeatureType'+
				  ' service="WFS"'+
				  ' version="1.0.0"'+
				  ' xmlns:wfs="http://www.opengis.net/wfs"'+
				  ' xmlns:myns="http://www.example.com/myns"'+
				  ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
				  ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"'+
				  ' xsi:schemaLocation="http://www.opengis.net/wfs ../wfs/1.0.0/WFS-basic.xsd">'+
				  ' <wfs:TypeName>'+typeName+'</wfs:TypeName>'+
				'</wfs:DescribeFeatureType>';

			var options = new Object();
				options.method = 'POST';
				options.asynchronous = true;
				options.contentType = 'text/xml';
				options.onComplete = OpenLayers.Function.bind(this.describeFeatureTypeSuccess, this);
				options.onFailure = OpenLayers.Function.bind(this.describeFeatureTypeFailure, this);
				options.postBody = requestXML;
			
			var url = this.serviceSelect.val();
			
			new OpenLayers.Ajax.Request(url, options);				

		};
		
		control.describeFeatureTypeSuccess = function(response){
			var xml = response.responseText;
			//alert(xml);
			
			// get the featureNamespace
			var featureNS = $(xml).attr("targetNamespace");	
			
			// save the Namespace to to nodeObject in the features array
			this.features[this.featureSelect.val()][0].featureNS = featureNS;
			
			this.addWfsLayerToMap(this.featureSelect.val());
		};
		
		control.describeFeatureTypeFailure = function(response){
			alert("Error sending describeFeature.");
		};	

		
		
		
		// ### help functions ###
		
		

		/**
		*
		* @param: elemNamesToGet - String of the node name, which should be returned as an array of nodes
		*/
		control.parseXML = function(xmlDoc, elemNamesToGet){

			var nodes = [];
		
			//find every elemNamesToGet
			$(xmlDoc).find(elemNamesToGet).each(function()
			{
				//$("#output").append($(this).attr("author") + "<br />");
				nodes.push($(this));
			});
			
			return nodes;
		};
		
		control.alert = function(type, text){
			var color = "#000000";
			switch(type){
				case "error":
					color = "red";
					break;
			}
			
			var alertAlreadySet = false;
			if($("span#alertText").length > 0){
				alertAlreadySet = true;
				this.clearAlert();
			}
			
			if(alertAlreadySet){
				this.div.append("<p><span id='alertText' style='color:"+color+
					";font-weight:bold;padding:5px 10px 5px 10px;background-color:red;'><!--img src='img/error.png' /-->"+ text +"</span></p>");
				$("span#alertText").stop().animate({backgroundColor: "white"}); 		// jQuery ->UI<- animate extension
			} else {
				this.div.append("<p><span id='alertText' style='color:"+color+
					";font-weight:bold;padding:5px 10px 5px 10px;background-color:white;'><!--img src='img/error.png' /-->"+ text +"</span></p>");
			
			}
		};
		
		control.clearAlert = function(){
			if($("span#alertText").length > 0){
				$("span#alertText").remove();
			}
		};		
		
		control.isValidURL = function(url){
			var valid = true;
			
			if(url.substr(0,7) != "http://"){
				valid = false;
			}
			
			return valid;
			//return url.match(/^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/);
		};
		
		control.isURLinSericeList = function(url){
			var found = false;
			for(var i=0; i< this.services.length; i++){
				if(this.services[i] == url){ 
					found = true; 
					break;
				}
			}
			return found;
		};
		
		return control;
	}