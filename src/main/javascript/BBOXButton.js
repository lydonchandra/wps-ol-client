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
 * Class: WOC.BBOXButton
 *     A button to determine the bounding box for input.
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.2 / 7.10.2008
 */
WOC.BBOXButton = OpenLayers.Class({

        /**
     * Constructor: WOC.BBOXButton
         *
     */
        initialize:function(map, bboxLayer, button, control) {
                /**
                * Variable: bbox
                * {WOC.BBOX} The bounding box.
                */
                var bbox = new WOC.BBOX();
                // Convert the map's projection into an projection object.
                bbox.setProjection(new OpenLayers.Projection(map.projection, null));
        var polygonHandler = new OpenLayers.Handler.RegularPolygon(control, 
                    {}, {sides: 4, irregular: true, persist:true});
        
                this.onclick = function() {
                        this.setActivated(!control.active);
                }
                
                this.updateBounds = function(event) {
                        if(polygonHandler.feature && polygonHandler.feature.geometry) {
                    bboxLayer.clearMarkers();
                    var bounds = polygonHandler.feature.geometry.getBounds();
                    // Because we use persist, we need to clear the handler's feature!
                    polygonHandler.clear();
                    var box = new OpenLayers.Marker.Box(bounds, button.style.color, 2);
                    bboxLayer.addMarker(box);
                    bboxLayer.redraw();
                    bbox.setBounds(bounds);
                    // bbox.setProjection(polygonHandler.feature.layer.projection);
            }
            OpenLayers.Event.stop(event, true);
                }
                
                /**
                 * Method: isActivated
                 *     Tells if the button is activated.
                 *
                 * Returns:
                 * {Boolean} True if activated, else false.
                 */
                this.isActivated = function() {
                        return control.active;
                }
                
                /**
                 * Method: setActivated
                 *     Sets the button's activation.
                 *
                 * Parameters :
                 * rule - {Boolean} True if activated, else false.
                 */
                this.setActivated = function(rule) {
                        if(rule) {
                                control.activate();
                                polygonHandler.activate();
                                map.events.register('mouseup', map, this.updateBounds);
                                button.style.fontWeight = 'bold';
                        } else {
                                control.deactivate();
                                polygonHandler.deactivate();
                                button.style.fontWeight = 'normal';
                                map.events.unregister('mouseup', map, this.updateBounds);
                        }
                }
                
                /**
                 * Method: getBBOX
                 *     Returns the bounding box.
                 *
                 * Returns:
                 * {WOC.BBOX} The bounding box.
                 */
                this.getBBOX = function() {
                        return bbox;
                }
        },
        CLASS_NAME:"WOC.BBOXButton"
});