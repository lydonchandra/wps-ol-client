schema="http://schemas.opengis.net/gml/3.1.1/base/feature.xsd"/****************************************************************
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
 * Class: WOC.WPSService
 *     The WPS Service instance.
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 */
WOC.WPSService = OpenLayers.Class({
        /**
     * Constructor: WOC.WPSService
         *
         * Parameters:
         * url - {String} The URL of the service instance.
         * wpsClient - {WOC.WPSClient} The client of the service.
     */
        initialize:function(url, wpsClient) {
                /**
                 * Variable: url
                 * {String} URL of the service.
                 */
                var url = url;
                /**
                 * Variable: version
                 * {String} Version of the service.
                 */
                var version = "1.0.0";
                /**
                 * Variable: client
                 * {WOC.WPSClient} The service's client application.
                 */
                var client = wpsClient;
                /**
                 * Variable: getCapabilitiesRequest
                 * {Object} The getCapabilities-operation's reguest.
                 *     This can be used to cancel the request!
                 */
                var getCapabilitiesRequest = null;
                /**
                 * Variable: metadata
                 * {WOC.OWServiceIdentification} The metadata about the service.
                 */
                var metadata = new WOC.OWServiceIdentification();
                /**
                 * Variable: processes
                 * {HashTable{WOC.WPSProcess}} The processes offered by the service.
                 *     The key is the process' identifier.
                 */
                var processes = [];

                // var serviceProvider
                // var operationsMetadata

                /**
                 * Variable: exceptions
                 * {Array{WOC.ExceptionReport}} Object array of exceptions.
                 *     (Each arrived response nullifies the array in the beginning!)
                 */
                var exceptions = [];

                /**
                 * Variable: warnings
                 * {Array{WOC.ExceptionReport}} Object array of warnings.
                 *      (Each arrived response nullifies the array in the beginning!)
                 */
                var warnings = [];

                /**
                 * Method: getCapabilities
                 *     Gets the capabilities of the service.
                 *
                 * Parameters:
                 * method - {String} Method to be used. Can be GET, POST or SOAP.
                 */
                this.getCapabilities = function(method) {
                        if(method == "POST") {
                                this.getCapabilitiesPOST(
                                                this.getCapabilitiesSuccess,
                                                this.getCapabilitiesFailure);
                        } else if(method == "SOAP") {
                                this.getCapabilitiesSOAP(
                                                this.getCapabilitiesSOAPSuccess,
                                                this.getCapabilitiesFailure);
                        } else {
                                // Default choice
                                this.getCapabilitiesGET(
                                                this.getCapabilitiesSuccess,
                                                this.getCapabilitiesFailure);
                        }
                }

                /**
                 * Method: popupServiceCapabilities
                 *     Gets the capabilities of the service and shows them to the user.
                 *
                 * Parameters:
                 * method - {String} Method to be used. Can be GET, POST or SOAP.
                 */
                this.popupServiceCapabilities = function(method) {
                        if(method == "POST") {
                                this.getCapabilitiesPOST(
                                                this.getCapabilitiesPopupSuccess,
                                                this.getCapabilitiesFailure);
                        } else if(method == "SOAP") {
                                this.getCapabilitiesSOAP(
                                                this.getCapabilitiesPopupSuccess,
                                                this.getCapabilitiesFailure);
                        } else {
                                // Default choice
                                this.getCapabilitiesGET(
                                                this.getCapabilitiesPopupSuccess,
                                                this.getCapabilitiesFailure);
                        }
                }

                /**
                 * Method: getCapabilitiesGET
                 *     Gets the capabilities of the service using the GET method.
                 *
                 * Parameters:
                 * targetSuccessFunction - {Function} Function, which is called after
                 *     a successful getCapabilities query.
                 * targetFailureFunction - {Function} Function, which is called after
                 *     an unsuccessful getCapabilities query.
                 */
                this.getCapabilitiesGET = function(targetSuccessFunction,
                                targetFailureFunction) {
                        var params = "?service=" + WOC.WPSService.SERVICE;
                        params += "&request=GetCapabilities";
                        params += "&acceptVersions=";
                        // OWS 1.1.0: Parameters values containing lists (for example,
                        // AcceptVersions and AcceptFormats in the GetCapabilities operation
                        // request) shall use the comma (",") as the separator between items
                        // in the list.
                        for(var i=0; i<WOC.WPSService.SUPPORTED_VERSIONS.length; i++) {
                                if(i != 0) {
                                        params += ",";
                                }
                                params += WOC.WPSService.SUPPORTED_VERSIONS[i];
                        }
                        // params += "&language=en-US";
                        // http://dev.openlayers.org/docs/files/OpenLayers/Ajax-js.html#loadURL
                        getCapabilitiesRequest =
                                OpenLayers.loadURL(url + params, '', this,
                                                targetSuccessFunction, targetFailureFunction);
                }

                /**
                 * Method: getCapabilitiesPOST
                 *     Gets the capabilities of the service using the POST method.
                 *
                 * Parameters:
                 * targetSuccessFunction - {Function} Function, which is called after
                 *     a successful getCapabilities query.
                 * targetFailureFunction - {Function} Function, which is called after
                 *     an unsuccessful getCapabilities query.
                 *
                 * See: http://schemas.opengis.net/wps/1.0.0/examples/10_wpsGetCapabilities_request.xml
                 */
                this.getCapabilitiesPOST = function(targetSuccessFunction,
                                targetFailureFunction) {
                        var requestXML = "<?xml version=\"1.0\" " +
                                        "encoding=\"UTF-8\" standalone=\"yes\"?>";
                        requestXML += this.getCapabilitiesRequestXML();
                        var options = new Object();
                        options.method = 'POST';
                        options.asynchronous = true;
                        options.contentType = 'text/xml';
                        options.onComplete = OpenLayers.Function.bind(
                                        targetSuccessFunction, this);
                        options.onFailure = OpenLayers.Function.bind(
                                        targetFailureFunction, this);
                        options.postBody = requestXML;
                        new OpenLayers.Ajax.Request(url, options);
                }

                /**
                 * Method: getCapabilitiesSOAP
                 *     Gets the capabilities of the service using the SOAP method.
                 *
                 * Parameters:
                 * targetSuccessFunction - {Function} Function, which is called after
                 *     a successful getCapabilities query.
                 * targetFailureFunction - {Function} Function, which is called after
                 *     an unsuccessful getCapabilities query.
                 *
                 * See:
                 * http://schemas.opengis.net/wps/1.0.0/examples/10_wpsGetCapabilities_request_SOAP.xml
                 */
                this.getCapabilitiesSOAP = function(targetSuccessFunction,
                                targetFailureFunction) {
                        var soapMessage = "<?xml version=\"1.0\" " +
                                        "encoding=\"UTF-8\" standalone=\"yes\"?>";
                        soapMessage += "<soap:Envelope " +
                                        "xmlns:soap=\"" + WOC.SOPE_ENVELOPE_NAMESPACE + "\" " +
                                        "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" " +
                                        "xsi:schemaLocation=\"" +
                                        "http://www.w3.org/2003/05/soap-envelope " +
                                        "http://www.w3.org/2003/05/soap-envelope\">";
                        soapMessage += "<soap:Body>";
                        soapMessage += this.getCapabilitiesRequestXML();
                        soapMessage += "</soap:Body></soap:Envelope>";
                        var options = new Object();
                        options.method = 'POST';
                        options.asynchronous = true;
                        options.contentType = 'text/xml';
                        options.onComplete = OpenLayers.Function.bind(
                                        targetSuccessFunction, this);
                        options.onFailure = OpenLayers.Function.bind(
                                        targetFailureFunction, this);
                        // Add a user-defined header - The SOAPAction
                options.requestHeaders = new Object();
                options.requestHeaders.SOAPAction = WOC.WPS_NAMESPACE + "/" +
                                "GetCapabilities";
                        options.postBody = soapMessage;
                        new OpenLayers.Ajax.Request(url, options);
                }

                /**
                 * Method: getCapabilitiesRequestXML
                 *     Returns the wps:GetCapabilities reguest's XML content.
                 *
                 * Returns:
                 * {String} The wps:GetCapabilities reguest's XML content.
                 *
                 * See:
                 * http://schemas.opengis.net/wps/1.0.0/wpsGetCapabilities_request.xsd
                 */
                this.getCapabilitiesRequestXML=function() {
                        var xml = "<wps:GetCapabilities";
                        xml += " service=\"" + WOC.WPSService.SERVICE + "\"";
                        // xml += " language=" + language;
                        xml += " xmlns:wps=\"" + WOC.WPS_NAMESPACE + "\"";
                        xml += " xmlns:ows=\"" + WOC.OWS_NAMESPACE + "\"";
                        xml += " xmlns:xlink=\"http://www.w3.org/1999/xlink\"";
                        xml += " xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"";
                        // xsi:schemaLocation (Note! KVP)
                        xml += " xsi:schemaLocation=\"" + WOC.WPS_NAMESPACE;
                        xml += " http://schemas.opengis.net/" +
                                        "wps/1.0.0/wpsGetCapabilities_request.xsd\">";
                        // Prioritized sequence of one or more specification versions
                        // accepted by this client. ows:AcceptVersionsType
                        xml += "<ows:AcceptedVersions><ows:Version>1.0.0</ows:Version>" +
                                                "</ows:AcceptedVersions></wps:GetCapabilities>";
                        return xml;
                }

                /**
                 * Method: getCapabilitiesSuccess
                 *     This method is called after a successful getCapabilities guery.
                 *
                 * Parameters:
                 * response - {XMLHttpRequest}
                 *
                 * See: http://schemas.opengis.net/wps/1.0.0/examples/20_wpsGetCapabilities_response.xml
                 */
                this.getCapabilitiesSuccess = function(response) {
                        var xmlDoc = WOC.getDomDocumentFromResponse(response);
                        if(xmlDoc) {
                                var capabilities = WOC.getElementsByTagNameNS(
                                                xmlDoc, WOC.WPS_NAMESPACE, WOC.WPS_PREFIX,
                                                'Capabilities').item(0);
                                this.getCapabilitiesResponseHandlind(capabilities);
                        }
                }

                /**
                 * Method: getCapabilitiesSOAPSuccess
                 *     This method is called after a successful getCapabilities guery
                 *     which has been made using SOAP.
                 *
                 * Parameters:
                 * response - {XMLHttpRequest}
                 *
                 * See: http://schemas.opengis.net/wps/1.0.0/examples/20_wpsGetCapabilities_response_SOAP.xml
                 */
                this.getCapabilitiesSOAPSuccess = function(response) {
                        var xmlDoc = WOC.getDomDocumentFromResponse(response);
                        if(xmlDoc) {
                                var envelope = WOC.getElementsByTagNameNS(
                                                xmlDoc, WOC.SOAP_ENVELOPE_NAMESPACE,
                                                WOC.SOAP_ENVELOPE_PREFIX, 'Envelope').item(0);
                                var body = WOC.getElementsByTagNameNS(
                                                envelope, WOC.SOAP_ENVELOPE_NAMESPACE,
                                                WOC.SOAP_ENVELOPE_PREFIX, 'Body').item(0);
                                var capabilities = WOC.getElementsByTagNameNS(
                                                body, WOC.WPS_NAMESPACE, WOC.WPS_PREFIX,
                                                'Capabilities').item(0);
                                this.getCapabilitiesResponseHandlind(capabilities);
                        }
                }

                /**
                 * Method:getCapabilitiesResponseHandlind
                 *
                 *
                 * Parameters:
                 * capabilities - {DOMElement} The wps:Capabilities element of the
                 * GetCapabilities operation's response.
                 *
                 * See: http://schemas.opengis.net/wps/1.0.0/examples/20_wpsGetCapabilities_response.xml
                 */
                this.getCapabilitiesResponseHandlind = function(capabilities) {
                        try {
                                this.checkResponseVersionServiceLang(capabilities);
                        } catch(e) {
                                if(e == 'WrongOrMissingVersionEx') {
                                        client.updateInfoText("Service version was wrong or not " +
                                                "found in the WPS GetCapabilities-operation response!", "red");
                                } else if(e == 'WrongOrMissingServiceEx') {
                                        client.updateInfoText("Service name was wrong or not " +
                                                "found in the WPS GetCapabilities-operation response!", "red");
                                } else if(e == 'WrongOrMissingLangEx') {
                                        client.updateInfoText("Service language was wrong or not " +
                                                "found in the WPS GetCapabilities-operation response!", "red");
                                } else {
                                        client.updateInfoText("Undefined exception occured " +
                                                        "while getting the capabilities!", 'red');
                                }
                                return;
                        }
                        // var serviceIdentification = capabilities.getElementsByTagName("ServiceIdentification").item(0);
                        // Service identification
                        metadata.parseFromNode(
                                        WOC.getElementsByTagNameNS(
                                                        capabilities, WOC.OWS_NAMESPACE,
                                                        WOC.OWS_PREFIX,
                                                        'ServiceIdentification')[0]);
                        // Service Provider



                        // Operations Metadata
                        // server.operationsMetadata = xmlDoc.getElementsByTagName("OperationsMetadata");



                        // Process offerings
                        var processOfferingsNode = WOC.getElementsByTagNameNS(
                                        capabilities, WOC.WPS_NAMESPACE,
                                        WOC.WPS_PREFIX, 'ProcessOfferings').item(0);
                        var processNodes = WOC.getElementsByTagNameNS(
                                        processOfferingsNode, WOC.WPS_NAMESPACE,
                                        WOC.WPS_PREFIX, 'Process');
                        // hier werden die title, abstract und identifier für jeden Prozess gespeichert
                        for(var i=0; i<processNodes.length; i++) {
                                var wpsProcess = new WOC.WPSProcess();
                                wpsProcess.parseCapabilitiesNode(processNodes[i]);

                                processes[wpsProcess.getIdentifier()] = wpsProcess;    // processes ist also ein array aus tupel string identifier() und process?
                        }
                        client.updateCapabilities();
                }

                /**
                 * Method: getCapabilitiesPopupSuccess
                 *     This method is called after a successful getCapabilities guery
                 *     whose response the user wants to view.
                 *
                 * Parameters:
                 * response - {XMLHttpRequest}
                 */
                this.getCapabilitiesPopupSuccess = function(response) {
                        var documentRoot = WOC.getDomDocumentFromResponse(
                                        response).documentElement;
                        WOC.popupXML("WPS GetCapabilities-operation response",
                                        [documentRoot]);
                }

                /**
                 * Method: getCapabilitiesFailure
                 *     This method is called after an unsuccessful getCapabilities
                 *     guery.
                 *
                 * Parameters:
                 * response - {XMLHttpRequest}
                 */
                this.getCapabilitiesFailure = function(response) {
                        client.updateInfoText("WPS GetCapabilities-operation request failed!",
                                        "red");
                }

                /**
                 * Method: popupProcessDescriptions
                 *    This method calls the DescribeProcess-operation to show to the
                 *    user the descriptions of the wanted processes.
                 *
                 * Parameters:
                 * processIdentifiers - {Array} An array of process identifiers, whose
                 *     descriptions are to be queried.
                 * method - {String} Method to be used. Can be GET, POST or SOAP. The
                 *     default method is GET.
                 */
                this.popupProcessDescriptions = function(processIdentifiers, method) {
                        if(method == "POST") {
                                this.describeProcessPOST(processIdentifiers,
                                                this.getDescriptionPopupSuccess,
                                                this.getDescriptionFailure);
                        } else if(method == "SOAP") {
                                this.describeProcessSOAP(processIdentifiers,
                                                this.getDescriptionPopupSuccess,
                                                this.getDescriptionFailure);
                        } else {
                                // Default choice
                                this.describeProcessGET(processIdentifiers,
                                        this.getDescriptionPopupSuccess,
                                        this.getDescriptionFailure, true);
                        }
                }

                /**
                 * Method: describeProcesses
                 *    This method calls the DescribeProcess-operation to get the
                 *    descriptions of the wanted processes.
                 *
                 * Parameters:
                 * processIdentifiers - {Array} An array of process identifiers, whose
                 *     descriptions are to be queried.
                 * method - {String} Method to be used. Can be GET, POST or SOAP. The
                 *     default method is GET.
                 */
                this.describeProcesses = function(processIdentifiers, method) {
                        if(method == "POST") {
                                this.describeProcessPOST(processIdentifiers,
                                                this.getDescriptionSuccess,
                                                this.getDescriptionFailure);
                        } else if(method == "SOAP") {
                                this.describeProcessSOAP(processIdentifiers,
                                                this.getDescriptionSOAPSuccess,
                                                this.getDescriptionFailure);
                        } else {
                                // Default choice
                                this.describeProcessGET(processIdentifiers,
                                        this.getDescriptionSuccess,
                                        this.getDescriptionFailure, true);
                        }
                }

                /**
                 * Method: describeProcessGET
                 *    This method calls the DescribeProcess-operation using the
                 *    GET method.
                 *
                 * Parameters:
                 * processIdentifiers - {Array} An array of process identifiers, whose
                 *     descriptions are to be queried.
                 * targetSuccessFunction - {Function} Called after a successful
                 *     query to the service.
                 * targetFailureFunction - Called after a failed query to the service.
                 * update - {Boolean} if the WPSClient should update the process description GUI or not // by Raphael Rupprecht
                 */
                this.describeProcessGET = function(processIdentifiers,
                                targetSuccessFunction, targetFailureFunction, update) {
                        if(update){   // wenn update=true ist, ist die targetSuccessFunction eine andere (getDescriptionSuccess())
                                // Check that at least one identifier is given!
                                if(processIdentifiers.length < 1) {return;}
                                var params = "?service=" + WOC.WPSService.SERVICE;
                                params += "&request=DescribeProcess";
                                params += "&version=" + version;
                                // params += "&Language=en-US;";
                                params += "&Identifier=";
                                params += processIdentifiers[0];
                                // alert("ProcessIdentifier: " + processIdentifiers[0]);
                                for(var i=1; i<processIdentifiers.length; i++) {
                                        params += "," + processIdentifiers[i];
                                }
                                // http://dev.openlayers.org/docs/files/OpenLayers/Ajax-js.html#loadURL
                                OpenLayers.loadURL(url + params, '', this,
                                                targetSuccessFunction, targetFailureFunction);
                        }
                        // the client should not update the GUI!  rr5
                        else{
                                // Check that at least one identifier is given!
							if(processIdentifiers.length < 1) {return;}
							for(var r=0; r<processIdentifiers.length; r++){			
								if(typeof processFilter != 'undefined' && processFilter.length > 0){					// checking the global processFilter
									for(var i=0; i<processFilter.length; i++){		
										if(processFilter[i] == processIdentifiers[r]){	// only if the current process is inside the processFilter[], request the describeProcess
											var params = "?service=" + WOC.WPSService.SERVICE;
											params += "&request=DescribeProcess";
											params += "&version=" + version;
											// params += "&Language=en-US;";
											params += "&Identifier=";
											params += processIdentifiers[r];
											OpenLayers.loadURL(url + params, '', this,                     // rr6
																targetSuccessFunction, targetFailureFunction);
											break;
										}
									}
								} else {
									var params = "?service=" + WOC.WPSService.SERVICE;
									params += "&request=DescribeProcess";
									params += "&version=" + version;
									// params += "&Language=en-US;";
									params += "&Identifier=";
									params += processIdentifiers[r];
									OpenLayers.loadURL(url + params, '', this,                     // rr6
														targetSuccessFunction, targetFailureFunction);									
								}
							}
                        }
                }

                /**
                 * Method: describeProcessPOST
                 *    This method calls the DescribeProcess-operation using the
                 *    POST method.
                 *
                 * Parameters:
                 * processIdentifiers - {Array} An array of process identifiers, whose
                 *     descriptions are to be queried.
                 * targetSuccessFunction - {Function} Called after a successful
                 *     query to the service.
                 * targetFailureFunction - Called after a failed query to the service.
                 *
                 * See:
                 * http://schemas.opengis.net/wps/1.0.0/examples/30_wpsDescribeProcess_request.xml
                 * http://schemas.opengis.net/wps/1.0.0/wpsDescribeProcess_request.xsd
                 * http://schemas.opengis.net/wps/1.0.0/common/RequestBaseType.xsd
                 */
                this.describeProcessPOST = function(processIdentifiers,
                                targetSuccessFunction, targetFailureFunction) {
                        var requestXML = "<?xml version=\"1.0\" " +
                                        "encoding=\"UTF-8\" standalone=\"yes\"?>";
                        requestXML += this.describeProcessRequestXML(processIdentifiers);
                        var options = new Object();
                        options.method = 'POST';
                        options.asynchronous = true;
                        options.contentType = 'text/xml';
                        options.onComplete = OpenLayers.Function.bind(
                                        targetSuccessFunction, this);
                        options.onFailure = OpenLayers.Function.bind(
                                        targetFailureFunction, this);
                        options.postBody = requestXML;
                        new OpenLayers.Ajax.Request(url, options);
                        // alert("DescribeProcess with POST method was called! " + requestXML);
                }

                /**
                 * Method: describeProcessSOAP
                 *    This method calls the DescribeProcess-operation using the
                 *    SOAP method.
                 *
                 * Parameters:
                 * processIdentifiers - {Array} An array of process identifiers, whose
                 *     descriptions are to be queried.
                 * targetSuccessFunction - {Function} Called after a successful
                 *     query to the service.
                 * targetFailureFunction - Called after a failed query to the service.
                 *
                 * See: http://schemas.opengis.net/wps/1.0.0/examples/30_wpsDescribeProcess_request_SOAP.xml
                 */
                this.describeProcessSOAP = function(processIdentifiers,
                                targetSuccessFunction, targetFailureFunction) {
                        var soapMessage = "<?xml version=\"1.0\" " +
                                        "encoding=\"UTF-8\" standalone=\"yes\"?>";
                        soapMessage += "<soap:Envelope " +
                                        "xmlns:soap=\"" + WOC.SOPE_ENVELOPE_NAMESPACE + "\" " +
                                        "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" " +
                                        "xsi:schemaLocation=\"" +
                                        "http://www.w3.org/2003/05/soap-envelope " +
                                        "http://www.w3.org/2003/05/soap-envelope\">";
                        soapMessage += "<soap:Body>";
                        soapMessage += this.describeProcessRequestXML(processIdentifiers);
                        soapMessage += "</soap:Body></soap:Envelope>";
                        var options = new Object();
                        options.method = 'POST';
                        options.asynchronous = true;
                        options.contentType = 'text/xml';
                        options.onComplete = OpenLayers.Function.bind(
                                        targetSuccessFunction, this);
                        options.onFailure = OpenLayers.Function.bind(
                                        targetFailureFunction, this);
                        // Add a user-defined header - The SOAPAction
                options.requestHeaders = new Object();
                options.requestHeaders.SOAPAction = WOC.WPS_NAMESPACE + "/" +
                                "DescribeProcess";
                        options.postBody = soapMessage;
                        new OpenLayers.Ajax.Request(url, options);
                }

                /**
                 * Method: describeProcessRequestXML
                 *     Returns the wps:DescribeProcess reguest's XML content.
                 *
                 * Returns:
                 * {String} The wps:DescribeProcess reguest's XML content.
                 *
                 * See:
                 * http://schemas.opengis.net/wps/1.0.0/wpsDescribeProcess_request.xsd
                 */
                this.describeProcessRequestXML = function(processIdentifiers) {
                        var xml = "<wps:DescribeProcess";
                        xml += " service=\"" + WOC.WPSService.SERVICE + "\"";
                        xml += " version=\"" + version + "\"";
                        // xml += " language=" + language;
                        xml += " xmlns:wps=\"" + WOC.WPS_NAMESPACE + "\"";
                        xml += " xmlns:ows=\"" + WOC.OWS_NAMESPACE + "\"";
                        xml += " xmlns:xlink=\"http://www.w3.org/1999/xlink\"";
                        xml += " xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"";
                        // xsi:schemaLocation (Note! KVP)
                        xml += " xsi:schemaLocation=\"" + WOC.WPS_NAMESPACE;
                        xml += " http://schemas.opengis.net/" +
                                        "wps/1.0.0/wpsDescribeProcess_request.xsd\">";
                        for(var i=0; i<processIdentifiers.length; i++) {
                                xml += "<ows:Identifier>" +
                                                processIdentifiers[i] + "</ows:Identifier>";
                        }
                        xml += "</wps:DescribeProcess>";
                        return xml;
                }

                /**
                 * Method: getDescriptionSuccess
                 *     This method is called after a successful DescribeProcess guery.
                 *
                 * Parameters:
                 * response - {XMLHttpRequest}
                 */
                this.getDescriptionSuccess = function(response) {
                        // alert(response.responseText);
                        var xmlDoc = WOC.getDomDocumentFromResponse(response);
                        if(xmlDoc) {
                                var processDescriptionsNodes = WOC.getElementsByTagNameNS(
                                                xmlDoc, WOC.WPS_NAMESPACE,
                                                WOC.WPS_PREFIX, 'ProcessDescriptions');
                                this.describeProcessResponseHandlind(
                                                processDescriptionsNodes.item(0), true);
                        } else {
                                alert("ProcessDescription xmlDoc was NULL!!!!");
                                // TODO In case the ProcessDescription xmlDoc is NULL!
                        }
                }

                // TODO  rr7
                this.getDescriptionSuccessNoUpdate = function(response) {
                        //alert(response.responseText);
                        var xmlDoc = WOC.getDomDocumentFromResponse(response);
                        if(xmlDoc) {
                                //alert(xmlDoc.firstChild.firstChild.innerText);          // little summary
                                //alert(xmlDoc.firstChild.firstChild.childNodes[1].innerText);        // process identifier
                                var processDescriptionsNodes = WOC.getElementsByTagNameNS(
                                                xmlDoc, WOC.WPS_NAMESPACE,
                                                WOC.WPS_PREFIX, 'ProcessDescriptions');
                                this.describeProcessResponseHandlind(
                                                processDescriptionsNodes.item(0), false);             // rr8
                        } else {
                                alert("ProcessDescription xmlDoc was NULL!!!!");
                                // TODO In case the ProcessDescription xmlDoc is NULL!
                        }
                }

                /**
                 * Method: getDescriptionSOAPSuccess
                 *     This method is called after a successful DescribeProcess
                 *     operation guery made using SOAP.
                 *
                 * Parameters:
                 * response - {XMLHttpRequest}
                 *
                 * See: http://schemas.opengis.net/wps/1.0.0/examples/20_wpsGetCapabilities_response_SOAP.xml
                 */
                this.getDescriptionSOAPSuccess = function(response) {
                        var xmlDoc = WOC.getDomDocumentFromResponse(response);
                        if(xmlDoc) {
                                var envelope = WOC.getElementsByTagNameNS(
                                                xmlDoc, WOC.SOAP_ENVELOPE_NAMESPACE,
                                                WOC.SOAP_ENVELOPE_PREFIX, 'Envelope').item(0);
                                var body = WOC.getElementsByTagNameNS(
                                                envelope, WOC.SOAP_ENVELOPE_NAMESPACE,
                                                WOC.SOAP_ENVELOPE_PREFIX, 'Body').item(0);
                                var processDescriptionsNodes = WOC.getElementsByTagNameNS(
                                                body, WOC.WPS_NAMESPACE, WOC.WPS_PREFIX,
                                                'ProcessDescriptions');
                                this.describeProcessResponseHandlind(
                                                processDescriptionsNodes.item(0), true);
                        }
                }

                /**
                 * Method: describeProcessResponseHandlind
                 * Parameters:
                 * processDescriptionsNode - {DOMElement} A wps:ProcessDescriptions node.
                 * update - {Boolean} if the WPSClient should update the process description GUI or not // by Raphael Rupprecht
                 */
                this.describeProcessResponseHandlind = function(processDescriptionsNode, update) {
                        var processDescriptionNodes = WOC.getElementsByTagNameNS(
                                        processDescriptionsNode, WOC.WPS_NAMESPACE,
                                        WOC.WPS_PREFIX, 'ProcessDescription');
                        for(var i=0; i<processDescriptionNodes.length; i++) {
                                var processIdentifier = WOC.getElementsByTagNameNS(     // rr9
                                                processDescriptionNodes[i], WOC.OWS_NAMESPACE,
                                                WOC.OWS_PREFIX, 'Identifier')[0].firstChild.nodeValue;
                                //alert(processIdentifier);
                                if(!processes[processIdentifier]) {
                                        // TODO Unknown process in DescribeProcess !!!! Should never happen!
                                        alert("Unknown process!!!! Should never happen! " +
                                                        "Process is null:" + processIdentifier);
                                } else {
                                        try {   // rr10
                                                processes[processIdentifier].parseDescriptionNode(           // WPSProcess.parseDescriptionNode()
                                                                 processDescriptionNodes[i]);                // parses the describe-doc and saves the inputs, outputs etc.
                                        } catch(exception) {
                                                if(exception == 'AttributeMissingEx') {
                                                        //alert('1158:AttributeMissingEx');
                                                        // TODO Exception handling
                                                } else if(exception == 'ElementMissingEx') {
                                                        //alert('1161:ElementMissingEx');
                                                        // TODO Exception handling
                                                }
                                        }
                                }
                        }
                        if(update){
                                   client.updateDescription();             // update the WPSClient
                        }else{
                                   var processIdentifier = WOC.getElementsByTagNameNS(
                                                processDescriptionNodes[0], WOC.OWS_NAMESPACE,
                                                WOC.OWS_PREFIX, 'Identifier')[0].firstChild.nodeValue;
                                   // dont update... just add the process option to the selectBox
                                   var option = document.createElement('option');
                                   var process = this.getProcess(processIdentifier);
                                       option.text = process.getTitle();
                                       option.value = process.getIdentifier();

                                   //rr16
                                   if(process.getisClientSupported()==true){
                                       client.processSelection.appendChild(option);  // add the process to the process list
                                       if(client.processSelection.size == 1){
                                            client.updateDescription(); // rr17 test
                                       }else{
                                            // do nothing
                                       }
                                   }
                                   else{
                                        // dont add the process
                                   }
                        }

                }

                /**
                 * Method: getDescriptionPopupSuccess
                 *     This method is called after a successful DescribeProcess guery,
                 *     whose response is shown to the user.
                 *
                 * Parameters:
                 * response - {XMLHttpRequest}
                 */
                this.getDescriptionPopupSuccess = function(response) {
                        var documentRoot = WOC.getDomDocumentFromResponse(
                                        response);
                        WOC.popupXML("WPS DescribeProcess-operation response",
                                        [documentRoot]);
                }

                /**
                 * Method: getDescriptionFailure
                 *     This method is called after an unsuccessful DescribeProcess guery.
                 *
                 * Parameters:
                 * response - {XMLHttpRequest}
                 */
                this.getDescriptionFailure = function(response) {
                        client.updateInfoText(
                                        "WPS DescribeProcess-operation request failed!!", "red");
                }

                /**
                 * Method: execute
                 *     Calls the Execute-operation of the wanted process.
                 *
                 * Parameters:
                 * processIdentifier - {String} Identifier of the process to execute.
                 * method - {String} Method to be used. Can be GET, POST or SOAP. The
                 *     default method is POST (using XML encoding).
                 * popupExecuteRequest - {Function} Function, which is called after
                 *     a successful Execute query.
                 * popupExecuteResponse - {Function} Function, which is called after
                 *     an unsuccessful Execute query.
                 *
                 * Returns:
                 * {WOC.WPSExecution} An object presenting and managing the execution.
                 */
                this.execute = function(processIdentifier, method,
                                popupExecuteReq, popupExecuteResp, resultObject) {
                        var execution = new WOC.WPSExecution(this,
                                        processes[processIdentifier]);
                        if(method == "GET") {
                                // TODO Execute using GET
                                alert("Execute using GET is unimplement!");
                        } else if(method == "SOAP") {
                                // TODO Execute using SOAP
                                alert("Execute using SOAP is unimplement!");
                        } else {
                                // Default choice is POST
                                if(popupExecuteResp)  {
                                        this.executePOST(processIdentifier,
                                                        popupExecuteReq,
                                                        execution.executePopupSuccess,
                                                        execution.executeFailure,
                                                        execution);
                                } else {
                                        this.executePOST(processIdentifier,
                                                        popupExecuteReq,
                                                        execution.executeSuccess,
                                                        execution.executeFailure,
                                                        execution);
                                }
                        }
                        execution.updateTableRow();
                        return execution;
                }

                /**
                 * Method: executePOST
                 *     Calls the Execute-operation of the wanted process using the
                 *     POST method.
                 *
                 * Parameters:
                 * processIdentifier - {String} Identifier of the process to execute.
                 * popupRequest - {Boolean} Tells if the request should be shown to
                 *     the user.
                 * targetSuccessFunction - {Function} Function, which is called after
                 *     a successful Execute query.
                 * targetFailureFunction - {Function} Function, which is called after
                 *     an unsuccessful Execute query.
                 * responseHandlindObject - {WOC.WPSExecution} An object presenting and
                 *     managing the execution.
                 *
                 * See:
                 * http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd
                 * http://schemas.opengis.net/wps/1.0.0/common/RequestBaseType.xsd
                 */
                this.executePOST = function(processIdentifier, popupRequest, targetSuccessFunction,
                                targetFailureFunction, responseHandlindObject) 
				{
                        var requestXML = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>";
							requestXML += "<wps:Execute";
							requestXML += " service=\"" + WOC.WPSService.SERVICE + "\"";
							requestXML += " version=\"" + version + "\"";
							requestXML += " xmlns:wps=\"" + WOC.WPS_NAMESPACE + "\"";
							requestXML += " xmlns:ows=\"" + WOC.OWS_NAMESPACE + "\"";
							requestXML += " xmlns:ogc=\"" + WOC.OGC_NAMESPACE + "\"";
							requestXML += " xmlns:xlink=\"http://www.w3.org/1999/xlink\"";
							requestXML += " xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"";
							requestXML += " xsi:schemaLocation=\"" + WOC.WPS_NAMESPACE;			
							requestXML += " http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd\">";
							requestXML += "<ows:Identifier>" + processIdentifier + "</ows:Identifier>";
                        // Actual inputs.
                        try {
							requestXML += processes[processIdentifier].getDataInputsXML(client.getMap());
							//requestXML = requestXML.replace("xsi:schemaLocation","schemaLocation");			
                        } catch(exception) {
							var str = "Execute-operation could not be performed"
							if(exception == 'LayerNullEx') {
									client.updateInfoText(str + " because the layer was null!", 'red');
							} else if(exception == 'UnsupportedLayerTypeEx') {
									client.updateInfoText(str + " because the layer type is unsupported!", 'red');
							} else if(exception == 'EmptyStringValueEx') {
									client.updateInfoText(str + " because at least one value was not given!", 'red');
							} else if(exception == 'Exception') {
									client.updateInfoText(str + " because an exception occured!", 'red');
							} else {
									client.updateInfoText(str + "! Exception was " + exception, 'red');
							}
							return;
                        }
                        requestXML += "<wps:ResponseForm>";
                        // We always use the ResponseDocument!
                        // Storing is also always false as well as lineage!
                        requestXML += "<wps:ResponseDocument store=\"false\" lineage=\"false\"";
                        // Status is queried if possible!
                        if(processes[processIdentifier].statusSupported) {
                                requestXML += " status=\"true\"";
                        } else {
                                requestXML += " status=\"false\"";
                        }
                        requestXML += ">";

						// ###### the executeDoc output format ##########
						
                        for(var outputIdentifier in processes[processIdentifier].getOutputs()) {
                                var wpsOutputData = processes[processIdentifier].getOutputs()[outputIdentifier];
                                requestXML += "<wps:Output";
                                // UoM
                                // asReference. Default is false.
                                requestXML += " asReference=\"false\"";
                                // MIME type, encoding and schema
                                var complexOutput = wpsOutputData.getComplexOutput();
                                if(complexOutput != null) {
                                        // ### get the select#outputFormatSelection value, what output format the user has chosen                                       
										var selectedSchema = $("select#outputFormatSelection").val();												
                                			
										// #### the output data schema				
                                        requestXML += " schema=\""+ selectedSchema +"\"";                                                                       	
                                    	
										// #### the output data mimeType (for GML and KML = text/xml)
										requestXML += " mimeType=\"text/xml\"";
				                        
										// #### the output data encoding
				                        requestXML += " encoding=\"UTF-8\"";
                                }

                                requestXML += "><ows:Identifier>" + wpsOutputData.getIdentifier() + "</ows:Identifier>";
                                requestXML += "<ows:Title>" + wpsOutputData.getTitle() + "</ows:Title>";
                                if(wpsOutputData.getAbstract() != "") {
                                    requestXML += "<ows:Abstract>" + wpsOutputData.getAbstract() + "</ows:Abstract>";
                                }
                                requestXML += "</wps:Output>";
                        }
                        requestXML += "</wps:ResponseDocument>";
                        requestXML += "</wps:ResponseForm>";
                        requestXML += "</wps:Execute>";
                        
                        // if the checkbox for directing the executeDoc to the test.html is checked
						if(DEBUG_MODE && $("#testCheckbox")[0].checked){
							WOC.openTestHtml(requestXML, serviceList.value);
						} else {
							// Show the request to the user in case he/she wants to see it.
							if(popupRequest) {
									this.popupExecuteRequest(requestXML);
							}
							var options = new Object();
							options.method = 'POST';
							options.asynchronous = true;
							options.contentType = 'text/xml';
							// options.onSuccess= this.parseExecutePostResponse;
							options.onComplete = OpenLayers.Function.bind(
											targetSuccessFunction, responseHandlindObject);
							options.onFailure = OpenLayers.Function.bind(
											targetFailureFunction, responseHandlindObject);
							options.postBody = requestXML;
							new OpenLayers.Ajax.Request(url, options);
						}
                        // alert("Execute with POST method was called! " + requestXML);
                }
                
                /**
                 * Method: executeGET
                 *     Calls the Execute-operation of the wanted process using the
                 *     GET method.
                 *
                 * Parameters:
                 * processIdentifier - {String} Identifier of the process to execute.
                 * popupRequest - {Boolean} Tells if the request should be shown to
                 *     the user.
                 * targetSuccessFunction - {Function} Function, which is called after
                 *     a successful Execute query.
                 * targetFailureFunction - {Function} Function, which is called after
                 *     an unsuccessful Execute query.
                 * responseHandlindObject - {WOC.WPSExecution} An object presenting and
                 *     managing the execution.
                 */
                this.executeGET = function(processIdentifier, inputsData,
                                targetSuccessFunction, targetFailureFunction,
                                responseHandlindObject) {
                        var params = "?service=" + WOC.WPSService.SERVICE;
                        params += "&request=Execute";
                        params += "&version=" + version;
                        // params += "&Language=en-US
                        params += "&Identifier=" + processIdentifier;
                        // DataInputs
                        params += "&DataInputs=" + inputsData;
                        // We always use the ResponseDocument!
                        if(processes[processIdentifier].outputs.length > 0) {
                                params += "&ResponseDocument=";
                                var outputs = processes[processIdentifier].getOutputs();
                                if(outputs.length > 0) {
                                        params += outputs[0].getIdentifier();
                                }
                                for(var i=1; i<outputs.length; i++) {
                                        params += ";" + outputs[i].getIdentifier();
                                }
                        }
                        // Storing is also always false as well as lineage!
                        params += "&storeExecuteResponse=\"false\"&lineage=\"false\"";
                        // Status is queried if possible!
                        if(processes[processIdentifier].isStatusSupported()) {
                                params += "&status=\"true\"";
                        } else {
                                params += "&status=\"false\"";
                        }

                        if(this.executeRequestTextArea != null) {
                                this.executeRequestTextArea.text = url + params;
                        }
                        OpenLayers.loadURL(url + params, '', responseHandlindObject,
                                        targetSuccessFunction, targetFailureFunction);
                }

                /**
                 * Method: popupExecuteRequest
                 *     Shows the Execute operations request to the user.
                 *
                 * Parameters:
                 * requestString - {String} An XML string containing the reguest.
                 */
                this.popupExecuteRequest = function(requestString) {
                        var documentRoot = (new DOMParser()).parseFromString(
                                        requestString.replace(/&/g,"&amp;"),
                                        "text/xml");//.replace(/=/g,"%3D");
                        WOC.popupXML("WPS Execute-operation request",
                                        [documentRoot.documentElement]);
                }

                /**
                 * Method: getProcess
                 *     Returns the process with the given identifier, if such exists.
                 *
                 * Parameters:
                 * identifier - {String} Identifier of the process.
                 *
                 * Returns:
                 * {WOC.WPSProcess}
                 */
                this.getProcess = function(identifier) {
                        return processes[identifier];
                }

                /**
                 * Method: getProcesses
                 *     Returns all processes of the service.
                 *
                 * Returns:
                 * {HashTable of WOC.WPSProcess objects}
                 */
                this.getProcesses = function() {
                        return processes;
                }

                /**
                 * Method: getProcessCount
                 *     Returns Number of processes found in the service.
                 *
                 * Returns:
                 * {Integer} Number of processes.
                 */
                this.getProcessCount = function() {
                        var count=0;
                        for(var processKey in processes) {
                                count++;
                        }
                        return count;
                }

                /**
                 * Method: getTitle
                 *     Returns the title of the service.
                 *
                 * Returns:
                 * {String}
                 */
                this.getTitle = function() {
                        return metadata.getTitle();
                }

                /**
                 * Method: getAbstract
                 *     Returns the abstract of the object.
                 *
                 * Returns:
                 * {String}
                 */
                this.getAbstract = function() {
                        return metadata.getAbstract();
                }

                /**
                 * Method: executeResponseHandling
                 *     Forwards an execute response handling request to the client.
                 */
                this.executeResponseHandling = function(process, outputs) {
                        client.executeResponseHandling(process, outputs);
                }
        },

        /**
         * Function: sleep
         *     Sleeping some milliseconds.
         *
         * Parameters:
         * sleepingMSeconds - {Integer} Millisecond to sleep.
         */
        sleep:function(sleepingMSeconds) {
                var sleeping = true;
                var startingMSeconds = new Date().getTime();
                while(sleeping) {
                         var currentMSeconds = new Date().getTime();
                         if((currentMSeconds - startingMSeconds) > sleepingMSeconds) {
                                 sleeping = false;
                         }
                }
        },

        /**
         * Fuction: isSupportedVersion
         *     Compares the given version with the supported ones.
         *
         * Parameters:
         * version - {String} Some version of the service.
         *
         * Returns:
         * {Boolean} True if the version is supported, else false.
         */
        isSupportedVersion:function(version) {
                for(var i=0; i<WOC.WPSService.SUPPORTED_VERSIONS.length; i++) {
                        if(WOC.WPSService.SUPPORTED_VERSIONS[i] == version) {
                                return true;
                        }
                }
                return false;
        },

        /**
         * Function: checkResponseVersionServiceLang
         *     Checks that the given node includes a version and language.
         *
         * Parameters:
         * node - {DOMElement}
         *
         * Throws:
         * {WrongOrMissingVersionException}
         * {WrongOrMissingServiceException}
         * {WrongOrMissingLangException}
         */
        checkResponseVersionServiceLang:function(node) {
                // Check service!
                if(!node.hasAttribute('service')) {
                        throw 'WrongOrMissingServiceEx';
                }

                if(node.attributes.getNamedItem('service').nodeValue !=
                                WOC.WPSService.SERVICE) {
                        throw 'WrongOrMissingServiceEx';
                }

                // Check version!
                if(!node.hasAttribute('version')) {
                        throw 'WrongOrMissingVersionEx';
                }

                if(!this.isSupportedVersion(
                                node.attributes.getNamedItem('version').nodeValue)) {
                        throw 'WrongOrMissingVersionEx';
                }

                // Check language! Note we use here the xml prefix!
                if(!node.hasAttribute('lang') && !node.hasAttribute('xml:lang')) {
                        throw 'WrongOrMissingLangEx';
                }
        },

/*
        getDOMElements:function(node, elementName, namespace) {
            var list = node.getElementsByTagName(elt);
            return (list.length) ? list : node.getElementsByTagNameNS("*", elt);
        },
*/

/*
                 * Checks if there are exceptions and informs the user of those!
                 * @returns True if no exceptions have arised, else false!
                 */
                 /*
                this.checkExceptions = function() {
                        if(exceptions.length > 0) {
                                // Something bad happened!
                                var exceptionReport = "An exception occured while performing the GetCapabilities-operation.";
                                for(var i=0; i<exceptions.length; i++) {
                                        exceptionReport += "Exception code: " + exceptions[i].code + "\n";
                                        exceptionReport += "Exception text: " + exceptions[i].text + "\n\n";
                                }
                                alert(exceptionReport);
                                // Clear the exceptions!
                                exceptions = [];
                                return false;
                        }
                        return true;
                }
                */

                /**
                * Checks if there are warnings and informs the user of those!
                * @returns True if no warnings have arised, else false!
                */
                /*
                this.checkWarnings = function() {
                        if(warnings.length > 0) {
                                // Something was not totally correct!
                                var warningsReport = "An exception occured while performing the GetCapabilities-operation.\n\n";
                                for(var i=0; i<warnings.length; i++) {
                                        exceptionReport += "Exception code: " + warnings[i].code + "\n";
                                        exceptionReport += "Exception text: " + warnings[i].text + "\n\n";
                                }
                                alert(warningsReport);
                                // Clear the warnings!
                                warnings = [];
                                return false;
                        }
                        return true;
                }
                */
                        /**
        * @private
        * @param {String} dateTime
        * @returns
        */
/*
        differenceInSecondsFromCurrentTime:function(dateTime) {
                var currentTime = new Date();
                var otherTime = new Date();
                var differenceInMilliseconds = 0;
                if(dateTime.charAt(0) == '-') {
                        // Error! Time can't be negative.



                }
                // DateTime is expressed in the format
                // [-][Y*]YYYY-MM-DDThh:mm:ss[.s[s*]][TZD].
                var datePart = dateTime.split('T')[0];
                var timePart = dateTime.split('T')[1];
                otherTime.setYear(datePart.split('-')[0]);
                otherTime.setMonth(datePart.split('-')[1]);
                otherTime.setDate(datePart.split('-')[2]);
                otherTime.setHours(timePart.split(':')[0]);
                otherTime.setMinutes(timePart.split(':')[1]);
                otherTime.setSeconds(timePart.split(':')[2].substring(0,2));
                var timezone = 0;
                if(timePart.split('-').length > 1) {
                        timezone = timePart.split('-')[1];
                } else if(timePart.split('+').length > 1) {
                        timezone = timePart.split('+')[1];
                }
                // Take the possible timezone into account!
                // First convert to the time milliseconds
                var utcTime = otherTime.getTime() - (timezone * 3600000);
                otherTime = new Date(utcTime);
                return (currentTime.getTime() - otherTime.getTime())/1000;
        },
*/

/*
                this.getExceptions = function() {
                        return exceptions;
                }

                this.getWarnings = function() {
                        return warnings;
                }
*/

        CLASS_NAME:"WOC.WPSService"
});

/**
 * @final
 * Constant for the supported WPS specification versions.
 * @type Array
 */
WOC.WPSService.SUPPORTED_VERSIONS = ["1.0.0"];

/**
 * @final {string} SERVICE Constant service name.
 * @type String
 */
WOC.WPSService.SERVICE = "WPS";