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
 * Class: WOC.WPSClient
 *     This is the WPS Client control for OpenLayers.
 *
 * Inherits from:
 *     <OpenLayers.Control>
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 *
 * Updated:
 *    26.09.2008 - Settings - Possibility to select a method.
 */
WOC.WPSClient = OpenLayers.Class(OpenLayers.Control, {
        /**
     * Property: activeColor
         * {String} Color used in the control's background.
     */
        activeColor:"#63C4E4",     // darkblue
        /**
     * Property: wpsServiceContainer
         * {WOC.WPSServiceContainer} Container for the WPS service instances.
     */
        wpsServiceContainer:null,

        /**
     * Property: wpsDiv
         * {DOMElement}
     */
        wpsDiv:null,

        /**
     * Property: processesDiv
         * {DOMElement} The element contains a label and all process offerings.
     */
        processesDiv:null,

        /**
     * Property: processDiv
         * {DOMElement} The element contains a label and all inputs of a process.
     */
        processDiv:null,

        /**
        * Property: processInputsDiv
        * {DOMElement}
        */
        processInputsDiv:null,

        /**
     * Property: wpsProcessResultDiv
         * {DOMElement} The div is used for literal output.
     */
        wpsProcessResultDiv:null,

        /**
     * Property: wpsProcessResultDiv
         * {DOMElement} The div is used to show the running processes.
     */
        wpsRunningProcessesDiv:null,

        /**
     * Property: literalOutputTable
         * {DOMElement} The table is used to show the literal output.
     */
        literalOutputTable:null,

    /**
     * Property: minimizeDiv
         * {DOMElement} Div containing the image that is used to minimize the
         *     WPS client control.
     */
    minimizeDiv:null,

    /**
     * Property: maximizeDiv
         * {DOMElement} Div containing the image that is used to maximize the
         *     WPS client control.
     */
    maximizeDiv:null,

        /**
     * Property: infoTextNode
         * {DOMElement}
     */
        infoTextNode:null,

        /**
     * Property: infoTextFont
         * {DOMElement}
     */
        infoTextFont:null,

        /**
     * Property: serviceTextField
         * {DOMElement}
     */
        serviceTextField:null,

        /**
     * Property: serviceList
         * {DOMElement}
     */
        serviceList:null,

        /**
     * Property: processSelection
         * {DOMElement}
     */
        processSelection:null,

        /**
        * Property: processResultLayer
        * {Array of OpenLayers.Layer} The layers where the reults are shown.
        * RRR0: the processResultLayer is an array now (see the constructor initialize())
        */
        processResultLayer:null,

        /**
        * Property: getCapabilitiesMethod
        * {String} The method used for the GetCapabilities-operation.
        */
        getCapabilitiesMethod:"GET",

        /**
        * Property: describeProcessMethod
        * {String} The method used for the DescribeProcess-operation.
        */
        describeProcessMethod:"GET",

        /**
        * Property: executeMethod
        * {String} The method used for the Execute-operation.
        */
        executeMethod:"POST",

        /**
        * Property: runningExecutionsDiv
        * {DOMElement} A div containing information on the running process
        *     executions.
        */
        runningExecutionsDiv:null,

        /**
        * Property: wpsSettingsDiv
        * {DOMElement} A div having some settings for the requests.
        *     The settings includes method alternatives
        *         GET with KVP encoding
        *         POST with XML encoding
        *         SOAP
        */
        wpsSettingsDiv:null,

    isMouseDown:false,

        /**
         *
     * Constructor: WOC.WPSClient
     *
     * Parameters:
         * {Object} options
     */
    initialize:function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
                this.wpsServiceContainer = new WOC.WPSServiceContainer();
                this.processResultLayer = new Array();
    },

        /**
     * Method: Destroys the WPS client.
     */
    destroy:function() {
                OpenLayers.Event.stopObservingElement(this.div);
        OpenLayers.Event.stopObservingElement(this.minimizeDiv);
        OpenLayers.Event.stopObservingElement(this.maximizeDiv);
        //clear out layers info and unregister their events
        this.clearLayersArray("base");
        this.clearLayersArray("data");

        this.map.events.un({
            "addlayer": this.redraw,
            "changelayer": this.redraw,
            "removelayer": this.redraw,
            "changebaselayer": this.redraw,
            scope: this
        });
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

        /**
         * Method: setMap
     * Parameters:
         * {OpenLayers.Map} map
     */
    setMap:function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
        this.map.events.on({
            "addlayer": this.redraw,
            "changelayer": this.redraw,
            "removelayer": this.redraw,
            "changebaselayer": this.redraw,
            scope: this
        });
    },

        /**
     * Method: draw
         *
         * Returns:
         *     {DOMElement} A reference to the DIV DOMElement containing the client.
     */
    draw:function() {
        OpenLayers.Control.prototype.draw.apply(this);
        // Create layout divs.
        this.loadContents();
        // Set mode to minimize.
        if(!this.outsideViewport) {
            this.minimizeControl();
        }
        return this.div;
    },

    /**
     * Method: showControls
         *     Hide/Show all WPS Client controls depending on whether we are
     *     minimized or not
         *
     * Parameters:
         * {Boolean} minimize
     */
    showControls:function(minimize) {
        this.maximizeDiv.style.display = minimize ? "" : "none";
        this.minimizeDiv.style.display = minimize ? "none" : "";
        this.wpsDiv.style.display = minimize ? "none" : "";
    },

        /**
     * Method: maximizeControl
         *     Set up the labels and divs for the control
         *
     * Parameters:
         * {Event} event
     */
    maximizeControl:function(event) {
        this.div.style.width = "30em";
        this.div.style.height = "";
        this.showControls(false);
        if (event != null) {
            OpenLayers.Event.stop(event);
        }
    },

        /**
     * Method: minimizeControl
         *     Hide all the contents of the control, shrink the size, add the
         *     maximize icon
         *
     * Parameters:
         * {Event} event
     */
    minimizeControl:function(event) {
        this.div.style.width = "0px";
        this.div.style.height = "0px";
        this.showControls(true);
        if (event != null) {
            OpenLayers.Event.stop(event);
        }
    },

        /**
     * Method: loadContents
         *     Set up the labels and divs for the control.
     */
    loadContents:function() {
            // Ignoring some events!
            // OpenLayers.Event.observe(this.div, "click", this.ignoreEvent);
        OpenLayers.Event.observe(this.div, "mouseup", this.ignoreEvent);
        OpenLayers.Event.observe(this.div, "mousedown", this.ignoreEvent);
        OpenLayers.Event.observe(this.div, "dblclick", this.ignoreEvent);

        // Configure main div. // hier werden die styles der WPS-CLIENT DIV gesetzt!
                // this.div.style.styleClass = "div";
                with(this.div.style) {
                        position = "absolute";
                        top = "0px";
                        right = "";
                        left = "50px";
                        fontFamily = "sans-serif";
                        fontWeight = "bold";
                        marginTop = "3px";
                        marginLeft = "3px";
                        marginBottom = "3px";
                        fontSize = "smaller";
                        color = "white";
                        backgroundColor = "transparent";
                }
        // Configure the wps functionality list div.
        this.wpsDiv = document.createElement("div");
                this.wpsDiv.id = "wpsDiv";
        this.wpsDiv.style.backgroundColor = this.activeColor;
                // Info text field.
                this.infoTextNode = document.createTextNode("");
                this.infoFont = document.createElement("font");
                this.infoFont.className = 'infoText'
                this.infoFont.appendChild(this.infoTextNode);
                var wpsInfoLabel = document.createElement('label');
                wpsInfoLabel.appendChild(this.infoFont);

                this.processesDiv = this.getNewProcessesDiv();
                this.processDiv = this.getNewProcessDiv();
                this.runningExecutionsDiv = this.getNewExecutionsDiv();
                this.wpsSettingsDiv = this.getNewSettingsDiv();
                with(this.wpsDiv) {
                        appendChild(this.getNewServicesDiv());
                        appendChild(this.processesDiv);
                        appendChild(this.processDiv);
                        appendChild(this.getNewAbstractDiv());
                        appendChild(this.runningExecutionsDiv);
                        appendChild(this.wpsSettingsDiv);
                        appendChild(wpsInfoLabel);
                }
                this.div.appendChild(this.wpsDiv);
                // Rounding the control's corners.
        OpenLayers.Rico.Corner.round(this.div, {corners: "tr br",      /* tr br = right, tl bl = left*/
                        bgColor: "transparent", color: this.activeColor, blend: false});
        OpenLayers.Rico.Corner.changeOpacity(this.wpsDiv, 0.75);
        var imgLocation = OpenLayers.Util.getImagesLocation();
        var sz = new OpenLayers.Size(18,18);
        var szWPS = new OpenLayers.Size(40,18);

        // Maximize button div.
        var img = imgLocation + 'layer-switcher-maximize_WPS.png';
        this.maximizeDiv = OpenLayers.Util.createAlphaImageDiv(
                        "OpenLayers_Control_MaximizeDiv", new OpenLayers.Pixel(10,10), szWPS, img, "absolute");
                this.maximizeDiv.className = 'minMax';
        OpenLayers.Event.observe(this.maximizeDiv, "click",
                    OpenLayers.Function.bindAsEventListener(
                                                this.maximizeControl, this));
        this.div.appendChild(this.maximizeDiv);

        // Minimize button div.
        img = imgLocation + 'layer-switcher-minimize.png';
        this.minimizeDiv = OpenLayers.Util.createAlphaImageDiv(
                        "OpenLayers_Control_MinimizeDiv", null, sz, img, "absolute");
                this.minimizeDiv.className = 'minMax';
                this.minimizeDiv.style.display = "none";
        OpenLayers.Event.observe(this.minimizeDiv, "click",
                    OpenLayers.Function.bindAsEventListener(
                                                this.minimizeControl, this));
        this.div.appendChild(this.minimizeDiv);
                // Add initial services and their data!
                for(var i=0; i<WOC.WPSClient.INITIAL_SERVICES.length; i++) {
                        this.addService(WOC.WPSClient.INITIAL_SERVICES[i]);
                }
    },

        /**
        * Method: addService
        *     Adds a service with the given url to service container.
        *     Informs how the adding went.
        *
        * Parameters:
        * {String} url The service instance's URL.
        */
        addService:function(url) {
                try {
                        this.wpsServiceContainer.addService(url, this);
                        var option = document.createElement('option');
                        // The actual name (title) is later on read from the
                        // capabilities' ServiceIdentifier!
                        option.text = url;
                        option.value = url;
                        this.serviceList.appendChild(option);
                        // Select the first item if the list has only one item!
                        if(this.serviceList.childNodes.length == 1) {
                                this.serviceList.selectedIndex = 0;
                        }
                        // this.serviceTextField.value = url;
                } catch(exception) {
                        // Service instance could not be set
                        if(exception == 'ServiceExistsEx') {
                                this.updateInfoText("Could not add service. " +
                                                "The WPS service is already in the list!", "red");
                        } else if(exception == 'URLEx') {
                                this.updateInfoText("Could not add service. " +
                                                "The WPS service instance URL is not an accepted URL!",
                                                "red");
                        }
                        // this.serviceList.removeChild(option);
                }
        },

        /**
        * Method: removeService
        *     Removes a service with the given url from the service container.
        *
        * Parameters:
        * url - {String} The service instance's URL.
        */
        removeService:function(url) {
                // Remove from the actual services list.
                this.wpsServiceContainer.removeService(url, this);
                // Remove from the service list options.
                var childNodes = this.serviceList.childNodes;
                for(var i=0; i<childNodes.length; i++) {
                        if(childNodes[i].value == url) {
                                this.serviceList.removeChild(
                                                childNodes[i]);
                        }
                }
                // Select some other service!
                if(this.serviceList.childNodes.length > 0) {
                        this.serviceList.selectedIndex = 0;
                        this.wpsServiceContainer.getService(
                                        this.serviceList.options[0].value).getCapabilities(
                                        this.getCapabilitiesMethod);
                } else {
                        this.processesDiv.style.display = 'none';
                        this.processDiv.style.display = 'none';
                }
        },

        /**
        * Method :updateCapabilities
        *     Updates the selected service's process list.
        */
        updateCapabilities:function() {
                // Update the names (titles) of the services in the service list!
                for(var i=0; i<this.serviceList.options.length; i++) {                     // Schleife über alle WPSServices in der SelectBox
                        var url =  this.serviceList.options[i].value;                      // option[i] URL
                        var wpsService = null;
                        try {
                                wpsService = this.wpsServiceContainer.getService(url);     // !!! WPSService[option[i]]
                                this.serviceList.options[i].firstChild.nodeValue =
                                                wpsService.getTitle()+" @ "+url;           // WPSService.getTitle() rr1
                        } catch(exception) {
                                if(exception == 'ServiceNotFoundEx') {
                                        // TODO Some more info to the user?
                                        return;
                                }
                        }
                        // ############## selected Service ######################################################################################
                        if(i == this.serviceList.selectedIndex) {                          // entering only when i is the selected Service zB "localhost:8080/wps/WebProcessingService"
                                while (this.processSelection.hasChildNodes()) {
                                        this.processSelection.removeChild(
                                                        this.processSelection.childNodes.item(0));
                                }

                                // Update processes!
                                this.updateInfoText("Updating capabilities for " + url, "green");
                                var processCount = wpsService.getProcessCount();                 // Anzahl der Prozesse im WPSService rr2

                                // ############ if selected Service has processes ##############################################################
                                if(processCount > 0) {                                           // Wenn Prozesse vorhanden...
                                        // Show the processes.
                                        this.processesDiv.style.display = 'block';
                                        if(processCount > WOC.WPSClient.MAX_SHOWN_PROCESSES) {
                                                this.processSelection.size =
                                                                WOC.WPSClient.MAX_SHOWN_PROCESSES;
                                        } else {
                                                this.processSelection.size = processCount;
                                        }

                                        // RR3
                                        // Setting the boolean isClientSupported for each process

                                        var processIdentifiers = new Array();
                                        // adding all process identifier to the array rr3
                                        for(process in wpsService.getProcesses()){
                                                  processIdentifiers.push(wpsService.getProcess(process).getIdentifier());
                                        }
                                        // rr4
                                        //set the isClientSupported boolean in WPSProcess with "NoUpdate" as success function
                                        wpsService.describeProcessGET(processIdentifiers,wpsService.getDescriptionSuccessNoUpdate,wpsService.getDescriptionFailure,false);
                                /*
                                        alert(wpsService.getProcess("org.n52.wps.server.algorithm.simplify.DouglasPeuckerAlgorithm").getIdentifier()+
                                        "\n" + wpsService.getProcess("org.n52.wps.server.algorithm.simplify.DouglasPeuckerAlgorithm").getisClientSupported());

                                        alert(wpsService.getProcess("org.n52.wps.server.algorithm.SimpleBufferAlgorithm").getIdentifier()+
                                        "\n" + wpsService.getProcess("org.n52.wps.server.algorithm.SimpleBufferAlgorithm").getisClientSupported());

                                        alert(wpsService.getProcess("visibility").getIdentifier()+
                                        "\n" + wpsService.getProcess("visibility").getisClientSupported());


                                        // Adding processes.
                                        // Going through each process.
                                        for(var processKey in wpsService.getProcesses()) {        // add process: <option value="p.getIdentifier()">p.getTitle()</option>
                                                var option = document.createElement('option');
                                                var process = wpsService.getProcess(processKey);
                                                option.text = process.getTitle();
                                                option.value = process.getIdentifier();

                                                //RR
                                                if(wpsService.getProcess(processKey).getisClientSupported()==true){
                                                       this.processSelection.appendChild(option);
                                                }
                                                else if(wpsService.getProcess(processKey).getisClientSupported()==false){
                                                     // dont add the process!
                                                }
                                                else{
                                                     // dont add the process!
                                                }

                                        }
                                */
                                }
                                this.updateInfoText("Updating capabilities...", 'green');
                        }
                        // ############## END selected Service ######################################################################################
                }
        },

        updateSelectedProcessViews:function(){
                        // Selecting the first process.
                        this.processSelection.selectedIndex = 0;
                        // Updating the process's description.
                        var processIdentifier = new Array();
                                  processIdentifier.push(this.processSelection.options[0].value);
                                  wpsService.describeProcesses(processIdentifier,this.describeProcessMethod);
        },

        /**
         * Wird von der WPSService.describeProcessResponseHandlind() Methode aufgerufen.
         *
         *
         * Method: updateDescription
         *     Updates the description of the selected process.
         */
         updateDescription:function() {
                 this.updateInfoText("Updating process description", 'green');
                 // Input choices.
                 var wpsService = this.wpsServiceContainer.getService(                                  // holt sich den aktuell ausgewählten WPSService
                                 this.serviceList.options[this.serviceList.selectedIndex].value);
                 var processIdentifier = this.processSelection.options[                                 // holt sich den aktuell ausgewählten Prozess des aktuell ausgewählten WPSService
                                 this.processSelection.selectedIndex].value;
                 if(wpsService.getProcess(processIdentifier).getInputsCount() == 0) {                   // wenn der Prozess keine inputs hat...
                         // No inputs!
                         this.updateInfoText("", null);
                         return;
                 }
                 var inputs = wpsService.getProcess(processIdentifier).getInputs();                     // holt sich die Inputs den aktuell ausgewählten Prozesses

                 if(inputs != null) {
                         this.processDiv.style.display = 'block';
                         // Removing the old process!
                         while(this.processInputsDiv.hasChildNodes()) {
                                 this.processInputsDiv.removeChild(
                                                 this.processInputsDiv.childNodes.item(0));
                         }

                         // Create a scrollable div.
                         var scrollableDiv = document.createElement('div');
                         scrollableDiv.id = "scrollableInputsDiv";
                         var dataTable = document.createElement('table');
                         dataTable.className = 'verticalArray';
                         // Create header row
                         var dataTableRow = document.createElement('tr');
                         var dataTableHeader0 = document.createElement('th');
                         dataTableHeader0.appendChild(document.createTextNode("Input title"));                    // die Überschrift 1 in der div
                         var dataTableHeader1 = document.createElement('th');
                         dataTableHeader1.appendChild(document.createTextNode("Usage"));                          // die Überschrift 2 in der div
                         dataTableHeader1.className = 'usageValue';
                         var dataTableHeader2 = document.createElement('th');
                         dataTableHeader2.appendChild(document.createTextNode("Value"));                          // die Überschrift 3 in der div
                         with(dataTableRow) {
                                 appendChild(dataTableHeader0);
                                 appendChild(dataTableHeader1);
                                 appendChild(dataTableHeader2);
                         }
                         dataTable.appendChild(dataTableRow);
                         // Going through each of the process's inputs.
                         for(var inputKey in inputs) {                                                            // gehe durch alle inputs des Prozesses
                                 inputs[inputKey].addDescriptionsToTable(dataTable, this.map);                    // ruft die addDescriptionsToTable Methode in WPSInputData auf
                         }
                         // Add the table to the div.
                         scrollableDiv.appendChild(dataTable);
                         						
 						// ### check if the process output is ComplexData
 						// ### if so, create a selectbox to let the user decide which outputFormat the process should have
 						for(var outputIdentifier in wpsService.getProcess(processIdentifier).getOutputs()) {
 							var wpsOutputData = wpsService.getProcess(processIdentifier).getOutputs()[outputIdentifier];
 							
 							var complexOutput = wpsOutputData.getComplexOutput();
 							
 							if(complexOutput != null) {                                      
 								var formats = complexOutput.getFormats();
 								
 								// the supported ComplexData types
 								/*var gml2Available = false;*/
 								var gml3Available = false; 
 								var gml3Schema = "";
 								var kmlAvailable = false;
 								var kmlSchema = "";
								var base64Encoded = false;
 								
 								var listOfSchemas = "";
 								
 								// Go through the supported schemas 
 								for(var k=0; k<formats.length; k++) {	
 									
 									listOfSchemas += formats[k].getSchema()+"<br />";
 									
 									// ### checking for GML 3 outputFormat
 									if(formats[k].getSchema() ==
 											"http://schemas.opengis.net/gml/3.1.1/base/feature.xsd" ||
 											formats[k].getSchema() ==
 											"http://schemas.opengis.net/gml/3.1.0/base/feature.xsd" ||
 											formats[k].getSchema() ==
 											"http://schemas.opengis.net/gml/3.0.1/base/feature.xsd" ||
 											formats[k].getSchema() ==
 											"http://schemas.opengis.net/gml/3.2.1/base/feature.xsd")
 									{
 										gml3Available = true;		
 										gml3Schema = formats[k].getSchema();
 									}
 									/* ### checking for GML 2 outputFormat
 									else if(formats[k].getSchema() == "http://schemas.opengis.net/gml/2.1.2/feature.xsd")
 									{
 										gml2Available = true;
 									}*/ 
 									// ### checking for KML 2.2 outputFormat
 									else if(formats[k].getSchema() == "http://schemas.opengis.net/kml/2.2.0/ogckml22.xsd")
 									{
 										kmlAvailable = true;
 										kmlSchema = formats[k].getSchema();
 									}
									
									// ### check if Base64 encoded input is allowed
									if(formats[k].getEncoding() == "Base64"){
										base64Encoded = true;
									}
 								}
 								
 								if(gml3Available || kmlAvailable){
 									// ### create a selection for choosing the process outputFormat (only visible in debug mode)
 									var outputFormatSelection = $("<select style='visibility:hidden;' id='outputFormatSelection'></select>");	// default: hidden!
									if(DEBUG_MODE){ outputFormatSelection.css("visibility","visible"); }	// only show this select in debug mode
 									if(gml3Available){
 										outputFormatSelection.append($('<option value="'+ gml3Schema +'">' 
 																		+ "GML 3" 
 																		+'</option>'));
 									}
 									if(kmlAvailable){
 										outputFormatSelection.append($('<option value="'+ kmlSchema +'" selected="selected">' 	// KML is prefered!
 																		+ "KML"
 																		+'</option>'));
 									}	
 									scrollableDiv.appendChild(outputFormatSelection[0]);									
 								}
								
								/* if base64Encoded Data is possible as input, create a file chooser for inviting the zipped SHP files
								if(base64Encoded){
									var shpFileChooser = $("SHP File <input type='file' name='shpFileChooser' class='browse' />");
									scrollableDiv.appendChild(shpFileChooser[0]);
								}*/
 								
 								if(DEBUG_MODE){
									// ### preparing the Output formats button, which shows the available output formats
									// for the process
									var listOfSchemasDiv = $("<div></div>")
										.css({
											"width":"500px",
											"height":"200px",
											"position":"absolute",
											"zIndex":"1050",
											"overflow":"auto",
											"border":"2px solid black",
											"left":"30%",
											"top":"30%",
											"background-color": "#666666",
											"color":"white",
											"font-family":"verdana",
											"font-size":"12px",
											"padding":"20px"
										})
										.html(listOfSchemas)
										.click(function(){
											$(this).remove();
										});
									var listOfSchemasButton = $("<button type='button'>Output formats</button>").click(function(){
										$("body").append(listOfSchemasDiv);
									});
									scrollableDiv.appendChild(listOfSchemasButton[0]);
								} 							
 							} 
 						} // ### END outputFormat = ComplexData	checking						
 						
 						this.processInputsDiv.appendChild(scrollableDiv);
 						
 						if(DEBUG_MODE){
							 // Add checkboxes for the process request and response
							 var popupTable = document.createElement('table');
							 var tableRow = document.createElement('tr');
							 this.getCheckboxRowForPopup(tableRow,
											 "Show Execute request", 'execute_request_popup');
							 this.getCheckboxRowForPopup(tableRow,
											 "Show Execute response", 'execute_response_popup');
							 popupTable.appendChild(tableRow);
							 this.processInputsDiv.appendChild(popupTable);
						}
                         // Create the execution button.
                         var executeButton = document.createElement('input');
                         with(executeButton) {
                                 type = 'button';
                                 value = "Execute";
                         }
                         OpenLayers.Event.observe(executeButton, "click",
                             OpenLayers.Function.bindAsEventListener(
                                                         this.executeButtonClick, this));
  						if(DEBUG_MODE){
  							// #### Create the checkbox for directing the executeDoc to the test.html, if checked
  								var span_testCheckBox = document.createElement("span");		// the container for the box and its label
  								var testCheckBoxLabel = document.createElement('label');	// the label
  								testCheckBoxLabel.innerHTML = "by test.html";
  								testCheckBoxLabel.style.fontSize = "11px";
  								testCheckBoxLabel.style.color = "white";
  								var testCheckBox = document.createElement('input');			// the box
  								testCheckBox.name = "testCheckbox";
  								testCheckBox.id = "testCheckbox";
  								with(testCheckBox) {
  										type = 'checkbox';
  										checked = false;
  								}
  								span_testCheckBox.appendChild(testCheckBoxLabel);
  								span_testCheckBox.appendChild(testCheckBox);
  							}
 						// added later to the div
                         
 						// #### Create the description button.

                         var descriptionButton = document.createElement('input');
                         with(descriptionButton) {
                                 type = 'button';
                                 value = "Show description";
                         }
                         descriptionButton.wpsClient = this;
                         OpenLayers.Event.observe(descriptionButton, "click",
                             OpenLayers.Function.bindAsEventListener(
                                                         this.descriptionButtonClick, this));
                         // Adding the buttons to a table
                         var buttonData0 = document.createElement('td');
                         with(buttonData0) {
                                 className = 'button';
                                 appendChild(executeButton);
                         }
                         var buttonData1 = document.createElement('td');
                         with(buttonData1) {
                                 className = 'button';
                                 appendChild(descriptionButton);
                         }
                         var buttonRow = document.createElement('tr');
                         buttonRow.appendChild(buttonData0);
                         if(DEBUG_MODE){ buttonRow.appendChild(span_testCheckBox); }		// test.html checkbox
						 buttonRow.appendChild(buttonData1);
                         
                         var buttonTable = document.createElement('table');
                         buttonTable.appendChild(buttonRow);
                         this.processInputsDiv.appendChild(buttonTable);
                         // this.processDiv.appendChild(buttonTable);
                         // this.processDiv.appendChild(descriptionButton);
                         this.updateInfoText("", null);
                 }
         },
         
        /**
        * Method: getCheckboxRowForPopup
        *     Adds to a given row a checkbox using an image.
        *
        * Parameters:
        * row - {DOMElement} A row to which the checkbox image is added
        * label - {String} Label of the checkbox.
        * id - {String} Identifier of the checkbox.
        */
        getCheckboxRowForPopup:function(row, label, id) {
                // Label
                var checkboxLabel = document.createElement('label');
                checkboxLabel.htmlFor = 'image_' + id;
                with(checkboxLabel) {
                        innerHTML = label;
                        className = 'popup_checkbox';
                }
                // Image for the checkbox
                var checkboxImg = document.createElement('img');
                checkboxImg.id = 'image_' + id;
                with(checkboxImg) {
                        src = 'img/cross_box.png';
                        alt = "Unchecked";
                }
                OpenLayers.Event.observe(checkboxImg, 'click',
                                OpenLayers.Function.bindAsEventListener(
                                                WOC.checkboxChecker, this));
                // Actual checkbox
                var checkbox = document.createElement('input');
                checkbox.name = id;
                checkbox.id = id;
                with(checkbox) {
                        type = 'checkbox';
                        checked = false;
                        className = 'hiddenCheckbox';
                }
                var tableData1 = document.createElement('td');
                tableData1.appendChild(checkboxLabel);
                row.appendChild(tableData1);
                var tableData2 = document.createElement('td');
                tableData2.appendChild(checkboxImg);
                tableData2.appendChild(checkbox);
                row.appendChild(tableData2);
        },

        /**
        * Method: executeResponseHandling
        *     This method is responsible for going trough the output of the
        *     Execute-response.
        *
        * Parameters:
        * process - (WOC.WPSProcess) Process, which was successfully run.
        * processOutputs - {DOMElement} The ouputs of the process execution.
        */
        executeResponseHandling:function(process, processOutputs) {
                var outputs = WOC.getElementsByTagNameNS(processOutputs,
                                WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 'Output');
                // var outputs = execution.getProcessOutputs(); // Returns the outputs DOMElement
                var hasLiteralOutput = false;
                for(var i=0; i<outputs.length; i++) {
                        var literalOutput = WOC.getElementsByTagNameNS(outputs[i],
                                        WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 'LiteralData');
                        if(literalOutput && literalOutput.length > 0) {
                                hasLiteralOutput = true;
                                i = outputs.length;
                        }
                }
                if(hasLiteralOutput) {
                        // If there is literal output then we need to show it to the user!
                        // Create a div for the literal output.
                        this.wpsProcessResultDiv = document.createElement('div');
                        this.wpsProcessResultDiv.id = "wpsProcessResultDiv";
                        // Create a label for the results.
                        var literalOutputLabel = document.createElement('div');
                        with(literalOutputLabel) {
                                innerHTML = OpenLayers.i18n('Process\' literal output');
                                className = 'wpsSubLabel';
                        }
                        this.wpsProcessResultDiv.appendChild(literalOutputLabel);
                        this.literalOutputTable = document.createElement('table');
                        this.wpsProcessResultDiv.appendChild(this.literalOutputTable);
                }
                for(var i=0; i<outputs.length; i++) {
                        // Each output has to have a title and identifier!
                        var outputTitle = WOC.getElementsByTagNameNS(outputs[i],
                                        WOC.OWS_NAMESPACE, WOC.OWS_PREFIX, 'Title')[0].
                                        firstChild.nodeValue;
                        var outputIdentifier = WOC.getElementsByTagNameNS(outputs[i],
                                        WOC.OWS_NAMESPACE, WOC.OWS_PREFIX, 'Identifier')[0].
                                        firstChild.nodeValue;
                        var dataNodes = WOC.getElementsByTagNameNS(outputs[i],
                                                 WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 'Data');
                        if(dataNodes && dataNodes.length > 0) {
                                this.executeResponseDataHandling(process, dataNodes[0],
                                                outputTitle, outputIdentifier);
                        } else {
                                var referenceNodes = WOC.getElementsByTagNameNS(outputs[i],
                                                 WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 'Reference');
                                if(referenceNodes && referenceNodes.length > 0) {
                                        this.executeResponseReferenceHandling(process,
                                                        referenceNodes[0], outputTitle, outputIdentifier);
                                } else {
                                        // TODO No data and no reference -> Exception
                                        alert("Error! No data or reference was found!!!");
                                }
                        }
                }
        },

        /**
         * Method: executeResponseDataHandling
         *     Shows the data, which has been directly given by the process, to the
         *     user.
         *
         * Parameters:
         * process - {WOC.WPSProcess} Process, which was successfully run.
         * data {DOMElement} The wps:Data element of the Execute response.
         * title - {String} Title of the data.
         * identifier - {String} Identifier of the output for which the data is.
         */
         executeResponseDataHandling:function(process, data, title, identifier) {
                 var literalOutputs = WOC.getElementsByTagNameNS(data, WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 'LiteralData');
                 var complexOutputs = WOC.getElementsByTagNameNS(data, WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 'ComplexData');
                 var bbOutputs = 	 WOC.getElementsByTagNameNS(data, WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 'BoundingBoxData');
                 
 				// ### case: response data is literal data
 				if(literalOutputs && literalOutputs.length > 0) {
                         // Show to the user the title and the output's content.
                         var literalOutputRow = document.createElement('tr');
                         var titleTableItem = document.createElement('td');
 							titleTableItem.appendChild(document.createTextNode(title));
 							literalOutputRow.appendChild(titleTableItem);
                         var contentTableItem = document.createElement('td');
 							contentTableItem.appendChild(literalOutputs[0]);
 							literalOutputRow.appendChild(contentTableItem);
                         // UoM

                         // data type

                         this.literalOutputTable.appendChild(literalOutputRow);

                         // deleting the output div, if existing
                         if(document.getElementById('wps_literalOutput')){
                             document.getElementById('container').removeChild(document.getElementById('wps_literalOutput'));
                         }

                         //alert(this.wpsProcessResultDiv.innerText);
                         var wps_literalOutput = document.createElement('div');            // rrLiteralOut
                             wps_literalOutput.id = 'wps_literalOutput';
                             wps_literalOutput.style.backgroundColor = 'grey';
                             wps_literalOutput.style.color = 'black';
                             wps_literalOutput.style.borderTop = '2px solid black';
                             wps_literalOutput.style.borderLeft = '2px solid black';
                             wps_literalOutput.style.borderRight = '2px solid black';
                             wps_literalOutput.style.borderBottom = '2px solid black';
                             wps_literalOutput.style.position = 'absolute';
                             wps_literalOutput.style.top = '50%';
                             wps_literalOutput.style.left = '50%';
                             wps_literalOutput.style.padding = '15px';
                             wps_literalOutput.style.zIndex = '1010';
                             wps_literalOutput.appendChild(this.wpsProcessResultDiv);

                         // creating a button to close the div
                         var closeButton = document.createElement('div');
                             closeButton.style.backgroundColor = 'darkgrey';
                             closeButton.style.color = 'black';
                             closeButton.style.cursor = 'pointer';
                             closeButton.style.fontFamily = 'Arial';
                             closeButton.style.fontWeight = 'bold';
                             closeButton.style.fontSize = '13';
                             closeButton.style.textAlign = 'center';
                             closeButton.style.border = '1px solid black';
                             closeButton.innerText = 'close';

                             // adding the click event
                             OpenLayers.Event.observe(closeButton, "click",
                                     OpenLayers.Function.bindAsEventListener(
 											this.closeButtonClick, closeButton));

                         wps_literalOutput.appendChild(closeButton);

                         document.getElementById('container').appendChild(wps_literalOutput);

                 } 
 				// ### case: literal data is ComplexData
 				else if(complexOutputs && complexOutputs.length > 0) {
                         var complexOutput = complexOutputs[0];
                         // Check if the schema, encoding and format are supported by the process!
                         var formats = process.getOutputs()[identifier].getComplexOutput().getFormats();
                         if(complexOutput.hasAttribute('mimeType')) {
                                 var mimeType = complexOutput.attributes.getNamedItem('mimeType').nodeValue;
                                 var supported = false;
                                 for(var j=0; j<formats.length; j++) {
                                         if(formats[j].getMimeType() == mimeType) {
                                                 supported = true;
                                         }
                                 }
                                 if(!supported) {
                                         alert("Error. The MIME type of complex output data is not supported!");
                                 }
                         }
                         if(complexOutput.hasAttribute('encoding')) {
                                 var encoding = complexOutput.attributes.getNamedItem('encoding').nodeValue;
                                 var supported = false;
                                 for(var j=0; j<formats.length; j++) {
                                         if(formats[j].getEncoding() == encoding) {
                                                 supported = true;
                                         }
                                 }
                                 if(!supported) {
                                         alert("Error. The encoding is not supported!");
                                 }
                         }
                         if(complexOutput.hasAttribute('schema')) {
                                 var schema = complexOutput.attributes.getNamedItem('schema').nodeValue;
                                 var supported = false;
                                 for(var j=0; j<formats.length; j++) {
                                         if(formats[j].getSchema() == schema) {
                                                 supported = true;
                                         }
                                 }
                                 if(!supported) {
                                         alert("Error. The schema is not supported!");
                                 }
                         }

                         var mimeType = "";
                         if(complexOutput.hasAttribute('mimeType')) {
                                 mimeType = complexOutput.attributes.getNamedItem('mimeType').nodeValue.toLowerCase();
                         } else {
                                 // TODO Unknown MIME type. Use the default format of the process description!
                                 mimeType = formats[0].getMimeType().toLowerCase();
                                 if(mimeType=="") {
                                         alert("Error. The MIME type of complex output data has not been given!");
                                 }
                         }

                         if(mimeType == "text/xml" || mimeType == "application/xml") { 					// GML data                              

                                 // getting the process identifiers to put them as names for the outputlayers.
 								// preparing processIdentifier for simpleBuffer and peucker, because their names are too long:
                                 var processIdentifier = null;
                                 if(process.getIdentifier() == "org.n52.wps.server.algorithm.SimpleBufferAlgorithm"){
                                       processIdentifier = "SimpleBuffer";
                                 }
                                 else if (process.getIdentifier() == "org.n52.wps.server.algorithm.simplify.DouglasPeuckerAlgorithm"){
                                       processIdentifier = "DouglasPeucker";
                                 }
                                 else {
                                       processIdentifier = process.getIdentifier();
                                 }
 								
 								/*
 								* 1. determine if the ComplexData is GML or KML
 								* 2. get the parser 
 								* 3. parse the data into OpenLayers.Feature.Vector (but store the data (gml/kml) in the layer)
 								* 4. create a new vector layer, to hold the features
 								* 5. make sure the map and data projections are the same
 								* 6. add the features to the layer
 								* 7. add the layer to the map
 								* 8. add the layer to the processResultLayers
 								*/
 								
 								// ### GML or KML response data?
 								switch(schema){
 									case "http://schemas.opengis.net/kml/2.2.0/ogckml22.xsd":
 										var kmlData = complexOutput.firstChild;
 										var kmlParser = new OpenLayers.Format.KML();										
 										var olFeatures = kmlParser.read(kmlData);		// parsing from KML to OL features
 										// var kmlString = kmlParser.write(olFeatures);
 										
 										var newKMLLayer = new WOC.VectorStoringKML(
 												"Process result "+(this.processResultLayer.length)+" "+processIdentifier+" ", {   // "Process result 1/2/.../n"
                                                 isBaseLayer:false,
                                                 visibility:true/*,
                                                 style:WOC.WPSClient.style['devel']*/});
 											newKMLLayer.addFeatures(olFeatures);
 											newKMLLayer.setKML(WOC.xml2Str(kmlData));			// the method why the VectorStoringKML class exists! just to save the GML string, to get it by process execution with this layer
 											newKMLLayer.setTileSize(512);
 										this.processResultLayer.push(newKMLLayer);
 										map.addLayer(newKMLLayer);									
 										break;
 									case "http://schemas.opengis.net/gml/3.1.1/base/feature.xsd":
 									case "http://schemas.opengis.net/gml/3.2.1/base/feature.xsd": 
 										var gmlData = complexOutput.firstChild;
 											// ### parser preperation
 											var sourceProjection = this.parseProjectionFromGML(gmlData);
 											var targetProjection = new OpenLayers.Projection(this.map.getProjection());
 											if(!sourceProjection){sourceProjection = targetProjection;}
 											var in_options = {
 												'internalProjection': sourceProjection,
 												'externalProjection': targetProjection
 											};			
 											var gmlOptions = {
 												featureType: gmlData.childNodes[0].childNodes[0].localName,		// example: "Feature"
 												featureNS: gmlData.childNodes[0].childNodes[0].namespaceURI 	// example: "http://www.52north.org/...-455f-a54a-34e06ac25df3"
 											};				
 											var gmlOptionsIn = OpenLayers.Util.extend(
 												OpenLayers.Util.extend({}, gmlOptions),
 												in_options
 											);	
 											// ### end of parser preperation										
 										var gmlParser = new OpenLayers.Format.GML.v3(gmlOptionsIn);
 										var olFeatures = gmlParser.read(gmlData);
 										//var gmlString = gmlParser.write(olFeatures);	// Problem: parsing just the features, will lead to GML featureMembers without FeatureCollection root element. use the WOC.xml2str function
 										
 										var newGMLLayer = new WOC.VectorStoringGML(
 												"Process result "+(this.processResultLayer.length)+" "+processIdentifier+" ", {   // "Process result 1/2/.../n"
                                                 isBaseLayer:false,
                                                 visibility:true/*,
                                                 style:WOC.WPSClient.style['devel']*/});
 											newGMLLayer.addFeatures(olFeatures);
 											newGMLLayer.setGML(WOC.xml2Str(gmlData));			// the method why the VectorStoringGML class exists! just to save the GML string, to get it by process execution with this layer
 											newGMLLayer.setTileSize(512);
 										this.processResultLayer.push(newGMLLayer);
 										map.addLayer(newGMLLayer);
 										break;
 									default: alert("Exception in executeResponseDataHandling: "+
 													"WPS response data schema is not supported!");
 										break;
 								}							

                                 // OpenLayers.Layer.GML is not used as a reference is not used.
                                 // Here we store the response to use it later again.
                                 // An alternative is to use the angel style!       RRR1
                                 /*this.processResultLayer.push(
 										new WOC.VectorStoringGML(
                                                 "Process result "+(this.processResultLayer.length)+" "+processIdentifier, {   // "Process result 1/2/.../n"
                                                 isBaseLayer:false,
                                                 visibility:true}
 										)
 								);*/
                                 
                                 /* adding the WOC.VectorStoringGML layer to the map
                                 map.addLayer(this.processResultLayer[this.processResultLayer.length-1]);	
                                 
                                 // Adding data to the layer.
                                 // featureMember/featureMembers/featureProperty or
                                 // featureCollection (GMLPacket)
                                 var gmlData = complexOutput.firstChild;
                                 this.processResultLayer[this.processResultLayer.length-1].setGML(WOC.xml2Str(gmlData));
                                 // Get the source and target projections
                                 var features = new Array();
                                 var sourceProjection = this.parseProjectionFromGML(gmlData);
                                 var targetProjection = new OpenLayers.Projection(this.map.getProjection());
                                 if(!sourceProjection)
                                         sourceProjection = targetProjection;
                                 // GML2 & GML3.1 featureMember
                                 var featureMembers = WOC.getElementsByTagNameNS(gmlData,"http://www.opengis.net/gml", "gml", "featureMember");
                                 if(featureMembers && featureMembers.length > 0) {
                                         features = features.concat(this.getFeaturesFromFeatureNodes(
                                                         featureMembers, sourceProjection, targetProjection));
                                 }
                                 // GML 3.1 featureMembers and featureProperty
                                 featureMembers = WOC.getElementsByTagNameNS(gmlData,"http://www.opengis.net/gml", "gml", "featureMembers");
                                 if(featureMembers && featureMembers.length > 0) {
                                     features = this.getFeaturesFromExecuteResponse(gmlData, featureMembers, sourceProjection, targetProjection);
                                 }
                                 featureMembers = WOC.getElementsByTagNameNS(gmlData,"http://www.opengis.net/gml", "gml", "featureProperty");
                                 if(featureMembers && featureMembers.length > 0) {
                                         features = features.concat(this.getFeaturesFromFeatureNodes(
                                                         featureMembers, sourceProjection, targetProjection));
                                 }
                                 // GML 2 GMLPacket. The gmlPacket element is the root
                                 // feature collection. This schema restricts allowable
                                 // feature members to instances of pak:StaticFeatureType.
                                 // None of the type definitions in the gmlpacket schema can
                                 // be extended or restricted in any manner, and this schema
                                 // cannot serve as the basis for any other application
                                 // schema (i.e. it cannot be imported or included into
                                 // another schema).
                                 featureMembers = WOC.getElementsByTagNameNS(complexOutput,
                                                 "http://www.opengis.net/examples/packet", "pac",
                                                 "GMLPacket");
                                 if(featureMembers && featureMembers.length > 0) {
                                         var packetMembers = WOC.getElementsByTagNameNS(
                                                 featureMembers[0],
                                                 "http://www.opengis.net/examples/packet", "pac",
                                                 "packetMember");
                                         for(var i=0; i<packetMembers.length; i++) {
                                                 var staticFeatures = WOC.getElementsByTagNameNS(
                                                 packetMembers[i],
                                                 "http://www.opengis.net/examples/packet", "pac",
                                                 "StaticFeature");
                                                 features = features.concat(							// concat = join or arrays
                                                         this.getFeaturesFromFeatureNodes(
                                                         staticFeatures, sourceProjection,
                                                         targetProjection));
                                         }
                                 }
                                 // Note! In GML 3.2 featureMember, featureMembers and featureProperty
                                 // have been superseded by elements defined in application schemas.
                                 if(features.length > 0) {
                                         this.processResultLayer[this.processResultLayer.length-1].addFeatures(features); // No options!
                                 }
                                 this.map.addLayer(this.processResultLayer[this.processResultLayer.length-1]);
                                 this.processResultLayer[this.processResultLayer.length-1].redraw();*/
 								
                         } else if(mimeType == "image/jpeg" || mimeType == "image/gif" ||
                                         mimeType == "image/png" || mimeType == "image/png8" ||
                                         mimeType == "image/tiff" || mimeType == "image/tiff8" ||
                                         mimeType == "image/geotiff" || mimeType == "image/geotiff8" ||
                                         mimeType == "image/svg") {
                                 // Embedded image.
                                 alert("Embedded image! UNIMPLEMENTED!");
                         } else {
                                 // Unsupported MIME type.
                                 alert("Error. The MIME type is not supported! MIME type is \"" + mimeType + "\"");
                         }
                         // In case of complexData we have to update the layers of
                         // the process description! Else old layers are referenced!

                         var url = this.serviceList.options[this.serviceList.selectedIndex].value;
                         var processIdentifier = this.processSelection.options[
                                         this.processSelection.selectedIndex].value;
                         this.wpsServiceContainer.getService(url).describeProcesses(
                                         [processIdentifier], this.describeProcessMethod);

                 } else if(bbOutputs && bbOutputs.length > 0) {
                         alert("Exception! BoundingBoxData output handling is unimplemented!");
                         // TODO BoundingBoxData output handling is unimplemented!
                 } else {
                         alert("Output's outputFormChoice is unrecognized!");
                 }
         },

        /**
        * Method: closeButtonClick
        *     Closes the DIV which shows the literal output
        */
        closeButtonClick:function() {
                document.getElementById('container').removeChild(document.getElementById('wps_literalOutput'));
        },


        /**
        * Method: executeResponseReferenceHandling
        *     Shows the data being referenced in the Execute-operation's response to
        *     the user.
        *
        * Parameters:
        * title - {String} Title of the referenced data.
        * identifier - {String} Identifier of the output for which the data is.
        * process - {WOC.WPSProcess} Process, which was successfully run.
        * reference {DOMElement} The wps:Reference element of the Execute response.
        */
        executeResponseReferenceHandling:function(title, identifier, process,
                        reference) {
                var href = "";
                if(reference.hasAttribute('href')) {
                        href = reference.attributes.getNamedItem('href').nodeValue;
                } else if(reference.hasAttribute('xlink:href')) {
                        href = reference.attributes.getNamedItem('xlink:href').nodeValue;
                } else {
                        // No attributes -> Error
                        alert("Exception! Reference output is missing the xlink:href attribute!");


                }

                var formats = process.getOutputs()[
                                        identifier].getComplexOutput().getFormats();
                // Check if the schema, encoding and format are supported by the process!
                if(reference.hasAttribute('format')) {
                        var format = complexOutput.attributes.getNamedItem(
                                        'format').nodeValue;
                        var supported = false;
                        for(var j=0; j<formats.length; j++) {
                                if(formats[j].getMimeType() == format) {
                                        supported = true;
                                }
                        }
                        if(!supported) {
                                // Error. The MIME type is not supported!
                                alert("Error. The MIME type is not supported!");



                        }
                }
                if(complexOutput.hasAttribute('encoding')) {
                        var encoding = complexOutput.attributes.getNamedItem(
                                        'encoding').nodeValue;
                        var supported = false;
                        for(var j=0; j<formats.length; j++) {
                                if(formats[j].getEncoding() == encoding) {
                                        supported = true;
                                }
                        }
                        if(!supported) {
                                // Error. The encoding is not supported!
                                alert("Error. The encoding is not supported!");



                        }
                }
                if(complexOutput.hasAttribute('schema')) {
                        var schema = complexOutput.attributes.getNamedItem(
                                        'schema').nodeValue;
                        var supported = false;
                        for(var j=0; j<formats.length; j++) {
                                if(formats[j].getSchema() == schema) {
                                        supported = true;
                                }
                        }
                        if(!supported) {
                                // Error. The schema is not supported!
                                alert("Error. The schema is not supported!");



                        }
                }

                if(process.getOutputs()[identifier].getLiteralOutput()) {
                        // Title. Show to the user.
                        var titleTextNode = document.createTextNode(title);

                        // var literalOutput = reference.getElementsByTagName("LiteralOutput")[0];
                        // uom



                        // data type



                } else if(process.getOutputs()[identifier].getComplexOutput) {
                        var mimeType = "";
                        if(reference.hasAttribute('format')) {
                                mimeType = reference.attributes.getNamedItem(
                                                'format').nodeValue.toLowerCase();
                        } else {
                                // Unknown MIME type. Lets then use the default format given by the process!
                                mimeType = formats[0].getMimeType().toLowerCase();
                        }
                        if(mimeType == "text/xml") {
                                // GML data
                                if(this.processResultLayer != null) {
                                        var setNewBaseLayer        = false;
                                        this.map.removeLayer(this.processResultLayer, setNewBaseLayer);
                                }
                                this.processResultLayer = new Array();
                                processResultLayer[processResultLayer.length] = new OpenLayers.Layer.GML(
                                                "Process output layer", href, {
                                                isBaseLayer:false,
                                                visibility:true});
                                // this.processResultLayer.setVisibility(true);
                                this.processResultLayer.setTileSize(512);
                                this.map.addLayer(this.processResultLayer)
                                this.processResultLayer.redraw();
                        } else if(mimeType == "image/jpeg" || mimeType == "image/gif" ||
                                        mimeType == "image/png" || mimeType == "image/png8" ||
                                        mimeType == "image/tiff" || mimeType == "image/tiff8" ||
                                        mimeType == "image/geotiff" || mimeType == "image/geotiff8" ||
                                        mimeType == "image/svg") {
                                // WMS/WCS image.



                        } else {
                                // Unsupported MIME type. Only the previous are currently supported!
                                alert("Error. The MIME type is not supported!");



                        }
                } else if(process.outputs[identifier].boundingBoxOutput != null) {
                        alert("Exception! BoundingBoxData as output reference is unimplemented!");
                        // UNIMPLEMENTED!



                }
        },

        /**
        * Method: getFeaturesFromFeatureNodes
        *     Returns an array of features found from the featureNode object.
        *     If the source and target CRS codes are given will also transform the
        *     coordinates.
        *
        * Parameters:
        * featureNodes - {DOMElement} Features
        * sourceProjection - {Integer} EPSG-code of the source projection
        *     (internalProjection).
        * targetProjection - {Integer} EPSG-code of the target projection
        *     (externalProjection).
        */
        getFeaturesFromFeatureNodes:function(featureNodes,
                        sourceProjection, targetProjection) {
                /*var gmlFormat = new OpenLayers.Format.GML({
                                                                'internalProjection':targetProjection,
                                                                'externalProjection':sourceProjection});*/
        		var gmlFormat = new OpenLayers.Format.GML();
                var features = new Array();
                for(var j=0; j<featureNodes.length; j++) {
                        // This function is the core function of the GML parsing code in OpenLayers.
                        // It creates the geometries that are then attached to the returned
                        // feature, and calls parseAttributes() to get attribute data out.
                        var feature = gmlFormat.parseFeature(featureNodes[j]);
                        if(feature) {
                                features.push(feature);
                        }
                }
                return features;
        },
        
        /**
         * Method: getFeaturesFromExecuteResponse
 		* @author: Raphael Rupprecht
         */
         getFeaturesFromExecuteResponse:function(gmlData, featureMembers, sourceProjection, targetProjection) {
                 // ### options for the GMLv3 OpenLayers Format
 				var in_options = {
 					'internalProjection': sourceProjection,
 					'externalProjection': targetProjection
 				};			
 				var gmlOptions = {
 					featureType: featureMembers[0].childNodes[0].localName,		// example: "Feature"
 					featureNS: featureMembers[0].childNodes[0].namespaceURI 	// example: "http://www.52north.org/...-455f-a54a-34e06ac25df3"
 				};				
 				var gmlOptionsIn = OpenLayers.Util.extend(
 					OpenLayers.Util.extend({}, gmlOptions),
 					in_options
 				);
 				// ### create the GML format
         		var gmlFormat = new OpenLayers.Format.GML.v3(gmlOptionsIn);
 				// ### 
                 var features = new Array();
 				features = gmlFormat.read(gmlData);

                 return features;
         },	        

        /**
        * Method: parseProjectionFromGML
        *     Returns the first found projection from GML2 or GML3 data.
        *
        * Parameters:
        * gmlData - {DOMElement} GML2 or GML3 data
        */
        parseProjectionFromGML:function(gmlData) {
                var projCode = "";
                var features = [];
                var boundedByNodes = WOC.getElementsByTagNameNS(gmlData,
                        'http://www.opengis.net/gml', 'gml', 'boundedBy');
                for(var i=0; i<boundedByNodes.length; i++) {
                        // Next should be an Box (GML2) or Envelope (GML3)
                        var envelopeNodes = WOC.getElementsByTagNameNS(boundedByNodes[i],
                                        'http://www.opengis.net/gml', 'gml', 'Envelope');
                        if(envelopeNodes.length > 0) {
                                if(envelopeNodes[0].hasAttribute('srsName')) {
                                        projCode = envelopeNodes[0].attributes.getNamedItem('srsName').nodeValue;
                                } else {



                                }
                        } else {
                                var boxNodes = WOC.getElementsByTagNameNS(boundedByNodes[i],
                                                'http://www.opengis.net/gml', 'gml', 'Box');
                                if(boxNodes.length > 0) {
                                        if(boxNodes[0].hasAttribute('srsName')) {
                                                projCode = boxNodes[0].attributes.getNamedItem('srsName').nodeValue;
                                        } else {



                                        }
                                } else {



                                }
                        }
                }
                if(projCode == "") {
                        // No code was found.
                        // alert("Proj code not found!");
                        return null;
                }
                return new OpenLayers.Projection(projCode);
        },

        /**
        * Method: getXML_BBOX_Filter
        *     Returns a string having an ogc:Filter for the given data.
        *
        * Parameters:
        * crsURI - {String} URI referencing the CRS. Can be null, in which case
        *     the CRS is supposed to be geographic WGS84!
        * layer - {OpenLayers.Layer} Layer, whose extent is used for the BBOX.
        * propertyName - {String} Name of the property for which the filter is made.
        *
        * Note: Uses the ogc and gml prefixes!
        */
        getXML_BBOX_Filter:function(crsURI, layer, propertyName) {
                var referenceString = "<ogc:Filter" +
                                " xmlns:ogc=\"http://www.opengis.net/ogc\"" +
                                " xmlns:gml=\"http://www.opengis.net/gml\">";
                referenceString += "<ogc:BBOX>";
                referenceString += "<ogc:PropertyName>" + propertyName + "</ogc:PropertyName>";
                if(crsURI) {
                        referenceString += "<gml:Box srsName=\"" + crsURI + "\">";
                } else {
                        //"http://www.opengis.net/gml/srs/epsg.xml#4326";>
                        referenceString += "<gml:Box>";
                }
                referenceString += "<gml:coordinates >";
                // A Bounds object which represents the lon/lat bounds of the current viewPort.
                var bb = layer.getExtent().toBBOX(9).split(',');
                referenceString += bb[0] + "," + bb[1] + " " + bb[2] + "," + bb[3];
                referenceString += "</gml:coordinates>";
                referenceString += "</gml:Box>";
                referenceString += "</ogc:BBOX>";
                referenceString += "</ogc:Filter>";
                return referenceString;
        },

        /**
        * Method: getXML_Within_Filter
        *     Return a KVP encoded BBOX of the CRS.
        *
        * Parameters:
        * crsURI - {String} URI referencing the CRS. Can be null, in which case
        *     the CRS is supposed to be geographic WGS84!
        * layer - {OpenLayers.Layer} Layer, whose extent is used for the BBOX.
        * propertyName - {String} Name of the property for which the filter is made.
        *
        * Note: Uses the ogc and gml prefixes!
        */
        getXML_Within_Filter:function(crsURI, layer, propertyName) {
                var referenceString = "<ogc:Filter" +
                                " xmlns:ogc=\"http://www.opengis.net/ogc\"" +
                                " xmlns:gml=\"http://www.opengis.net/gml\">";
                referenceString += "<ogc:Within>";
                referenceString += "<ogc:PropertyName>" + propertyName +
                                "</ogc:PropertyName>";
                if(!crsURI) {
                        referenceString += "<gml:Envelope>";
                } else {
                        referenceString += "<gml:Envelope srsName=\"" + crsURI + "\">";
                }
                referenceString += "<gml:lowerCorner>";
                var bb = layer.getExtent().toBBOX(9).split(',');
                referenceString += bb[0] + " " + bb[1];
                referenceString += "</gml:lowerCorner>";
                referenceString += "<gml:upperCorner>";
                referenceString += bb[2] + " " + bb[3];
                referenceString += "</gml:upperCorner>";
                referenceString += "</gml:Envelope>";
                referenceString += "</ogc:Within>";
                referenceString += "</ogc:Filter>";
                return referenceString;
        },

        /**
        * Method: getKVP_BBOX
        *     Return a KVP encoded BBOX of the CRS.
        *
        * Parameters:
        * crsURI - {String} URI referencing the CRS. Can be null, in which case
        *     the CRS is supposed to be geographic WGS84!
        * layer - {OpenLayers.Layer} Layer, whose extent is used for the BBOX.
        */
        getKVP_BBOX:function(crsURI, layer) {
                // The general form of the parameter is:
                // BBOX=lcc1,lcc2,?,lccN,ucc1,ucc2,?uccN[,crsuri]
                // where lcc means Lower Corner Coordinate, ucc means Upper Corner Coordinate
                // and crsuri means the URI reference to the coordinate system being used.
                var referenceString = "BBOX=";
                // A Bounds object which represents the lon/lat bounds of the current viewPort.
                var bounds = layer.getExtent();
                // upper left corner AND lower right corner
                var significantDigits = 9;
                referenceString += bounds.toBBOX(significantDigits);
                if(crsURI != null) {
                        referenceString += "," + crsURI;
                }
                return referenceString;
        },

        /**
        * Method: updateInfoText
        *     Updates the info text.
        *
        * Parameters:
        * text - {String} A string which is put into the info text field.
        * color - {String} Name of the color used for the text. Has to be a css
        *     compatible color name.
        */
        updateInfoText:function(text, color) {
                if(color != null) {
                        this.infoFont.style.color = color;
                } else {
                        this.infoFont.style.color = "white";
                }
                this.infoTextNode.data = text;
        },

        /**
        * Method: getMap
        *
        * Returns:
        * {OpenLAyers.Map}
        */
        getMap:function() {
                return this.map;
        },

        /**
         * Method: getNewServicesDiv
         *
         * Returns:
         * {DOMElement}
         */
        getNewServicesDiv:function() {
                // Create a text field for a single server URL.
                this.serviceTextField = document.createElement('input');
                with(this.serviceTextField) {
                        name = 'serviceTextField';
                        type = "text";
                        id = "newService";
                }
                OpenLayers.Event.observe(this.serviceTextField, "click",
                                OpenLayers.Function.bindAsEventListener(
                                                WOC.textFieldClearing, this.serviceTextField));
                this.serviceList = this.getNewServiceList();
                var div = document.createElement('div');
                var foldingDiv = document.createElement('div');
                foldingDiv.appendChild(this.serviceTextField);
                foldingDiv.appendChild(this.getNewServiceButtonsDiv());
                foldingDiv.appendChild(this.serviceList);
                this.getFoldingLabelForDiv(div, foldingDiv, "WPS services ", true);
                return div;
        },

        /**
         * Method: getNewProcessesDiv
         *
         * Returns:
         * {DOMElement}
         */
        getNewProcessesDiv:function() {
            var div = document.createElement('div');
            this.processSelection = document.createElement('select');
            this.processSelection.wpsClient = this;
            with(this.processSelection) {
                    name = 'WPS processes';
                    style.width = '100%';
                    style.height = '100%';
            }
            this.processSelection.onchange = function() {
                    // this == processSelection
                    if(this.selectedIndex >= 0) {
                            var wpsService =
                                            this.wpsClient.wpsServiceContainer.getService(
                                            this.wpsClient.serviceList.options[
                                            this.wpsClient.serviceList.selectedIndex].value);
                            var processIdentifier = this.wpsClient.processSelection.options[
                                            this.wpsClient.processSelection.selectedIndex].value;
                            wpsService.describeProcesses([processIdentifier],
                                            this.describeProcessMethod);
                    }
            };
            div.style.display = 'none';
            var foldingDiv = document.createElement('div');
            foldingDiv.appendChild(this.processSelection);
            this.getFoldingLabelForDiv(div, foldingDiv, "Processes ", true);
            return div;
        },

        /**
         * Method: getNewProcessDiv
         *
         * Returns:
         * {DOMElement}
         */
        getNewProcessDiv:function() {
            var div = document.createElement('div');
            this.processInputsDiv = document.createElement('div');

            div.style.display = 'none';
            var foldingDiv = document.createElement('div');
            foldingDiv.appendChild(this.processInputsDiv);
            this.getFoldingLabelForDiv(div, foldingDiv, "Process execution ", true);
            return div;
        },
        
        /**
         * Method: getNewAbstractDiv
         * The content is set in the parseDescriptionNode function in WPSProcess.js while parsing the describeProcess document of the process
         *
         * Returns:
         * {DOMElement}
         */
        getNewAbstractDiv:function() {
			var outerDiv = document.createElement('div');
			var innerDiv = document.createElement('div');
			innerDiv.className = "dataTable";
			// ### the content ###
			var content = $("<div id='abstractDiv'></div>").css(
					{"border":"1px solid white",
					 "font-size":"11px",
					 "width":"100%",
					 "height":"60px",
					 "overflow":"auto"
					 });					
			// ### 
			innerDiv.appendChild(content[0]);
			this.getFoldingLabelForDiv(outerDiv, innerDiv, "Abstract ", false);
			return outerDiv;
        },	        

        /**
         * Method: getNewServiceList
         *
         * Returns:
         * {DOMElement}
         */
        getNewServiceList:function() {
            // List for the stored services -- Selecting an URL from the
            // makes immediently a query.
            var list = document.createElement('select');
            with(list) {
                    name = 'WPS services';
                    size = WOC.WPSClient.MAX_SHOWN_SERVICES;
                    id = 'serviceList';
            }
            // The server list needs to know about the client!
            list.client = this;
            //OpenLayers.Event.observe(list, 'click',
            //                OpenLayers.Function.bindAsEventListener(this.ignoreEvent,
            //                                this));
            // list.onclick = function() { this.focus; }
            list.onchange = function() {
                    // this == serviceList
                    if(this.client.wpsServiceContainer.getServiceCount() >
                                    this.selectedIndex && this.selectedIndex >= 0) {
                            var name = this.options[this.selectedIndex].text;
                            var url = this.options[this.selectedIndex].value;
                            this.client.serviceTextField.value = url;
                            // this.client.serviceTextField.text = name;
                            this.client.updateCapabilities();
                    }
            };
            return list;
        },

        /**
         * Method: getNewServiceButtonsDiv
         *
         * Returns:
         * {DOMElement}
         */
        getNewServiceButtonsDiv:function() {
                // Button to query the server -- Used to query a WPS service's capabilities.
                var addServiceButton = document.createElement('input');
                with(addServiceButton) {
                        type = 'button';
                        value = 'Add service';
                }
                OpenLayers.Event.observe(addServiceButton, "click",
                    OpenLayers.Function.bindAsEventListener(
                                                this.addServiceButtonClick, this));
                var removeServiceButton = document.createElement('input');
                with(removeServiceButton) {
                        type = 'button';
                        value = 'Remove service';
                }
                OpenLayers.Event.observe(removeServiceButton, "click",
                    OpenLayers.Function.bindAsEventListener(
                                                this.removeServiceButtonClick, this));
                var showCapabilitiesButton = document.createElement('input');
                with(showCapabilitiesButton) {
                        type = 'button';
                        value = 'Show capabilities';
                }
                OpenLayers.Event.observe(showCapabilitiesButton, "click",
                    OpenLayers.Function.bindAsEventListener(
                                                this.showCapabilitiesButtonClick, this));
                // Table to show the buttons.
                var buttonsTable = document.createElement('table');
                var td0 = document.createElement('td');
                td0.className = 'button';
                td0.appendChild(addServiceButton)
                var td1 = document.createElement('td');
                td1.className = 'button';
                td1.appendChild(showCapabilitiesButton)
                var td2 = document.createElement('td');
                td2.className = 'button';
                td2.appendChild(removeServiceButton)
                var tr = document.createElement('tr');
                with(tr) {
                        appendChild(td0);
                        appendChild(td1);
                        appendChild(td2);
                }
                buttonsTable.appendChild(tr);
                var div = document.createElement('div');
                div.appendChild(buttonsTable);
                return div;
        },

        /**
         * Method: getNewExecutionsDiv
         *
         * Returns:
         * {DOMElement}
         */
        getNewExecutionsDiv:function() {
                var headerRow = document.createElement('tr');
                var th1 = document.createElement('th');
                th1.appendChild(document.createTextNode('WPS instance'));
                var th2 = document.createElement('th');
                th2.appendChild(document.createTextNode('Process'));
                var th3 = document.createElement('th');
                th3.appendChild(document.createTextNode('Status'));
                var th4 = document.createElement('th');
                th4.appendChild(document.createTextNode('Complited'));
                var th5 = document.createElement('th');
                th5.appendChild(document.createTextNode('Info'));
                with(headerRow) {
                        appendChild(th1);
                        appendChild(th2);
                        appendChild(th3);
                        appendChild(th4);
                        appendChild(th5);
                }
                var t = document.createElement('table');
                t.className = "dataArray";
                t.appendChild(headerRow);
                var tableDiv = document.createElement('div');
                tableDiv.className = "dataArray";
                tableDiv.appendChild(t);
                var div = document.createElement('div');
                div.style.display = 'none';
                this.getFoldingLabelForDiv(div, tableDiv, "Running processes ", true);
                return div;
        },

        /**
         * Method: getNewSettingsDiv
         *
         * Returns:
         * {DOMElement}
         */
        getNewSettingsDiv:function() {
                var methods = ["GET", "POST", "SOAP"];
                var methodTable = document.createElement('table');
                methodTable.className = "verticalArray";
                // Headers
                var headerRow = document.createElement('tr');
                var headerDataOperations = document.createElement('th');
                headerDataOperations.appendChild(
                                document.createTextNode("Operation"));
                headerRow.appendChild(headerDataOperations);
                var headerDataGET = document.createElement('th');
                headerDataGET.appendChild(
                                document.createTextNode("GET"));
                headerRow.appendChild(headerDataGET);
                var headerDataPOST = document.createElement('th');
                headerDataPOST.appendChild(
                                document.createTextNode("POST"));
                headerRow.appendChild(headerDataPOST);
                var headerDataSOAP = document.createElement('th');
                headerDataSOAP.appendChild(
                                document.createTextNode("SOAP"));
                headerRow.appendChild(headerDataSOAP);
                methodTable.appendChild(headerRow);
                // GetCapabilities operation!
                var capabilitiesRow = document.createElement('tr');
                var capabilitiesRowName = document.createElement('td');
                capabilitiesRowName.appendChild(
                                document.createTextNode("GetCapabilities"));
                capabilitiesRow.appendChild(capabilitiesRowName);
                for(var i=0; i<methods.length; i++) {
                        var input = document.createElement('input');
                        input.type = 'radio';
                        input.name = 'GetCapabilities';
                        input.value = methods[i];
                        input.client = this;
                        OpenLayers.Event.observe(input, "click",
                    OpenLayers.Function.bindAsEventListener(
                                                this.changeCapabilitiesMethodClick, input));
                        if(i==0) {
                                input.checked = true;
                        } else {
                                input.checked = false;
                        }
                        var inputTableData = document.createElement('td');
                        inputTableData.appendChild(input);
                        capabilitiesRow.appendChild(inputTableData);
                }
                methodTable.appendChild(capabilitiesRow);
                // DescribeProcess operation!
                var describeRow = document.createElement('tr');
                var describeRowName = document.createElement('td');
                describeRowName.appendChild(
                                document.createTextNode("describeProcess"));
                describeRow.appendChild(describeRowName);
                for(var i=0; i<methods.length; i++) {
                        var input = document.createElement('input');
                        input.type = 'radio';
                        input.name = 'DescribeProcess';
                        input.value = methods[i];
                        input.client = this;
                        OpenLayers.Event.observe(input, "click",
                    OpenLayers.Function.bindAsEventListener(
                                                this.changeDescribeProcessMethodClick, input));
                        if(i==0) {
                                input.checked = true;
                        } else {
                                input.checked = false;
                        }
                        var inputTableData = document.createElement('td');
                        inputTableData.appendChild(input);
                        describeRow.appendChild(inputTableData);
                }
                methodTable.appendChild(describeRow);
                // Execute operation!
                var executeRow = document.createElement('tr');
                var executeRowName = document.createElement('td');
                executeRowName.appendChild(
                                document.createTextNode("Execute"));
                executeRow.appendChild(executeRowName);
                for(var i=0; i<methods.length; i++) {
                        var input = document.createElement('input');
                        input.type = 'radio';
                        input.name = 'Execute';
                        input.value = methods[i];
                        // input.client = this;
                        OpenLayers.Event.observe(input, "click",
                    OpenLayers.Function.bindAsEventListener(
                                                this.changeExecuteMethodClick, input));
                        if(i==1) {
                                input.checked = true;
                        } else {
                                input.checked = false;
                        }
                        var inputTableData = document.createElement('td');
                        inputTableData.appendChild(input);
                        executeRow.appendChild(inputTableData);
                }
                methodTable.appendChild(executeRow);
                methodTable.className = "verticalArray";
                var outerDiv = document.createElement('div');
                var innerDiv = document.createElement('div');
                innerDiv.className = "dataTable";
                innerDiv.appendChild(methodTable);
                this.getFoldingLabelForDiv(outerDiv, innerDiv, "Settings ", false);
                return outerDiv;
        },

        /**
         * Method: getFoldingLabelForDiv
         *
         * Parameters:
         * outerDiv - {DOMElement}
         * innerDiv - {DOMElement}
         * divLabel - {String}
         * visibility - {Boolean}
         */
        getFoldingLabelForDiv:function(outerDiv, innerDiv, divLabel, visibility) {
                // Create a label.
                var lab = document.createElement('h1');
                lab.className = 'wpsMainLabel';
                // Folding
                var foldingImg = document.createElement('img');
                if(visibility) {
                        foldingImg.src = "img/xmlViewerArrowDown.png";
                        foldingImg.setAttribute('alt', 'Hide');
                        innerDiv.style.display = 'block';

                } else {
                        foldingImg.src = "img/xmlViewerArrowRight.png";
                        foldingImg.setAttribute('alt', 'Show');
                        innerDiv.style.display = 'none';
                }
                foldingImg.div = innerDiv;
                OpenLayers.Event.observe(foldingImg, "click",
                    OpenLayers.Function.bindAsEventListener(
                                                this.foldingImageClick, foldingImg));
                lab.appendChild(document.createTextNode(divLabel));
                lab.appendChild(foldingImg);
                outerDiv.appendChild(lab);
                outerDiv.appendChild(innerDiv);
        },

        executeButtonClick:function() {
                if(this.processSelection.selectedIndex >= 0) {
                        var serviceURL = this.serviceList.options[
                                this.serviceList.selectedIndex].value;
                        var wpsService = this.wpsServiceContainer.getService(serviceURL);
                        var processIdentifier = this.processSelection.options[
                                        this.processSelection.selectedIndex].value;
                     // ### setting the execute popup boolean
						var executeReqPopup = false;
						var executeResPopup = false;
						if(DEBUG_MODE){
							executeReqPopup = document.getElementById('execute_request_popup').checked;
							executeResPopup = document.getElementById('execute_response_popup').checked;
						} 
						// ### end of setting the execute pupop boolean
						var executionObject = wpsService.execute(processIdentifier,
                                        this.executeMethod,
                                        executeReqPopup,
                                        executeResPopup);
                        this.runningExecutionsDiv.getElementsByTagName('table')[0].
                                        appendChild(executionObject.getStatusTableRow());
                        this.runningExecutionsDiv.style.display = 'block';
                } else {
                        this.updateInfoText("Execute-operation could not be called as an " +
                                        "process is not selected!", "green");
                }
        },

        descriptionButtonClick:function() {
                var processIdentifiers = new Array();
                processIdentifiers.push(this.processSelection.options[
                                this.processSelection.selectedIndex].value);
                var serviceURL = this.serviceList.options[
                                this.serviceList.selectedIndex].value;
                var wpsService = this.wpsServiceContainer.getService(serviceURL);
                wpsService.popupProcessDescriptions(processIdentifiers,
                                this.describeProcessMethod);
        },

        addServiceButtonClick:function() {
                this.addService(this.serviceTextField.value);
        },

        removeServiceButtonClick:function() {
                if(this.serviceList != null && this.serviceList.options.length > 0
                                && this.serviceList.selectedIndex >= 0) {
                        var serviceURL = this.serviceList.options[
                                        this.serviceList.selectedIndex].value;
                        this.removeService(serviceURL);
                        this.updateInfoText("Service removed.", "green");
                } else {
                        this.updateInfoText("No service is selected to be removed!", "red");
                }
        },

        showCapabilitiesButtonClick:function() {
                if(this.serviceList &&
                                        this.serviceList.options.length > 0
                                        && this.serviceList.selectedIndex >= 0) {
                        var serviceURL = this.serviceList.options[
                                        this.serviceList.selectedIndex].value;
                        var service = this.wpsServiceContainer.getService(
                                        serviceURL);
                        service.popupServiceCapabilities(
                                        this.getCapabilitiesMethod);
                } else {
                        this.updateInfoText(
                                        "No service is selected to query capabilities!", "red");
                }
        },

        changeCapabilitiesMethodClick:function() {
                // this == capabilitiesMethodButton!
                this.client.getCapabilitiesMethod = this.value;
        },

        changeDescribeProcessMethodClick:function() {
                // this == describeProcessMethodButton!
                this.client.describeProcessMethod = this.value;
        },

        changeExecuteMethodClick:function() {
                // this == executeMethodButton!
                this.client.executeMethod = this.value;
        },

        foldingImageClick:function() {
                if(this.div.style.display == 'none') {
                        this.src = "img/xmlViewerArrowDown.png";
                        this.div.style.display = 'block';
                        this.div.setAttribute('alt', 'Hide');
                } else {
                        this.src = "img/xmlViewerArrowRight.png";
                        this.div.style.display = 'none'
                        this.div.setAttribute('alt', 'Show');
                }

        },

        /**
     * Method: ignoreEvent
     *
     * Parameters:
     * event - {Event}
     */
    ignoreEvent:function(event) {
        OpenLayers.Event.stop(event);
    },

        CLASS_NAME:"WOC.WPSClient"
});

/**
* Constant: WOC.WPSClient.MAX_SHOWN_PROCESSES
*     Number of processes shown to the user on the interface at the same time
*     without a need to scroll.
* {Integer}
*/
WOC.WPSClient.MAX_SHOWN_PROCESSES = 1; // 4
/**
* Constant: WOC.WPSClient.MAX_SHOWN_SERVICES
*     Number of WPS srvice instances shown to the user on the interface at the same
*     time without a need to scroll.
* {Integer}
*/
WOC.WPSClient.MAX_SHOWN_SERVICES = 1; // 3
/**
* Constant: WOC.WPSClient.INITIAL_SERVICES
*     Services added to the client immediently while initializing the client..
* {Array of Strings}
*/
/*
WOC.WPSClient.INITIAL_SERVICES = [
                "http://10.60.0.25/wps/WebProcessingService",
                "http://geoserver.itc.nl:8080/wps100/WebProcessingService",
                "http://apps.esdi-humboldt.cz/cgi-bin/pywps_3_0"];
*/
WOC.WPSClient.INITIAL_SERVICES = [
"http://localhost:8080/wps/WebProcessingService",
"http://giv-ows2.uni-muenster.de:8080/wps/WebProcessingService"                
];


/**
* Constant: WOC.WPSClient.style
*     Different user interface styles.
* {Array of Objects}
*/
WOC.WPSClient.style = {
    'default': {
        fillColor: "#ee9900",
        fillOpacity: 0.5,
        hoverFillColor: "white",
        hoverFillOpacity: 0.8,
        strokeColor: "#ee9900",
        strokeOpacity: 1,
        strokeWidth: 4,
        strokeLinecap: "round",
        hoverStrokeColor: "red",
        hoverStrokeOpacity: 1,
        hoverStrokeWidth: 0.4,
        pointRadius: 6,
        hoverPointRadius: 1,
        hoverPointUnit: "%",
        pointerEvents: "visiblePainted",
        cursor: ""
    },
        'devel': {
        fillColor: "#FF0033",
        fillOpacity: 0.5,
        hoverFillColor: "red",
        hoverFillOpacity: 0.8,
        strokeColor: "#FF0033",
        strokeOpacity: 1,
        strokeWidth: 4,
        strokeLinecap: "round",
        hoverStrokeColor: "white",
        hoverStrokeOpacity: 1,
        hoverStrokeWidth: 0.4,
        pointRadius: 6,
        hoverPointRadius: 1,
        hoverPointUnit: "%",
        pointerEvents: "visiblePainted",
        cursor: ""
    },
        'angel': {
        fillColor: "#3300CC",
        fillOpacity: 0.4,
        hoverFillColor: "blue",
        hoverFillOpacity: 0.8,
        strokeColor: "#3300CC",
        strokeOpacity: 1,
        strokeWidth: 1,
        strokeLinecap: "round",
        hoverStrokeColor: "white",
        hoverStrokeOpacity: 1,
        hoverStrokeWidth: 0.4,
        pointRadius: 6,
        hoverPointRadius: 1,
        hoverPointUnit: "%",
        pointerEvents: "visiblePainted",
        cursor: ""
    }
};