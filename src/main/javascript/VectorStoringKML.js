/**
 * Class: WOC.VectorStoringKML
 *     Create a vector layer by parsing a KML file. The KML file is passed in 
 *     as a parameter.
 *
 * Inherits from:
 *     <OpenLayers.Layer.Vector>
 *
 * Authors:
 *      Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi, 
 * 		Raphael Rupprecht, IFGI Münster
 */
WOC.VectorStoringKML = OpenLayers.Class(OpenLayers.Layer.Vector, {
    /**
    * Property: gmlData
    * {type} String
    */
    kmlData: "",

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
        * Method: setKML
        *
        * Parameters:
        * {String} KML data.
        */
        setKML:function(data) {
                this.kmlData = data;
        },
        
        /**
        * Method: getKML
        *
    * Returns:
        * {String} KML data used to create the layer.
        */
        getKML:function() {
                return this.kmlData;
        },
    CLASS_NAME: "WOC.VectorStoringKML"
});