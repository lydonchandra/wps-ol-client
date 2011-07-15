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
 * Class: WOC.WPSExecution
 *     Single WPS process execution.
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 */
WOC.WPSExecution = OpenLayers.Class({
        /**
     * Constructor: WOC.IdentifiedObject
         *
         * Parameters:
         * service - {<WOC.WPSService>} The service instance which is supposed to 
         *     execute the requested process.
         * process - {<WOC.WPSProcess>} The process that should be executed.
         */
        initialize:function(service, process) {
                /**
                 * Variable: executionTime
                 * {Date} Time when the execution began.
                 */
                var executionTime = new Date();
                /**
                 * Variable: creationTime
                 * {String} Time when the latest status response was created.
                 */
                var creationTime = "";
                /**
                 * Variable: status
                 * {String} Status of the execution.
                 */
                var status = "Initialized";
                /**
                 * Variable: statusInfo
                 * {String} More info on the status.
                 */
                var statusInfo = "Request send";
                /**
                 * Variable: process
                 * {WOC.WPSProcess} The process that is being executed.
                 */
                var process = process;
                /**
                 * Variable: service
                 * {WOC.WPSProcess} The service instance which is supposed to execute 
                 * the requested process.
                 */
                var service = service;
                /**
                 * Variable: statusLocation
                 * {String} URL of the status document.
                 */
                var statusLocation = "";
                /**
                 * Variable: percentageCompleted
                 * {Double} How many percentage of the execution has been completed.
                 */
                var percentageCompleted = 0;
                /**
                 * Variable: popupResult
                 * {Boolean} Boolean telling if the result should be shown to the user.
                 *     The default value is 'false'.
                 */
                var popupResult = false;
                /**
                 * Variable: statusColor
                 * {String} Color of the status info. 
                 *     Should be 'red', 'yellow' or 'green'.
                 */
                var statusColor = 'green';
                /**
                 * Variable: executionTimeoutObject
                 * {Object} Object handling the timeout. 
                 *     Needed while quering for the status of the execution.
                 */
                var executionTimeoutObject = null;
                /**
                 * Variable: statusQueryCount
                 * {Integer} Number of queries made to get the status of the execution.
                */
                var statusQueryCount = 0;
                /**
                 * Variable: exceptionReport
                 * {DOMElement} The Exception report DOMElement from the response.
                 */
                var exceptionReport = null;
                /**
                 * Variable: statusTableRow
                 * {DOMElement} A table row where the progress of this execution is 
                 *     updated.
                 */
                var statusTableRow = document.createElement('tr');
                
                /**
                * Method: updateFromExecuteResponse
                *     Updating this objects status based on the Execute-operations
                *     response.
                *
                * Parameters:
                * executeResponse - {DOMElement} 
                */
                this.updateFromExecuteResponse = function(executeResponseDoc) {
                        var statusNode = WOC.getElementsByTagNameNS(
                                        executeResponseDoc, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'Status')[0];
                        creationTime = statusNode.attributes.getNamedItem(
                                        'creationTime').nodeValue;
                        var accepts = WOC.getElementsByTagNameNS(
                                        statusNode, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'ProcessAccepted');
                        var starts = WOC.getElementsByTagNameNS(
                                        statusNode, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'ProcessStarted');
                        var pauses = WOC.getElementsByTagNameNS(
                                        statusNode, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'ProcessPaused');
                        var succeeds = WOC.getElementsByTagNameNS(
                                        statusNode, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'ProcessSucceeded');
                        var failes = WOC.getElementsByTagNameNS(
                                        statusNode, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'ProcessFailed');
                        if(accepts && accepts.length > 0) {
                                status = 'ProcessAccepted';
                                statusColor = 'green';
                                statusInfo = accepts[0].firstChild.nodeValue;
                                percentageCompleted = 0;
                        } else if(starts && starts.length > 0) {
                                status = 'ProcessStarted';
                                statusColor = 'green';
                                statusInfo = starts[0].firstChild.nodeValue;
                                if(starts[0].hasAttribute('percentComplited')) {
                                        percentageCompleted = starts[0].attributes.getNamedItem(
                                                        'percentComplited').nodeValue;
                                }
                        } else if(pauses && pauses.length > 0) {
                                status = 'ProcessPaused';
                                statusColor = 'yellow';
                                statusInfo = pauses[0].firstChild.nodeValue;
                                if(pauses[0].hasAttribute('percentComplited')) {
                                        percentageCompleted = pauses[0].attributes.getNamedItem(
                                                        'percentComplited').nodeValue;
                                }
                        } else if(succeeds && succeeds.length > 0) {
                                status = 'ProcessSucceeded';
                                statusColor = 'green';
                                statusInfo = succeeds[0].firstChild.nodeValue;
                                percentageCompleted = 100;
                                var processOutputs = WOC.getElementsByTagNameNS(
                                                executeResponseDoc, WOC.WPS_NAMESPACE, 
                                                WOC.WPS_PREFIX, 'ProcessOutputs')[0];
                                service.executeResponseHandling(process, processOutputs);
                        } else if(failes != null && failes.length > 0) {
                                status = 'ProcessFailed';
                                statusColor = 'red';
                                statusInfo = failes[0].firstChild.nodeValue;
                        } else {
                                status = 'Unknown';
                                statusColor = 'yellow';
                                statusInfo = 'Unknown';
                        }
                        // Check fot the status location.
                        if(executeResponseDoc.hasAttribute('statusLocation')) {
                                statusLocation = executeResponseDoc.attributes.getNamedItem(
                                                'statusLocation').nodeValue;
                        }
                        if(status == 'ProcessAccepted' || status == 'ProcessStarted' ||
                                        status == 'ProcessPaused') {
                                if(!succeeds && statusQueryCount == 
                                                WOC.WPSExecution.MAXIMUM_STATUS_QUERIES) {
                                        status = "Timed out";
                                        statusColor = 'red'
                                        statusInfo = "The response was cancelled after " + 
                                                        WOC.WPSExecution.MAXIMUM_STATUS_QUERIES +
                                                        " status queries.";
                                                        executionTimeoutObject = null;
                                } else if(!executionTimeoutObject) {
                                        executionTimeoutObject = setTimeout(
                                                        OpenLayers.Function.bind(
                                                                        this.queryExecutionStatusPOST, this), 
                                                                        WOC.WPSExecution.TIMEOUT_MS);
                                }
                        }
                        this.updateTableRow();
                }
                
                /**
                 * Method: getExecutionTime
                 *     Returns the time when the process Execution request was send.
                 * 
                 * Returns:
                 * {Date}
                 */
                this.getExecutionTime = function() {
                        return executionTime;
                }
                
                /**
                 * Method: getCreationTime
                 *     Returns the time when the latest status report arrived.
                 * 
                 * Returns:
                 * {Date}
                 */
                this.getCreationTime = function() {
                        return executionTime;
                }
                
                /**
                 * Method: getStatus
                 *    Returns the current status of the execution.
                 * 
                 * Returns:
                 * {String}
                 */
                this.getStatus = function() {
                        return status;
                }
                
                /**
                 * Method: getStatusInfo
                 *     Returns info on the status, like what the status response 
                 *     message contained.
                 * 
                 * Returns:
                 * {String}
                 */
                this.getStatusInfo = function() {
                        return statusInfo;
                }

                /**
                 * Method: getStatusLocation
                 *     Returns the location (URL) of the status document.
                 * 
                 * Returns:
                 * {String}
                 */
                this.getStatusLocation = function() {
                        return statusLocation;
                }
                
                /**
                 * Method: getPercentageCompleted
                 *     Returns the precentage telling how much of the execution has 
                 *     already succeeded.
                 * 
                 * Returns:
                 * {Integer}
                 */
                this.getPercentageCompleted = function() {
                        return percentageCompleted;
                }
                
                /**
                 * Method: getStatusTableRow
                 *     Returns a table row containing status information on the 
                 *     execution.
                 * 
                 * Returns:
                 * {DOMElement}
                 */
                this.getStatusTableRow = function() {
                        return statusTableRow;
                }
                
                /**
                * Method: updateTableRow
                *     Updates this elements table row based on this elements status.
                */
                this.updateTableRow = function() {
                        // Removing old elements
                        while(statusTableRow.hasChildNodes()) {
                                statusTableRow.removeChild(statusTableRow.childNodes.item(0));
                        }
                        // Service title
                        var serviceTitleTD = document.createElement('td');
                        serviceTitleTD.appendChild(document.createTextNode(
                                        service.getTitle()));
                        statusTableRow.appendChild(serviceTitleTD);
                        // Process title
                        var processTitleTD = document.createElement('td');
                        processTitleTD.appendChild(document.createTextNode(
                                        process.getTitle()));
                        statusTableRow.appendChild(processTitleTD);
                        // Status
                        var statusDataElem = document.createElement('td');
                        statusDataElem.appendChild(document.createTextNode(status));
                        statusDataElem.style.color = statusColor;
                        statusTableRow.appendChild(statusDataElem);
                        // Percentage complited
                        var percentageDataElem = document.createElement('td');
                        percentageDataElem.appendChild(document.createTextNode(
                                percentageCompleted + '%'));
                        statusTableRow.appendChild(percentageDataElem);
                        // StatusInfo
                        var statusInfoDataElem = document.createElement('td');
                        if(exceptionReport) {
                                var button = document.createElement('input');
                                button.type = 'button';
                                button.report = exceptionReport;
                                button.value = 'Exception report';
                                OpenLayers.Event.observe(button, "click", 
                                    OpenLayers.Function.bindAsEventListener(
                                                                this.exceptionReportButtonClick, button));
                                statusInfoDataElem.appendChild(button);
                        } else {
                                statusInfoDataElem.appendChild(document.createTextNode(statusInfo));
                                statusInfoDataElem.style.color = statusColor;
                        }
                        statusTableRow.appendChild(statusInfoDataElem);
                }
                
                /**
                * Method: queryExecutionStatusPOST
                *     Queries the Execute-operation's status.
                */
                this.queryExecutionStatusPOST = function() {
                        if(status != 'ProcessSucceeded' && status != 'ProcessFailed' 
                                        && status != '') {
                                if(popupResult) {
                                        OpenLayers.loadURL(statusLocation, 
                                                '', this, this.executePopupSuccess, this, 
                                                this.executeFailure, this);
                                } else {
                                        OpenLayers.loadURL(statusLocation, 
                                                '', this, this.executeSuccess, this, 
                                                this.executeFailure, this);
                                }
                        }
                        // this.executionTimeoutObject.clearTimeout();
                        executionTimeoutObject = null;
                }
                
                /**
                * Method: executeSuccess
                *     Handles a successful Execute-operation response.
                *
                * Parameters:
                * response - {} 
                */
                this.executeSuccess = function(response) {
                        if(!response || typeof response=='undefined') {
                                alert("response was undefined!" + response);
                                return;
                        }
                        var xmlDoc = WOC.getDomDocumentFromResponse(response);
                        if(xmlDoc) {
                                var exceptionReportNode = WOC.getElementsByTagNameNS(
                                                xmlDoc, WOC.OWS_NAMESPACE, WOC.OWS_PREFIX, 
                                                'ExceptionReport');
                                if(exceptionReportNode && exceptionReportNode.length > 0) {
                                        exceptionReport = exceptionReportNode[0];
                                        status = "ProcessFailed";
                                        statusInfo = "";
                                        statusColor = 'red';
                                        this.updateTableRow();
                                        return;
                                }
                                var executeResponseDocNodes = WOC.getElementsByTagNameNS(
                                                xmlDoc, WOC.WPS_NAMESPACE, 
                                                WOC.WPS_PREFIX, 'ExecuteResponse');
                                if(executeResponseDocNodes && executeResponseDocNodes.length > 0) {
                                        var responseDoc = executeResponseDocNodes[0];
                                        try {
                                                service.checkResponseVersionServiceLang(responseDoc);
                                        } catch(e) {
                                                status = "Exception occured";
                                                statusColor = 'red';
                                                if(e == 'WrongOrMissingVersionEx') {
                                                        statusInfo = "Service version was wrong or not " +
                                                                "found in the WPS Execute-operation response!";
                                                } else if(e == 'WrongOrMissingServiceEx') {
                                                        statusInfo = "Service name was wrong or not " +
                                                                "found in the WPS Execute-operation response!";
                                                } else if(e == 'WrongOrMissingLangExc') {
                                                        statusInfo = "Service language was wrong or not " +
                                                                "found in the WPS Execute-operation response!";
                                                } else {
                                                        alert("Exception occured: " + e);
                                                        WOC.popupXML("Exception occured", 
                                                                        [responseDoc]);
                                                        statusInfo = "";
                                                }
                                                this.updateTableRow();
                                                return;
                                        }
                                        this.updateFromExecuteResponse(responseDoc);
                                } else {
                                        WOC.popupXML("Unexpected Execute-operation response!", 
                                                xmlDoc);
                                }
                        }
                }
                
                /**
                * Method: executePopupSuccess
                *    Popups up the Execute-operation's response before forwarding
                *    it to the actual handling of the response.
                * 
                * Parameters:
                * response - {} 
                */
                this.executePopupSuccess = function(response) {
                        var documentRoot = WOC.getDomDocumentFromResponse(response);
                        if(documentRoot) {
                                WOC.popupXML("WPS Execute-operation response", 
                                                [documentRoot]);
                        }
                        this.executeSuccess(response);
                }
                
                /**
                * Method: executeFailure
                *     Handles an unsuccessful Execute-operation response.
                *
                * Parameters:
                * response - {}
                */
                this.executeFailure = function(response) {
                        if (response.responseText.indexOf('no results') == -1 &&
                                        response.readyState==4) {
                                status = "Failed!";
                                statusInfo = "Server returned a failure message";
                                statusColor = 'red';
                        }
                }
                
                this.exceptionReportButtonClick = function() {
                        WOC.popupXML("WPS Execute-operation exception report", 
                                        [this.report]);
                }
        },
        CLASS_NAME:"WOC.WPSService"
});

/**
 * Constant: WOC.WPSExecution.TIMEOUT_MS
 *     The milliseconds to wait before a new status request is send!
 * {type} Integer
 */
WOC.WPSExecution.TIMEOUT_MS = 5000;

/**
 * Constant: WOC.WPSExecution.MAXIMUM_STATUS_QUERIES
 *     The maximum amount of queries made to the WPS service to update
 *     the status before the execution can be seen as failed (as it takes too long).
 * {type} Integer
 */
WOC.WPSExecution.MAXIMUM_STATUS_QUERIES = 20;