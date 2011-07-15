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
 * Class: WOC.Format
 *     The format of complex data.
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 */
WOC.Format = OpenLayers.Class({
        /**
     * Constructor: WOC.Format
         */
        initialize: function() {
                /**
                * Variable: mimeType
                * {String} The MIME type of the complex data.
                * 
                * See: ows:MimeType / wps:ComplexDataDescriptionType
                */
                
                var mimeType = "";
                /**
                * Variable: schema
                * {String} The schema type of the complex data.
                * 
                * See: wps:ComplexDataDescriptionType
                */
                var schema = "";
                
                /**
                * Variable: encoding
                * {String} The encoding type of the complex data.
                * 
                * See: wps:ComplexDataDescriptionType
                */
                var encoding = "";
                
                /**
                * Method: parseFromNode
                *     Parses the format from the given node.
                *
                * Parameters:
                * node - {DOMElement} The element from which the format is parsed.
                *     The element can be for example a wps:Format element.
                * 
                * Returns:
                * {Array{WOC.ExceptionReport}} Occured warnings. Can be an empty array!
                */
                this.parseFromNode = function(node) {
                        var warnings = new Array();
                        // Lets try the OWS namespace!
                        var mimeTypeNodeList = WOC.getElementsByTagNameNS(node, 
                                        WOC.OWS_NAMESPACE, WOC.OWS_PREFIX, 
                                        'MimeType');
                                        
                        if(!mimeTypeNodeList || mimeTypeNodeList.length==0) {
                                mimeTypeNodeList = WOC.getElementsByTagNameNS(node, 
                                                WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 
                                                'MimeType');
                                if(!mimeTypeNodeList || mimeTypeNodeList.length==0) {
                                        warnings.push(new WOC.ExceptionReport(
                                                        "ElementMissingEx", 
                                                        "The MIME type of format is missing!", new Date()));
                                        return;
                                } else {
                                        warnings.push(new WOC.ExceptionReport(
                                                        "WrongNamespaceEx", 
                                                        "The namespace of the MIME type in format should " +
                                                        " be the OWS's, but is the WPS's!", new Date()));
                                }
                        }
                        mimeType = mimeTypeNodeList[0].firstChild.nodeValue;
                        // Encoding and schema are optional!
                        var encodings = WOC.getElementsByTagNameNS(node, 
                                        WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 
                                        'Encoding');
                        if(encodings != null && encodings.length > 0) {
                                encoding = encodings[0].firstChild.nodeValue;
                        }
                        var schemas = WOC.getElementsByTagNameNS(node, 
                                        WOC.WPS_NAMESPACE, WOC.WPS_PREFIX, 
                                        'Schema');
                        if(schemas != null && schemas.length > 0) {
                                schema = schemas[0].firstChild.nodeValue;
                        }
                        return warnings;
                }
                
                /**
                * Method: getMimeType
                *     Returns the MIME type of the format.
                *
                * Returns:
                * {String} MIME type.
                */
                this.getMimeType = function() {
                        return mimeType;
                }
                
                /**
                * Method: getSchema
                *     Returns the schema of the format.
                *
                * Returns:
                * {String} Schema.
                */
                this.getSchema = function() {
                        return schema;
                }
                
                /**
                * Method: getEncoding
                *     Returns the encoding of the format.
                *
                * Returns:
                * {String} Éncoding.
                */
                this.getEncoding = function() {
                        return encoding;
                }
        },
        CLASS_NAME:"WOC.ComplexData"
});
                                