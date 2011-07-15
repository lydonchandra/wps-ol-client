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
 * Class: WOC.WPSData
 *     The superclass of all WPS data classes.
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
WOC.WPSData = OpenLayers.Class(WOC.IdentifiedObject, {
        /**
         *
     * Constructor: WOC.WPSData
     */
        initialize: function() {
                WOC.IdentifiedObject.prototype.initialize.apply(this);
                /**
                 * Method: parseFromNode
                 *     Parses the identification data from the given node.
                 *
                 * Parameters:
                 * node - {DOMElement}
                 *
                 * Throws:
                 * {ElementMissingEx} Some element in the node is missing!
                 * {AttributeMissingEx} Some attribute is missing!
                */
                this.parseDataNode = function(dataNode) {
                        // Get the identification data (identifier, title, abstract)
                        this.parseIdentificationNode(dataNode);
                }
        },
        CLASS_NAME:"WOC.WPSData"
});