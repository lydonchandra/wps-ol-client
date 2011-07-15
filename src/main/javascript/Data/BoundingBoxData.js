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
 * Class: WOC.BoundingBoxData
 *     Handles the WPS bounding box data.
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 */
WOC.BoundingBoxData = OpenLayers.Class({
        /**
     * Constructor: WOC.BoundingBoxData
         */
        initialize: function() {

                /**
                 * Variable: crss
                 * {Array{String}} References to CRSs, which are allowed 
                 * to be used for input. The first one is the default CRS.
                 */
                var crss = new Array();
                
                /**
                 * Method: parseFromNode
                 *     Parses the object properties from the given node.
                 *
                 * Parameters:
                 * bbNode - {DOMElement} The wps:BoundingBoxData or 
                 *     wps:BoundingBoxOutput element.
                 */
                this.parseFromNode = function(bbNode) {
                        var defaultNode = WOC.getElementsByTagNameNS(
                                        bbNode, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'Default')[0];
                        var defaultCRS = WOC.getElementsByTagNameNS(
                                        defaultNode, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'CRS')[0];
                        // Check if the node has attributes
                        if(defaultCRS.hasAttribute("href")) {
                                // Try if the 
                                crss.push(defaultCRS.attributes.getNamedItem(
                                                "href").nodeValue);
                        } else if(defaultCRS.hasAttribute("xlink:href")) {
                                crss.push(defaultCRS.attributes.getNamedItem(
                                                "xlink:href").nodeValue);
                        } else {
                                crss.push(defaultCRS.firstChild.nodeValue);
                        }
                        
                        var supportedNodes = WOC.getElementsByTagNameNS(
                                        bbNode, WOC.WPS_NAMESPACE, 
                                        WOC.WPS_PREFIX, 'Supported');
                        for(var k=0; k<supportedNodes.length; k++) {
                                var value = "";
                                var supportedCRS = WOC.getElementsByTagNameNS(
                                                supportedNodes[k], WOC.WPS_NAMESPACE, 
                                                WOC.WPS_PREFIX, 'CRS')[0];        
                                if(supportedCRS.hasAttribute("href")) {
                                        // Try if the 
                                        value = supportedCRS.attributes.getNamedItem(
                                                        "href").nodeValue;
                                } else if(supportedCRS.hasAttribute("xlink:href")) {
                                        value = supportedCRS.attributes.getNamedItem(
                                                        "xlink:href").nodeValue;
                                } else {
                                        value = supportedCRS.firstChild.nodeValue;
                                }
                                if(value != "" && value != crss[0]) {
                                        crss.push(value);
                                }
                        }
                }
                
                /**
                * Method: createDescriptionTableData
                *     Creates a description of the data into a table data (td) element.
                *
                * Parameters:
                * td - {DOMElement} Table data, where the description is put.
                * id - {String} The identifier of the data.
                * map - {OpenLayers.Map}
                */
                this.createDescriptionTableData = function(td, id, map, color) {
                        var button = document.createElement('input');
                        button.type = 'button';
                        button.style.color = color;
                        button.value = "Select BBOX";
                        button.name = id;
                        button.id = id;
                        
                        var control = new OpenLayers.Control();
                        map.addControl(control);
                        var bboxLayer = new OpenLayers.Layer.Boxes("BBOX_bounds_" + id);
                map.addLayer(bboxLayer);
                        
                        var bboxButton = new WOC.BBOXButton(map, bboxLayer, button, control);
                        button.bboxButton = bboxButton;
                        OpenLayers.Event.observe(button, "click", 
                            OpenLayers.Function.bindAsEventListener(
                                                        bboxButton.onclick, bboxButton));
                        /*
            button.onclick = function() {
                    // Forwarding the onclick event.
                    button.bboxButton.onclick();
            }
            */
                        // TODO description + input choices of the table data!
                        td.appendChild(button);
                }
                
                /**
                * Method: getInputXMLStrFromDOMElement
                *
                * Parameters:
                * element - {DOMElement} The HTML document's element that includes 
                *     a reference to a layer, which is used to define the bounding box.
                *
                * Throws:
                * {NoBoundingBoxLayerEx} In case a layer has not been selected.
                */
                this.getInputXMLStrFromDOMElement = function(element) {
                        var inputXMLStr = "<wps:Data><wps:BoundingBoxData dimensions=\"2\"";
                        // Check that a layer includes a bounding box.
                        var bounds = element.bboxButton.getBBOX().getBounds();
                        if(!bounds) {
                                throw 'NoBoundingBoxLayerEx';
                        }
                        // Set the coordinate reference system.
                        var projection = element.bboxButton.getBBOX().getProjection();
                        var crsFound = false;
                        for(var i=0; i<crss.length; i++) {
                                if(crss[i] == projection.getCode()) {
                                        crsFound = true;
                                        i = crss.length;
                                }
                        }
                        if(!crsFound) {
                                bounds.transform(projection,
                                                new OpenLayers.Projection(crss[0], null));
                                inputXMLStr += " crs=\"" + crss[0] + "\">";
                        } else {
                                inputXMLStr += " crs=\"" + projection.getCode() + "\">";
                        }
                        // Lower Corner Coordinates of bounding box corner at which the 
                        // value of each coordinate normally is the algebraic minimum 
                        // within this bounding box a Ordered sequence of double values
                        inputXMLStr += "<ows:LowerCorner>" + bounds.left + " " + bounds.bottom +
                                        "</ows:LowerCorner>";
                        // Upper Corner Coordinates of bounding box corner at which the 
                        // value of each coordinate normally is the algebraic maximum 
                        // within this bounding box a Ordered sequence of double values 
                        inputXMLStr += "<ows:UpperCorner>" + bounds.right + " " + bounds.top +
                                        "</ows:UpperCorner>";
                        inputXMLStr += "</wps:BoundingBoxData></wps:Data>";
                        return inputXMLStr;
                }
        },
        CLASS_NAME:"WOC.BoundingBoxData"
});

/**
 * Property:WOC.BoundingBoxData.colorTable
 *     {Array{String}} An array of colors for different bounding boxes.
 */
WOC.BoundingBoxData.colorTable = ['6600FF','FF6633','0033FF','0099CC',
                '00FF33','0000FF','FF0099'];