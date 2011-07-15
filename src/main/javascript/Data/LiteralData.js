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
 * Class: WOC.LiteralData
 *     Handles the WPS literal data.
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 *
 * Updated:
 *     25.09.2008 - Uses <WOC.UoM> and <WOC.DataType>
 */
WOC.LiteralData = OpenLayers.Class({
        /**
     * Constructor: WOC.LiteralData
         */
        initialize: function() {
                /**
                 * Variable: dataType
                 * {WOC.DataType} The data type of the literal data. 
                 *      Has properties name and reference. By default the reference is 
                 *      'xs:String'.
                 */
                var dataType = null;
                /**
                 * Variable: uoms
                 * {Array{WOC.UoM}} The Units of Measure for the literal data.
                 *     An UoM (the object in the array) has properties name and
                 *     reference.
                 */
                var uoms = null;
                
                /**
                 * Method: parseFromLiteralNode
                 *     Parses this objects properties from the given node.
                 *
                 * Parameters:
                 * literalDataNode - {DOMElement} The node, from which the properties are 
                 *     read. For example a wps:LiteralInput element.
                 *
                 * Returns:
                 * {Array{WOC.ExceptionReport}} Occured warnings. Can be an empty array!
                 *
                 * Throws:
                 * {ElementMissingEx} Some element in the node is missing!
                 */
                this.parseFromLiteralNode = function(literalDataNode) {
                        var warnings = new Array();
                        var dataTypeNodes = WOC.getElementsByTagNameNS(
                                        literalDataNode, WOC.OWS_NAMESPACE, 
                                        WOC.OWS_PREFIX, 'DataType');
                        // Data type.
                        if(dataTypeNodes != null && dataTypeNodes.length > 0) {
                                warnings.concat(this.setDataType(dataTypeNodes[0]));
                        }
                        // Units of Measure
                        var uomsNodes = WOC.getElementsByTagNameNS(
                                        literalDataNode, WOC.OWS_NAMESPACE, 
                                        WOC.OWS_PREFIX, 'UOMs');
                        if(uomsNodes.length > 0) {
                                warnings.concat(this.setUOMs(uomsNodes[0]));
                        }
                        return warnings;
                }
                
                /**
                 * Method: setUOMs
                 *     Sets the UoMs of the literal data.
                 *
                 * Parameters:
                 * uomsNode - {DOMElement} The node, from which the UoMs are 
                 *     read. For example a wps:LiteralInput element.
                 *
                 * Returns:
                 * {Array{WOC.ExceptionReport}} Occured warnings. Can be an empty array, 
                 *     which is good :)
                 */
                this.setUOMs = function(uomsNode) {
                        // First get the default UoM
                        var warnings = new Array();
                        var reference = null;
                        var name = "";
                        uoms = new Array();
                        var defaultNode = WOC.getElementsByTagNameNS(
                                uomsNode, WOC.OWS_NAMESPACE, 
                                WOC.OWS_PREFIX, 'Default')[0];
                        var uomNode = WOC.getElementsByTagNameNS(
                                defaultNode, WOC.OWS_NAMESPACE, 
                                WOC.OWS_PREFIX, 'UOM')[0];
                                
                        if(uomNode.hasAttribute('reference')) {
                                reference = uomNode.attributes.getNamedItem(
                                                'reference').nodeValue;
                        }
                        if(!(uomNode.firstChild) || uomNode.firstChild.nodeValue == "") {
                                warnings.push(new WOC.ExceptionReport(
                                                "TextNodeMissingEx", 
                                                "Human-readable name of Unit of Measure is missing!" +
                                                "According to the OWS DomainMetadata data " +
                                                "structure an UoM always needs to include a " +
                                                "human-readable name of metadata!", new Date()));
                                name = "Undefined!";
                        } else {
                                name = uomNode.firstChild.nodeValue;
                        }
                        uoms.push(new WOC.UoM(name, reference));
                        
                        // Supported UOMs.
                        var supportedNodes = WOC.getElementsByTagNameNS(
                                uomsNode, WOC.OWS_NAMESPACE, 
                                WOC.OWS_PREFIX, 'Supported');
                        var uomNodes = WOC.getElementsByTagNameNS(
                                supportedNodes[0], WOC.OWS_NAMESPACE, 
                                WOC.OWS_PREFIX, 'UOM');
                        for(var k=0; k<uomNodes.length; k++) {
                                // For instance '<UOM ows:reference="urn:ogc:def:uom:OGC:1.0:metre">metre</UOM>'
                                reference = null;
                                if(uomNodes[k].hasAttribute('reference')) {
                                        reference = uomNodes[k].attributes.getNamedItem(
                                                        'reference').nodeValue;
                                }
                                if(!(uomNodes[k].firstChild) || 
                                                uomNodes[k].firstChild.nodeValue == "") {
                                        warnings.push(new WOC.ExceptionReport(
                                                        "TextNodeMissingEx", 
                                                        "Human-readable name of Unit of Measure missing!" +
                                                        "According to the OWS DomainMetadata data " +
                                                        "structure an UoM always needs to include a " +
                                                        "human-readable name of metadata!", new Date()));
                                        name = "Undefined!";
                                } else {
                                        name = uomNodes[k].firstChild.nodeValue;
                                }
                                uoms.push(new WOC.UoM(name, reference));
                        }
                        return warnings;
                }
                
                /**
                 * Method: setDataType
                 *     Sets the data type of the literal data.
                 *
                 * Parameters:
                 * dataTypeNode - {DOMElement} The node, from which the data type is
                 *     read. For example a wps:LiteralInput element.
                 *
                 * Returns:
                 * {Array{WOC.ExceptionReport}} Occured warnings. Can be an empty array, 
                 *     which is good :)
                 */
                this.setDataType = function(dataTypeNode) {
                        var warnings = new Array();
                        var name = "";
                        var reference = null;
                        // Reading a reference, if possible!
                        if(dataTypeNode.hasAttribute('reference')) {
                                reference = dataTypeNode.attributes.getNamedItem(
                                                'reference').nodeValue;
                        } else if(dataTypeNode.hasAttribute('ows:reference')) {
                                reference = dataTypeNode.attributes.getNamedItem(
                                                'ows:reference').nodeValue;        
                        } else if(dataTypeNode.hasAttribute(dataTypeNode.prefix+":reference")){		// example: "ns1:reference"
							reference = dataTypeNode.attributes.getNamedItem(
									dataTypeNode.prefix+":reference").nodeValue;
                    	}else {
                                // ows:DataType is set to be a String!!! Just a wild guess.
                                reference = "xs:String";
                        }
                        // Human-readable name of the data type.
                        if(dataTypeNode.firstChild == null ||
                                        dataTypeNode.firstChild.nodeValue == "") {
                                warnings.push(new WOC.ExceptionReport(
                                                "TextNodeMissingEx", 
                                                "Human-readable name of literal data type missing!" +
                                                "According to the OWS DomainMetadata data " +
                                                "structure an data type always needs to include a " +
                                                "human-readable name of metadata!", new Date()));
                                name = "Undefined!";
                        } else {
                                name = dataTypeNode.firstChild.nodeValue;
                        }
                        dataType = new WOC.DataType(name, reference);
                        return warnings;
                }
                
                /**
                 * Method: getDataType
                 *     Return the data type of the literal data.
                 *
                 * Returns:
                 * {WOC.DataType} The data type of the literal data. 
                 */
                this.getDataType = function() {
                        return dataType;
                }
                
                /**
                 * Method: getUoms
                 *     Return the UoMs of the literal data.
                 *
                 * Returns:
                 * {Array{WOC.UoM}} The Units of Measure for the literal data.
                 *     An UoM (the object in the array) has properties name and
                 *     reference.
                 */
                this.getUoms = function() {
                        return uoms;
                }
        },
        CLASS_NAME:"WOC.LiteralData"
});