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
 * Class: WOC.WPSInputData
 *     Handles the WPS input data.
 *
 * Inherits from:
 *     <WOC.WPSData>
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 */
WOC.WPSInputData = OpenLayers.Class(WOC.WPSData, {
        /**
     * Constructor: WOC.WPSInputData
         */
        initialize: function() {
                WOC.WPSData.prototype.initialize.apply(this);
                /**
                * Variable: minOccurs
                * {Integer} How many number of times the input has to be given in an 
                *     Execute request.
                * 
                * If 0 then this input data is optional. The default is 1.
                */
                var minOccurs = 1;
                /**
                * Variable: maxOccurs
                * {Integer} How many number of times the input is permitted to be given 
                *     in an Execute request. 
                * 
                * The default is 1. Has to be greater or equel to minOccurs!
                */
                var maxOccurs = 1;
                /**
                * Variable: complexData
                * {WOC.ComplexData} Complex data. Null if literal data or bounding box
                *     data are given (conditional).
                */
                var complexData = null;
                /**
                * Variable: literalData
                * {WOC.LiteralInputData} Literal data. Null if complex data or 
                *     bounding box data are given (conditional).
                */
                var literalData = null;
                /**
                * Variable: boundingBoxData
                * {WOC.BoundingBoxData} Bounding box data. Null if complex or literal
                *     data are given (conditional).
                */
                var boundingBoxData = null;
                
                /**
                * Method: parseFromNode
                *     Parsing the objects properties from a node.
                *
                * Parameters:
                * inputNode - {DOMElement}
                *
                * Throws: 
                * {AttributeMissingEx}
                * {ElementMissingEx}
                */
                this.parseFromNode = function(inputNode) {
                        // Super class method.
                        this.parseDataNode(inputNode);
                        // minOccurs and maxOccurs
                        if(inputNode.hasAttribute('minOccurs')) {
                                minOccurs = inputNode.attributes.getNamedItem('minOccurs').nodeValue;
                        } else {
                                throw 'AttributeMissingEx';
                        }
                        if(inputNode.hasAttribute('maxOccurs')) {
                                maxOccurs = inputNode.attributes.getNamedItem('maxOccurs').nodeValue;
                        } else {
                                throw 'AttributeMissingEx';
                        }
                        this.getComplexDataFromNode(inputNode);
                        if(!complexData) {
                                this.getLiteralDataFromNode(inputNode);
                                if(!literalData) {
                                        this.getBoundingBoxDataFromNode(inputNode);
                                        if(!boundingBoxData) {
                                                
                                                alert("Here 3");
                                                
                                                throw 'ElementMissingEx';
                                        }
                                }
                        }
                }
                
                /**
                * Method: getComplexDataFromNode
                *     
                */
                this.getComplexDataFromNode = function(inputNode) {
                        complexData = null;
                        var complexDataNodes = WOC.getElementsByTagNameNS(inputNode, 
                                        WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 'ComplexData');
                        if(complexDataNodes != null && complexDataNodes.length > 0) {
                                complexData = new WOC.ComplexData();
                                complexData.parseFromNode(complexDataNodes[0]);
                        }
                }
                /**
                *  Method: getLiteralDataFromNode
                */
                this.getLiteralDataFromNode = function(inputNode) {
                        literalData = null;
                        var literalDataNodes = WOC.getElementsByTagNameNS(inputNode, 
                                        WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 'LiteralData');
                        if(literalDataNodes != null && literalDataNodes.length > 0) {
                                literalData = new WOC.LiteralInputData();
                                literalData.parseFromNode(literalDataNodes[0]);
                        }
                }
                /**
                * Method: getBoundingBoxDataFromNode
                */
                this.getBoundingBoxDataFromNode = function(inputNode) {
                        boundingBoxData = null;
                        var bbDataNodes = WOC.getElementsByTagNameNS(inputNode, 
                                        WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 'BoundingBoxData');
                        if(bbDataNodes != null && bbDataNodes.length > 0) {
                                boundingBoxData = new WOC.BoundingBoxData();
                                boundingBoxData.parseFromNode(bbDataNodes[0]);
                        }
                }
                /**
                * Method: addDescriptionsToTable
                *     Creates an description and input fields if neccessary into the given
                * DOMElement
                *
                * Parameters:
                * table - {DOMElement}
                * map - {OpenLayers.Map}
                */
                this.addDescriptionsToTable = function(table, map) {
                        var bbColorTableIndex = 0;
                        for(var i=0; i<maxOccurs; i++) {
                                var dataId = 'input_' + i + '_' + this.getIdentifier();
                                var usageId = 'input_' + i + '_use_' + this.getIdentifier();
                                var tableRow = document.createElement('tr');
                                var tableElement = document.createElement('td');
                                // Title
                                if(i==0) {
                                        tableElement.appendChild(document.createTextNode(this.getTitle()));
                                }
                                tableRow.appendChild(tableElement);
                                // Usage
                                this.addUsageToTableRow(tableRow, usageId, i);
                                // Value
                                var tableData = document.createElement('td');
                                tableData.className = 'inputValue';
                                if(complexData != null) {
                                        complexData.createDescriptionTableData(tableData, dataId, map);
                                } else if(literalData != null) {
                                        literalData.createDescriptionTableData(tableData, dataId);
                                } else if(boundingBoxData != null) {
                                        var color = WOC.BoundingBoxData.colorTable[
                                                        bbColorTableIndex++];
                                        bbColorTableIndex = bbColorTableIndex%
                                                        WOC.BoundingBoxData.colorTable.length;
                                        boundingBoxData.createDescriptionTableData(tableData, 
                                                        dataId, map, color);
                                }
                                tableRow.appendChild(tableData);
                                table.appendChild(tableRow);
                        }
                }
                
                /**
                * Method: addUsageToTableRow
                * 
                * Parameters:
                * tableRow - {DOMElement} Element to which the optionality is added.
                * id - {}
                * index - {Integer} Number of input.
                */
                this.addUsageToTableRow = function(tableRow, id, index)  {
                        var tableElement = document.createElement('td');
                        tableElement.className = 'usageValue';
                        var elem = null;
                        if(index < minOccurs) {
                                // Add an image element telling that the the value is mandatory.
                                elem = document.createElement('img');
                                elem.name = id;
                                elem.id = id;
                                with(elem) {
                                        src = "img/tick.png";
                                        alt = "Mandatory";
                                }
                        } else {
                                elem = document.createElement('input');
                                elem.name = id;
                                elem.id = id;
                                elem.className = 'hiddenCheckbox';
                                with(elem) {
                                        type = 'checkbox';
                                        checked = false;
                                }
                                var img = document.createElement('img');
                                img.id = "image_" + id;
                                with(img) {
                                        className = 'usageCheckbox';
                                        src = "img/cross_box.png";
                                        alt = "Unchecked";
                                }
                                OpenLayers.Event.observe(img, "click", 
                                                OpenLayers.Function.bindAsEventListener(
                                                                WOC.checkboxChecker, this));
                                tableElement.appendChild(img);
                        }
                        tableElement.appendChild(elem);
                        tableRow.appendChild(tableElement);
                }

                /**
                 * Method: getInputXML
                 *
                 * Parameters:
                 * map - {OpenLayers.Map}
                 *
                 * Returns:
                 * {String}
                 *
                 * Throws:
                 * {LayerNullEx} Thrown by complex data handling if the 
                 *     input layer is null.
                 * {UnsupportedLayerTypeEx} Thrown if the layer type is
                 *     unsupported.
                 * {EmptyStringValueEx}
                 * {Exception} In any other exception case.
                 */
                 this.getInputXML = function(map) {
                         if(complexData == null && literalData == null &&
                                         boundingBoxData == null) {
                                 return ""; // No inputs
                         }
                         var id = this.getIdentifier();
                         var inputsXML = "";
                         for(var i=0; i<maxOccurs; i++) {
                                 if(i < minOccurs || document.getElementById('input_' + i + '_use_' + id).checked) {
                                     
 										inputsXML += "<wps:Input><ows:Identifier>" + id + "</ows:Identifier>";
 										
 										// input is a shp file (if a shp file is set, this has priority)
 										var shpInput = $("input#shpFileChooser_input_" + i + "_" + id)[0];
 										// input is in a textfield
 										var textInput = $("input#input_" + i + "_" + id)[0];
 										// input is selectBox
 										var selectBox = $("select#input_" + i + "_" + id)[0]; //$("input#input_" + i + "_use_" + id).parent().parent().find("select")[0]; //.value;									
 										
 										if(shpInput != null && shpInput.value != ""){
 											var element = shpInput;
 										}
 										else if(textInput != null){											
 											var element = textInput;
 										} 						
 										else if (selectBox != null){										
 											var element = selectBox;
 										}
 										else{
 											// error: no input element was found!
 											return ""; 
 										}
 										
                                         if(complexData) {
                                             if(element == shpInput){
 												inputsXML += complexData.getInputBase64EncodedSHPFromDOMElement(element);	// (zipped)SHP
 											} else {
 												inputsXML += complexData.getInputXMLStrFromDOMElement(element, map);	// GML / KML
 											}
                                         } else if(literalData) {
                                             inputsXML += literalData.getInputXMLStrFromDOMElement(element);
                                         } else if(boundingBoxData) {
                                             inputsXML += boundingBoxData.getInputXMLStrFromDOMElement(element);
                                         } else {
                                             throw 'Exception';
                                         }
                                         inputsXML += "</wps:Input>";
                                 }
                         }
                         return inputsXML;
                 }

                
                /**
                * Method: getMinOccurs
                * {Integer}
                */
                this.getMinOccurs = function() {
                        return minOccurs;
                }
                
                /**
                * Method: getMaxOccurs
                * {Integer}
                */
                this.getMaxOccurs = function() {
                        return maxOccurs;
                }
                
                /**
                * Method: getComplexData
                * {WOC.ComplexData}
                */
                this.getComplexData = function() {
                        return complexData;
                }
                
                /**
                * Method: getLiteralData
                * {WOC.LiteralInputData}
                */
                this.getLiteralData = function() {
                        return literalData;
                }
                
                /**
                * Method: getBoundingBoxData
                * {WOC.BoundingBoxData}
                */
                this.getBoundingBoxData = function() {
                        return boundingBoxData;
                }
        },
        CLASS_NAME:"WOC.WPSInputData"
});