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
 * Class: WOC.WPSProcess
 *     Handles a single WPS process logic.
 *
 * Inherits from:
 *     <WOC.IdentifiedObject>
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 */
WOC.WPSProcess = OpenLayers.Class(WOC.IdentifiedObject, {
        /**
    * Constructor: WOC.WPSProcess
    */
        initialize:function() {
                WOC.IdentifiedObject.prototype.initialize.apply(this);
                /**
                * Variable: processVersion
                * {String} Release version of this Process.
                *
                * Included when a process version needs to be included for
                *     clarification about the process to be used.
                *
                * It is possible that a WPS supports a process with different
                *     versions due to reasons such as modifications of process
                *     algorithms.
                *
                * Note:
                * This is the version identifier for the process, not the
                *     version of the WPS interface.
                */
                var processVersion = "";


                // var metadata = new WOC.OWSMetadata();
                // var profile = ""; // URN
                // var WSDL = null; // WSDL type

                // Additional attributes
                /**
                * Variable: executions
                * {Array{WOC.WPSExecution}} Executions of this process.
                */
                var executions = new Array();
                /**
                * Variable: storeSupported
                * {Boolean} True if the process can store the complex data results,
                *     else false.
                *
                * The value is gotten from the GetDescription-operation's response.
                *
                * If true, the Execute operation request may include the "asReference"
                *     as "true" for any complex output.
                */
                var storeSupported = false;
                /**
                * Variable: statusSupported
                * {Boolean} True if the process can inform of it's status, else false.
                *     The value is gotten from the GetDescription-operation's
                *     response.
                */
                var statusSupported = false;
                /**
                * Variable: inputs
                * {HashTable{WOC.WPSInputData}} All inputs of this process.
                *
                * The key is the input's identifier. The values are gotten from the
                *     GetDescription-operation's response.
                *
                * Note:
                *     Inputs may be identified when all the inputs are predetermined
                *     fixed resources. In this case, those resources shall be
                *     identified in the ows:Abstract element that describes the process.
                */
                var inputs = new Array();
                /**
                * @author: Raphael Rupprecht
                *
                * Idee: hier werden die Schemas eingefügt, ist es leer bei einem Prozess,
                * scheint dieser kein ComplexData zu unterstützen.
                */
                var schemaInputs = new Array();
                /*
                * @author: Raphael Rupprecht
                * Variable: isClientSupported
                * {Boolean}
                *
                * This boolean is true, when the process's inputs are literal and/or ComplexData=GML
                * The set variable that follows indicates if the this variable was set already
                */
                var isClientSupported = false;
                var isClientSupportedSet = false;

                /**
                * Variable: inputs
                * {HashTable{WOC.WPSOutputData}} All outputs of this process.
                *     The key is the output's identifier.
                *     The values are gotten from the GetDescription-operation's
                *     response.
                */
                var outputs = new Array();

                /**
                * Method: parseCapabilitiesNode
                *     Parses from a GetCapabilities-operation's response data.
                *
                * Parameters:
                * node - {DOMElement} Node having the process data.
                *
                * Returns:
                * {Array} All occured warnings. The array is empty if none occured.
                */
                this.parseCapabilitiesNode = function(node) {
                        // Storing the title, identifier and abstract.
                        this.parseIdentificationNode(node);
                        // Store the metadata

                        // Set process' version.
                        if(node.hasAttribute('processVersion')) {
                                processVersion =
                                                node.attributes.getNamedItem(
                                                'processVersion').nodeValue;
                        } else {
                                processVersion = "Unknown";
                        }
                }

                /**
                * Method: parseCapabilitiesNode
                *     Parses from a GetCapabilities-operation's response data.
                * RR13
                * Parameters:
                * node - {DOMElement} Node having the process data.
                *
                * Throws:
                * {AttributeMissingEx}
                * {ElementMissingEx}
                */
                this.parseDescriptionNode = function(node) {
                        //alert(node.childNodes[1].innerText);
                        // StoreSupported and StatusSupported. Defaut for both is 'false'!
                        if(node.hasAttribute('storeSupported')) {
                                storeSupported = node.attributes.getNamedItem(
                                                'storeSupported').nodeValue;
                        }
                        if(node.hasAttribute('statusSupported')) {
                                statusSupported = node.attributes.getNamedItem(
                                                'statusSupported').nodeValue;
                        }
                        var abstractNodes = WOC.getElementsByTagNameNS(
                                node, WOC.OWS_NAMESPACE, 
                                WOC.OWS_PREFIX, 'Abstract');
		                if(abstractNodes.length > 0 && abstractNodes[0].hasChildNodes()) {
	                        this.setAbstract(abstractNodes[0].firstChild.nodeValue);
							$("#abstractDiv").html(abstractNodes[0].firstChild.nodeValue);
		                } else {
		                	$("#abstractDiv").html("No abstract was found.");
		                }
                        // Inputs (Optional)
                        var dataInputsNodes = WOC.getElementsByTagNameNS(node,
                                        WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 'DataInputs');          // dataInputsNodes (einer)  // rr11
                        if(dataInputsNodes && dataInputsNodes.length > 0) {
                                var inputNodes = WOC.getElementsByTagNameNS(dataInputsNodes[0],    // rr12
                                                WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 'Input');       // inputNodes bei SimpleBuffer zB 2 Stück:
                                //alert("INPUT COUNT: \n"+node.childNodes[1].innerText + " has " + inputNodes.length + " inputs.");
                                if(inputNodes && inputNodes.length > 0) {
                                        for(var i=0; i<inputNodes.length; i++) {                   // zB 2 siehe oben
                                                // Raphael Note: hier wird das describeProcess XML nach "DataInputs" und dann nach "Input"
                                                // durchsucht und in das input Array vom Typ WOC.WPSInputData geschrieben.
                                                var input = new WOC.WPSInputData();
                                                input.parseFromNode(inputNodes[i]);                // rr13
                                                inputs[input.getIdentifier()] = input;             // Assosoative array ;)    rr14

                                                // inputNodes[i].firstElementChild = ows:Identifier
                                                // inputNodes[i].nextSibling?...   = ows:Title
                                                // inputNodes[i].nextSibling?...   = ows:Abstract
                                                // inputNodes[i].lastElementChild  = LiteralData / ComplexData / BoundingBoxData

                                                var p = this.getIdentifier();
                                                //alert(p); // unklug weil es dann input x eine alert meldung pro proccess gibt(siehe anfang methode, da ist ein alternativer alert)

                                                var lastChild = inputNodes[i].lastElementChild.nodeName;  // LiteralData / ComplexData / BoundingBoxData
                                                //alert("(WPSProcess:1858)\n"+this.getIdentifier() + "\n "+i+" \n lastChild : " + lastChild);

                                                if(lastChild == "LiteralData")       // rr15
                                                {
                                                   // isClientSupported was not set yet
                                                   if(isClientSupportedSet == false)
                                                   {
                                                       isClientSupportedSet = true;
                                                       isClientSupported = true;
                                                   }
                                                   else
                                                   {
                                                      // else the var is true: it does not make sense to set a var true that is already true
                                                      // or the var is false: the var should not be set to true, when one input is false!
                                                   }
                                                }
                                                else if(lastChild == "ComplexData")
                                                {
                                                   // checking the mime type
                                                   var mimeType = inputNodes[i].lastElementChild.firstElementChild.firstElementChild.firstElementChild.innerText;
                                                   if(mimeType == "text/XML"||mimeType == "TEXT/xml"||mimeType == "text/xml")
                                                   {
                                                      // checking if there is a schema element
                                                      if(inputNodes[i].lastElementChild.firstElementChild.firstElementChild.lastElementChild.innerText)
                                                      {
                                                         // checking if the schema is gmlpacket.xsd or feature.xsd
                                                         // "http://geoserver.itc.nl:8080/wps/schemas/gml/2.1.2/gmlpacket.xsd"
                                                         var tmpSchema = inputNodes[i].lastElementChild.firstElementChild.firstElementChild.lastElementChild.innerText;
                                                         if(tmpSchema.match(/gmlpacket.xsd/) != null || tmpSchema.match(/feature.xsd/) != null)
                                                         {
                                                             // isClientSupported was not set yet
                                                             if(isClientSupportedSet == false)
                                                             {
                                                                 isClientSupportedSet = true;
                                                                 isClientSupported = true;
                                                             }
                                                             else
                                                             {
                                                                 // else the var is true: it does not make sense to set a var true that is already true
                                                                 // or the var is false: the var should not be set to true, when one input is false!
                                                             }
                                                         }
                                                         // schema not valid
                                                         else
                                                         {
                                                             // isClientSupported was not set yet
                                                             if(isClientSupportedSet == false)
                                                             {
                                                                 isClientSupportedSet = true;
                                                                 isClientSupported = false;
                                                             }
                                                             else if(isClientSupported)
                                                             {
                                                                 // one falsy input is enough to set false
                                                                 isClientSupportedSet = true;
                                                                 isClientSupported = false;
                                                             }
                                                             else
                                                             {
                                                                 // isClientSupported is already set to false
                                                             }
                                                         }
                                                      }
                                                      // no schema element found
                                                      else
                                                      {
                                                        // isClientSupported was not set yet
                                                        if(isClientSupportedSet == false)
                                                        {
                                                                 isClientSupportedSet = true;
                                                                 isClientSupported = false;
                                                        }
                                                        else if(isClientSupported)
                                                        {
                                                                 // one falsy input is enough to set false
                                                                 isClientSupportedSet = true;
                                                                 isClientSupported = false;
                                                        }
                                                        else
                                                        {
                                                                 // isClientSupported is already set to false
                                                        }
                                                      }
                                                   }
                                                   // mimeType == "text/XML" != "text/XML"
                                                   else
                                                   {
                                                        // isClientSupported was not set yet
                                                        if(isClientSupportedSet == false)
                                                        {
                                                                 isClientSupportedSet = true;
                                                                 isClientSupported = false;
                                                        }
                                                        else if(isClientSupported)
                                                        {
                                                                 // one falsy input is enough to set false
                                                                 isClientSupportedSet = true;
                                                                 isClientSupported = false;
                                                        }
                                                        else
                                                        {
                                                                 // isClientSupported is already set to false
                                                        }
                                                   }
                                                }
                                                else
                                                {
                                                     // isClientSupported was not set yet
                                                     if(isClientSupportedSet == false)
                                                     {
                                                         isClientSupportedSet = true;
                                                         isClientSupported = false;
                                                     }
                                                     else if(isClientSupported)
                                                     {
                                                         // one falsy input is enough to set false
                                                         isClientSupportedSet = true;
                                                         isClientSupported = false;
                                                     }
                                                     else
                                                     {
                                                         // isClientSupported is already set to false
                                                     }
                                                }

                                                //schemaInputs[i] = inputNodes[i].lastElementChild.firstElementChild.firstElementChild.lastElementChild.innerText;  // Raphaels schemaInputs Array
                                        }// ENDE schleife über die inputs
                                        //alert("isClientSupported: \n"+ "Process: "+node.childNodes[1].innerText +"\n"+"isClientSupported = " +isClientSupported);

                                        //alert("(WPSProcess:1858) input.complexData.schema: "+inputNodes[0].lastElementChild.firstElementChild.firstElementChild.lastElementChild.innerText);
                                        //document.getElementById("isSupported").innerHTML += p + ": isSupported: " + isClientSupported + "<br />";
                                }
                        }

                        // Process Outputs (Mandatory)
                        var processOutputsNodes = WOC.getElementsByTagNameNS(node,
                                        WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 'ProcessOutputs');
                        var outputNodes = WOC.getElementsByTagNameNS(processOutputsNodes[0],
                                        WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 'Output');
                        // iterate over all output nodes
						if(outputNodes && outputNodes.length > 0) {
							for(var i=0; i<outputNodes.length; i++) {
								// create an output object for every node    
								var output = new WOC.WPSOutputData();
									output.parseFromNode(outputNodes[i]);
								// put the new object into the outputs array
								outputs[output.getIdentifier()] = output; // Assosiative array ;)
							}
                        } else {
                                // TODO Handle error situation!
                                alert("2054:WPSProcess,Error getting process output nodes, or output nodes null!");
                        }
						// now that we have all output objects in the outputs array of the process, we iterate through them,
						// to see if the process has output types, which the client can handle
						for(var output in outputs){
							// literal is allowed for the client, so we just check the complex output
							var complex = outputs[output].getComplexOutput();
							
							if(complex != null){
								// check the formats of the complex output
								var formats = complex.getFormats();
								for(var i = 0; i<formats.length; i++){
									if(formats[i].getMimeType() == "image/tiff" ||
										formats[i].getMimeType() == "Image/tiff" ||
										formats[i].getMimeType() == "image/Tiff" ||
										formats[i].getMimeType() == "Image/Tiff" ||
										formats[i].getMimeType() == "IMAGE/TIFF"){
											isClientSupported = false;		// the process is not supported by the client
									}
								}
							}
						}
                }

                /**
                * Method: getProcessVersion
                *     Returns the version of the process.
                *
                * Returns:
                * {String} Version of the process.
                */
                this.getProcessVersion = function() {
                        return processVersion;
                }

                /**
                * Method: getInputs
                *     Returns the process' inputs.
                *
                * Returns:
                * {HashTable} An assosiative array of inputs, where the key is the
                *     input's name. In case of no inputs returns null.
                */
                this.getInputs = function() {
                        return inputs;
                }

                /**
                * Method: getInputsCount
                *     Returns the amount of inputs.
                *
                * Returns:
                * {Integer} The amount of inputs.
                */
                this.getInputsCount = function() {
                        var count = 0;
                        for(input in inputs) {
                                count++;
                        }
                        return count;
                }

                /**
                * @author: Raphael Rupprecht
                * Method: getisClientSupported
                *      Returns true when the process has LiteralData and/or ComplexData=GML as inputs
                *
                * Returns:
                * {Boolean}
                */
                this.getisClientSupported = function() {
                        return isClientSupported;
                }

                /**
                * Method: getOutputs
                *     Returns the process' outputs.
                *
                * Returns:
                * {HashTable} An assosiative array of outputs, where the key is the
                *     output's name. In case of no outputs returns null.
                */
                this.getOutputs = function() {
                        return outputs;
                }

                /**
                * Method: getOutputsCount
                *     Returns the amount of outputs.
                *
                * Returns:
                * {Integer} The amount of outputs.
                */
                this.getOutputsCount = function() {
                        var count = 0;
                        for(output in outputs) {
                                count++;
                        }
                        return count;
                }

                /**
                * Method: isStoreSupported
                *
                * Returns:
                * {Boolean} True if storing the process result is supported, else false.
                */
                this.isStoreSupported = function() {
                        return storeSupported;
                }

                /**
                * Method: isStatusSupported
                *
                * Returns:
                * {Boolean} True if the WPS service can send status information about
                * the process, else false.
                */
                this.isStatusSupported = function() {
                        return statusSupported;
                }

                /**
                * Method: getDataInputsXML
                *
                * Parameters:
                * {OpenLayers.Map}
                *
                * Returns:
                * {String} An XML string containing the wps:DataInputs element
                *
                * Throws:
                * {LayerNullEx} Thrown by complex data handling if the
                *     input layer is null.
                * {UnsupportedLayerTypeEx} Thrown if the layer type is
                *     unsupported.
                * {EmptyStringValueEx}
                * {Exception} In any other exceptional case.
                */
                this.getDataInputsXML = function(map) {
                        if(this.getInputsCount() == 0) {
                                return "";
                        }
                        var inputsXML = "<wps:DataInputs>";
                        for(var inputKey in inputs) {
                                inputsXML += inputs[inputKey].getInputXML(map);
                        }
                        return inputsXML + "</wps:DataInputs>";
                }
        },
        CLASS_NAME:"WOC.WPSProcess"
});