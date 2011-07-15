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
 * Class: WOC.BBOX
 *     A bounding box.
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.2 / 7.10.2008
 */
WOC.BBOX = OpenLayers.Class({

        /**
     * Constructor: WOC.BBOX
         *
     */
        initialize:function() {
                /**
                * Variable: projection
                * {OpenLayers.Projection} The spatial reference system.
                */
                var projection = null;
                /**
                * Variable: bounds
                * {OpenLayers.Bounds} The bounding box's bounds.
                */
                var bounds = null;
                
                /**
                 * Method: getProjection
                 *     Returns the bounding box's projection.
                 *
                 * Returns:
                 * {OpenLayers.Projection} The spatial reference system. Null is
                 *     a projection has not been defined!
                 */
                this.getProjection = function() {
                        return projection;
                }
                
                /**
                 * Method: setProjection
                 *     Sets the bounding box's projection.
                 *
                 * Parameters:
                 * s - {OpenLayers.Projection} The spatial reference system.
                 * 
                 * Throws:
                 * 'WrongArgumentEx' In case the argument is not an 
                 *     OpenLayers.Projection
                 */
                this.setProjection = function(srs) {
                        if(srs.CLASS_NAME == "OpenLayers.Projection") {
                                projection = srs;
                        } else {
                                throw 'WrongArgumentEx';
                        }
                }
                
                /**
                 * Method: getBounds
                 *     Returns the bounds of the bounding box.
                 *
                 * Returns:
                 * {OpenLayers.Bounds} The bounding box's bounds.
                 */
                this.getBounds = function() {
                        return bounds;
                }
                
                /**
                 * Method: setBounds
                 *     Sets the bounds of the bounding box.
                 *
                 * Parameters:
                 * b - {OpenLayers.Bounds} The bounding box's bounds.
                 */
                this.setBounds = function(b) {
                        bounds = b;
                }
        },
        CLASS_NAME:"WOC.BBOX"
});