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
 * Class: WOC.DataType
 *     Data type of literal data.
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.2 / 25.09.2008
 */
WOC.DataType = OpenLayers.Class({
        /**
     * Constructor: WOC.DataType
         *
         * Parameters:
         * n - {String} Name of the data type.
         * ref - {String} Reference to the data type. Can be null!
         */
        initialize: function(n, r) {
                /**
                 * Variable: name
                 * {String} Name of the data type.
                 */
                var name = n;
                /**
                 * Variable: reference
                 * {String} Reference to the data type.
                 */
                var reference = r;
                
                /**
                 * Method: getName
                 *     Returns the data types name.
                 *
                 * Returns:
                 * {String} Name of the data type.
                 */
                this.getName = function() {
                        return name;
                }
                
                 /**
                 * Method: getReference
                 *     Returns the data type's reference.
                 *
                 * Returns:
                 * {String} Reference of the data type. Can be null!
                 */
                this.getReference = function() {
                        return reference;
                }
        },
        
        CLASS_NAME:"WOC.DataType"
});