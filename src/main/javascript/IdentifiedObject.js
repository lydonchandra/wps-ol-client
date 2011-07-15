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
 * Class: WOC.IdentifiedObject
 *     Stores the identification data of object. The data includes the 
 *     identifier, title and abstract of the object.
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 */
WOC.IdentifiedObject = OpenLayers.Class({
        /**
     * Constructor: WOC.IdentifiedObject
         */
        initialize: function() {
                /**
                 * Variable: identifier
                 * {String} The identifier of the object.
                 *     Mandatory, ows:CodeType.
                 */
                var identifier = "";
                /**
                 * Variable: title
                 * {String} The title of the object.
                 *     Mandatory.
                 */
                var title = "";
                /**
                 * Variable: abst
                 * {String} Abstract of the object.
                 *     Optional.
                 */
                var abst = "";
                
                /**
                * Method: parseIdentificationNode
                *     Parses the Identifier, Title and Abstract from the given node.
                *
                * Parameters:
                * node - {DOMElement} The child nodes of this have to include a single 
                *     Identifier element and optionally an Title and an Abstract element.
                */
                this.parseIdentificationNode = function(node) {
                        // Identifier
                        identifier = WOC.getElementsByTagNameNS(
                                        node, WOC.OWS_NAMESPACE, 
                                        WOC.OWS_PREFIX, 'Identifier')[0].firstChild.nodeValue;
                        // Title
                        var titleNodes = WOC.getElementsByTagNameNS(
                                        node, WOC.OWS_NAMESPACE, 
                                        WOC.OWS_PREFIX, 'Title');
                        if(titleNodes.length > 0 && titleNodes[0].hasChildNodes()) {
                                title = titleNodes[0].firstChild.nodeValue;
                        }
                        // Abstract
                        var abstractNodes = WOC.getElementsByTagNameNS(
                                        node, WOC.OWS_NAMESPACE, 
                                        WOC.OWS_PREFIX, 'Abstract');
                        if(abstractNodes.length > 0 && abstractNodes[0].hasChildNodes()) {
                                abst = abstractNodes[0].firstChild.nodeValue;
                        }
                }
                
                /**
                 * Method: getIdentifier
                 *     Returns the identifier of the object.
                 * 
                 * Returns:
                 * {String}
                 */
                this.getIdentifier = function() {
                        return identifier;
                }
                
                /**
                 * Method: getTitle
                 *     Returns the title of the object.
                 * 
                 * Returns:
                 * {String}
                 */
                this.getTitle = function() {
                        return title;
                }
                
                /**
                 * Method: getAbstract
                 *     Returns the abstract of the object.
                 * 
                 * Returns:
                 * {String}
                 */
                this.getAbstract = function() {
                        return abst;
                }
                
                this.setAbstract = function(abs){
                	this.abst = abs;
                }
        },
        CLASS_NAME:"WOC.IdentifiedObject"
});