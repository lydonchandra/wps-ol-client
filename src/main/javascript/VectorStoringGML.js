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
 * Class: WOC.VectorStoringGML
 *     Create a vector layer by parsing a GML file. The GML file is passed in 
 *     as a parameter.
 *
 * Inherits from:
 *     <OpenLayers.Layer.Vector>
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 */
WOC.VectorStoringGML = OpenLayers.Class(OpenLayers.Layer.Vector, {
    /**
    * Property: gmlData
    * {type} String
    */
    gmlData: "",

    /**
    * Constructor: WOC.VectorStoringGML
        *
        * Parameters:
        * name - {String} Name of the layer.
    * options - {Object} Hashtable of extra options to tag onto the layer.
    */
    initialize:function(name, options) {
        var newArguments = [];
        newArguments.push(name, options);
        OpenLayers.Layer.Vector.prototype.initialize.apply(this, newArguments);
    },
        
        /**
        * Method: setGML
        *
        * Parameters:
        * {String} GML data.
        */
        setGML:function(data) {
                this.gmlData = data;
        },
        
        /**
        * Method: getGML
        *
    * Returns:
        * {String} GML data used to create the layer.
        */
        getGML:function() {
                return this.gmlData;
        },
    CLASS_NAME: "WOC.VectorStoringGML"
});