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
 * Class: WOC.LiteralOutputData
 *     WPS literal input data.
 *
 * Inherits from:
 *     <WOC.LiteralData>
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 *
 */
WOC.LiteralOutputData = OpenLayers.Class(WOC.LiteralData, {
        /**
     * Constructor: WOC.LiteralOutputData
         */
        initialize: function() {
                WOC.LiteralData.prototype.initialize.apply(this);
                /**
                 * Method: parseFromNode
                 *     Parsing the properties of this object from an node.
                 *
                 * Parameters:
                 * literalDataNode - {DOMElement}
                 *
                 * Returns:
                 * {Array{WOC.ExceptionReport}} Occured warnings. Can be an empty array!
                 */
                this.parseFromNode = function(literalDataNode) {
                        // Super class method
                        return this.parseFromLiteralNode(literalDataNode);
                }
        },
        CLASS_NAME:"WOC.LiteralOutputData"
});