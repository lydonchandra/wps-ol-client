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
 * Class: WOC.WPSOutputData
 *     Handles the WPS output data.
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
WOC.WPSOutputData = OpenLayers.Class(WOC.WPSData, {
        /**
     * Constructor: WOC.WPSOutputData
         */
        initialize: function() {
                WOC.WPSData.prototype.initialize.apply(this);
                /**
                * Variable: complexOutput
                * {WOC.ComplexData} Complex output data. Null if literal output data or 
                *     bounding box output data are given (conditional).
                */
                var complexOutput = null;
                /**
                * Variable: literalOutput
                * {WOC.LiteralOutputData} Literal output data. Null if complex output 
                *     data or bounding box output data are given (conditional).
                */
                var literalOutput = null;
                /**
                * Variable: boundingBoxOutput
                * {WOC.BoundingBoxData} Bounding box output data. Null if complex or 
                *     literal output data are given (conditional).
                */
                var boundingBoxOutput = null;
                
                /**
                * Method: parseFromNode
                *     Parsing the objects properties from a node.
                *
                * Parameters:
                * outputNode - {DOMElement}
                *
                * Throws: 
                * {AttributeMissingEx}
                * {ElementMissingEx}
                */
                this.parseFromNode = function(outputNode) {
                        // Super class method.
                        this.parseDataNode(outputNode);
                        this.getComplexOutputFromNode(outputNode);
                        if(!complexOutput) {
                                this.getLiteralOutputFromNode(outputNode);
                                if(!literalOutput) {
                                        this.getBoundingBoxOutputFromNode(outputNode);
                                        if(!boundingBoxOutput) {
                                                throw 'ElementMissingEx';
                                        }
                                }
                        }
                }
                
                /**
                * Method: getComplexOutputFromNode
                */
                this.getComplexOutputFromNode = function(outputNode) {
                        complexOutput = null;
                        var complexOutputNodes = WOC.getElementsByTagNameNS(
                                        outputNode, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'ComplexOutput');
                        if(complexOutputNodes && complexOutputNodes.length > 0) {
                                complexOutput = new WOC.ComplexData();
                                complexOutput.parseFromNode(complexOutputNodes[0]);
                        }
                }
                
                /**
                * Method: getLiteralOutputFromNode
                */
                this.getLiteralOutputFromNode = function(outputNode) {
                        literalOutput = null;
                        var literalOutputNodes = WOC.getElementsByTagNameNS(
                                        outputNode, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'LiteralOutput');
                        if(literalOutputNodes && literalOutputNodes.length > 0) {
                                literalOutput = new WOC.LiteralOutputData();
                                literalOutput.parseFromNode(literalOutputNodes[0]);
                        }
                }
                
                /**
                * Method: getBoundingBoxOutputFromNode
                */
                this.getBoundingBoxOutputFromNode = function(outputNode) {
                        boundingBoxOutput = null;
                        var bbOutputNodes = WOC.getElementsByTagNameNS(
                                        outputNode, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'BoundingBoxOutput');
                        if(bbOutputNodes && bbOutputNodes.length > 0) {
                                boundingBoxOutput = new WOC.BoundingBoxData();
                                boundingBoxOutput.parseFromNode(bbOutputNodes[0]);
                        }
                }
                
                /**
                * Method: getComplexOutput
                * {WOC.ComplexData}
                */
                this.getComplexOutput = function() {
                        return complexOutput;
                }
                
                /**
                * Method: getLiteralOutput
                * {WOC.LiteralOutputData}
                */
                this.getLiteralOutput = function() {
                        return literalOutput;
                }
                
                /**
                * Method: getBoundingBoxOutput
                * {WOC.BoundingBoxData}
                */
                this.getBoundingBoxOutput = function() {
                        return boundingBoxOutput;
                }
        },
        CLASS_NAME:"WOC.WPSOutputData"
});