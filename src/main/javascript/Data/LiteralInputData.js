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
 * Class: WOC.LiteralInputData
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
WOC.LiteralInputData = OpenLayers.Class(WOC.LiteralData, {
        /**
     * Constructor: WOC.LiteralInputData
         */
        initialize:function() {
                WOC.LiteralData.prototype.initialize.apply(this);
                /**
                 * Variable: allowedValues
                 * {Object} The allowed values.
                 *      The object has properties:
                 *          values - {Array{String}},
                 *          ranges - {Array{Range}}, where Range has these properties:
                 *              rangeClosure - {String},
                 *              minimumValue - {double},
                 *              maximumValue - {double} and
                 *              spacing - {double}      RR: not found in the wps 1.0.0 spec!
                 *
                 * See: ows:AllowedValues
                 */
                var allowedValues = null;
                /**
                 * Variable: valuesReference
                 * {Object} The values reference.
                 *     The object has properties:
                 *     reference - {String} and form - {String}
                 *
                 * See: wps:ValuesReferenceType
                 */
                var valuesReference = null;
                /**
                 * Variable: anyValue
                 * {Boolean} If any values are allowed 'true', else 'false'.
                 *
                 * See: ows:AnyValue
                 */
                var anyValue = false;
                /**
                 * Variable: defaultValue
                 * {String} The default value of the literal input.
                 */
                var defaultValue = "";

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
                        var warnings = this.parseFromLiteralNode(literalDataNode);
                        // Allowed values,  ValuesReference or AnyValue
                        warnings.concat(this.getAllowedValuesFromNode(literalDataNode));
                        if(!allowedValues) {
                                warnings.concat(this.getValuesReferenceFromNode(literalDataNode));
                                if(!valuesReference) {
                                         warnings.concat(this.getAnyValueFromNode(literalDataNode));
                                }
                        }
                        // Default value
                        var defaultValueNodes = WOC.getElementsByTagNameNS(
                                        literalDataNode, WOC.OWS_NAMESPACE,
                                        WOC.OWS_PREFIX, 'DefaultValue');
                        if(defaultValueNodes != null && defaultValueNodes.lengt > 0) {
                                defaultValue = defaultValueNodes[0].firstChild.nodeValue;
                        }
                        return warnings;
                }

                /**
                 * Method: getAllowedValuesFromNode
                 *     Parsing the allowed values of this object from an node.
                 *
                 * Parameters:
                 * literalDataNode - {DOMElement}
                 *
                 * Returns:
                 * {Array{WOC.ExceptionReport}} Occured warnings. Can be an empty array!
                 *
                 */
                this.getAllowedValuesFromNode = function(literalDataNode) {
                        var warnings = new Array();
                        var allowedValuesNodes = WOC.getElementsByTagNameNS(
                                        literalDataNode, WOC.OWS_NAMESPACE,
                                        WOC.OWS_PREFIX, 'AllowedValues');
                        if (allowedValuesNodes == null || allowedValuesNodes.length <= 0) {
                                return null;
                        }
                        allowedValues = new Object();
                        // Values
                        var valueNodes = WOC.getElementsByTagNameNS(
                                        allowedValuesNodes[0], WOC.OWS_NAMESPACE,
                                        WOC.OWS_PREFIX, 'Value');
                        if(valueNodes != null && valueNodes.length > 0) {
                                allowedValues.values = new Array();//[valueNodes.length];
                                for(var k=0; k<valueNodes.length; k++) {
                                        if(valueNodes[k].firstChild == null) {
                                                warnings.push(new WOC.ExceptionReport(
                                                                "TextNodeMissingEx",
                                                                "The Value-element of the AllowedValues " +
                                                                "in input data has to include a value! It " +
                                                                "can not be an empty element! The value was " +
                                                                "now converted into an ows:AnyValue type.",
                                                                new Date()));
                                                anyValue = true;
                                        } else {
                                                allowedValues.values.push(valueNodes[k].firstChild.nodeValue);
                                        }
                                }
                        } // Ends values.
                        // Ranges
                        var rangeNodes = WOC.getElementsByTagNameNS(
                                        allowedValuesNodes[0], WOC.OWS_NAMESPACE,
                                        WOC.OWS_PREFIX, 'Range');
                        if(rangeNodes != null && rangeNodes.length > 0) {
                                allowedValues.ranges = new Array();//[rangeNodes.length];
                                for(var k=0; k<rangeNodes.length; k++) {
                                        // Note here that by OWS defines that the default
                                        // value for minimumValue is negative infinity and for
                                        // maximumValue positive infinity! BUT WPS defines that the
                                        // range has to be finite, so the default values are not allowed!!!!
                                        var range = new Object();
                                        // Range closure - attribute
                                        if(rangeNodes[k].hasAttribute('rangeClosure')) {
                                                var rangeClosure = rangeNodes[k].attributes.getNamedItem(
                                                                'rangeClosure').nodeValue;
                                                if(rangeClosure == "closed" ||
                                                                rangeClosure == "open" ||
                                                                rangeClosure == "closed-open" ||
                                                                rangeClosure == "open-closed") {
                                                        range.rangeClosure = rangeClosure;
                                                } else {
                                                        warnings.push(new WOC.ExceptionReport(
                                                                "AttributeMissingEx",
                                                                "The rangeClosure-attribute of literal data " +
                                                                "range can only be closed, open, closed-open " +
                                                                "or open-closed! The value was now converted " +
                                                                "into closed.", new Date()));
                                                        range.rangeClosure = "closed";
                                                }
                                        } else {
                                                range.rangeClosure = "closed";
                                        }
                                        // Minimum value
                                        var minimumValueNodes = WOC.getElementsByTagNameNS(
                                                        rangeNodes[k], WOC.OWS_NAMESPACE,
                                                        WOC.OWS_PREFIX, 'MinimumValue');
                                        if(minimumValueNodes != null && minimumValueNodes.length > 0) {
                                                      range.minimumValue = minimumValueNodes[0].childNodes[0].nodeValue;     // error solved
                                        } else {
                                                alert("Here 1");

                                                warnings.push(new WOC.ExceptionReport(
                                                                "ElementMissingEx",
                                                                "The MinimumValue-element of range in " +
                                                                "literal input data is missing! " +
                                                                "The value is optional according to the OWS " +
                                                                "1.1 specification, but mandatory according " +
                                                                "to the WPS 1.0.0 specification.", new Date()));
                                                range.minimumValue = null;
                                        }
                                        // Maximum value
                                        var maximumValueNodes = WOC.getElementsByTagNameNS(
                                                        rangeNodes[k], WOC.OWS_NAMESPACE,
                                                        WOC.OWS_PREFIX, 'MaximumValue');
                                        if(maximumValueNodes != null && maximumValueNodes.length > 0) {
                                                range.maximumValue = maximumValueNodes[0].childNodes[0].nodeValue;
                                        } else {
                                                //TODO: fehler
                                                alert("The MaximumValue-element of range in " +
                                                        "literal input data is missing! " +
                                                        "The value is optional according to the OWS " +
                                                        "1.1 specification, but mandatory according " +
                                                        "to the WPS 1.0.0 specification.");

                                                warnings.push(new WOC.ExceptionReport(
                                                                "ElementMissingEx",
                                                                "The MaximumValue-element of range in " +
                                                                "literal input data is missing! " +
                                                                "The value is optional according to the OWS " +
                                                                "1.1 specification, but mandatory according " +
                                                                "to the WPS 1.0.0 specification.", new Date()));
                                                range.maximumValue = null;
                                        }

                                        /* Spacing                   // RR: not found in the wps 1.0.0 spec
                                        var spacingNodes = WOC.getElementsByTagNameNS(
                                                        rangeNodes[k], WOC.OWS_NAMESPACE,
                                                        WOC.OWS_PREFIX, 'Spacing');
                                        if(spacingNodes != null && spacingNodes.length > 0) {
                                                range.spacing = spacingNodes[0].childNode.nodeValue;
                                        } else {
                                                range.spacing = null;
                                        } */
                                        allowedValues.ranges.push(range);
                                } // Ends the for loop!
                        } // Ends ranges.
                        return warnings;
                }

                /**
                 * Method: getValuesReferenceFromNode
                 *     Parsing the values reference of this object from an node.
                 *
                 * Parameters:
                 * literalDataNode - {DOMElement}
                 *
                 * Returns:
                 * {Array{WOC.ExceptionReport}} Occured warnings. Can be an empty array!
                 *
                 */
                this.getValuesReferenceFromNode = function(literalDataNode) {
                        var warnings = new Array();
                        var valuesReferenceNodes = WOC.getElementsByTagNameNS(
                                        literalDataNode, WOC.OWS_NAMESPACE,
                                        WOC.OWS_PREFIX, 'ValuesReference');
                        if(valuesReferenceNodes != null && valuesReferenceNodes.length > 0) {
                                valuesReference = new Object();
                                valuesReference.reference = valuesReferenceNodes[0].attributes.getNamedItem(
                                                'valuesReference').nodeValue;
                                valuesReference.form = valuesReferenceNodes[0].attributes.getNamedItem(
                                                'valuesForm').nodeValue;
                        }
                        return warnings;
                }

                /**
                 * Method: getAnyValueFromNode
                 *     Parsing the anyValue of this object from an node.
                 *
                 * Parameters:
                 * literalDataNode - {DOMElement}
                 *
                 */
                this.getAnyValueFromNode = function(literalDataNode) {
                        anyValue = false;
                        var anyValueNodes = WOC.getElementsByTagNameNS(
                                        literalDataNode, WOC.OWS_NAMESPACE,
                                        WOC.OWS_PREFIX, 'AnyValue');
                        if(anyValueNodes != null && anyValueNodes.length > 0) {
                                anyValue = true;
                        }
                }

                /**
                * Method: createDescriptionTableData
                *     Creates a description of the data into a table data (td) element.
                *
                * Parameters:
                * td - {DOMElement} Table data, where the description is put.
                * id - {String} The identifier of the data.
                */
                this.createDescriptionTableData = function(td, id) {
                        // Check data type - NOT ALL ARE CURRENTLY SUPPORTED!
                        var dataType = this.getDataType();
                        if(!dataType) {
                                return;
                        };
                        if(dataType.getReference() != null &&
                                        this.isBooleanDataType(dataType.getReference())) {
                                // If the input type is boolean then the box is added behind
                                // We now just create a dropdown field or text field
                                var booleanBox = document.createElement('input');
                                booleanBox.type = 'checkbox';
                                booleanBox.value = id;
                                booleanBox.name = id;
                                booleanBox.id = id;
                                // Add the default value.
                                if(defaultValue == 'true' || defaultValue == '1') {
                                        booleanBox.checked = true;
                                } else { // if(default == 'false' || default == '0') {
                                        booleanBox.checked = false;
                                }
                                td.appendChild(booleanBox);
                                var label = document.createElement('label');
                                label.value = "True/False";
                                label.htmlFor = id;
                                td.appendChild(label);
                        } else if(this.isSupportedTextFieldDataType(
                                        dataType.getReference())) {
                                // We now just create a dropdown field or text field
                                if(anyValue == true) {
                                        // Any value can be given - we use a text field for this!
                                        var textField = document.createElement('input');
                                        textField.name = id;
                                        textField.id = id;
                                        textField.type = 'text';
                                        textField.value = defaultValue;
                                        OpenLayers.Event.observe(textField, "click",
                                                        OpenLayers.Function.bindAsEventListener(
                                                                        WOC.textFieldClearing, textField));
                                        td.appendChild(textField);
                                } else if(allowedValues != null) {
                                        // Just some values are allowed - we use a drop down list for this!
                                        var selectList = null;
                                        // Single values
                                        if(allowedValues.values != null && allowedValues.values.length > 0) {
                                                selectList = document.createElement('select');
                                                for(var j=0; j<allowedValues.values.length; j++) {
                                                        var option = document.createElement('option');
                                                        option.value = allowedValues.values[j];
                                                        option.text = allowedValues.values[j];
                                                        selectList.appendChild(option);
                                                }
                                                td.appendChild(selectList);
                                        }
                                        // Ranges
                                        if(allowedValues.ranges != null && allowedValues.ranges.length > 0) {
                                                for(var j=0; j<allowedValues.ranges.length; j++) {
                                                      /* RR: deleted the selectBox creation, because it makes no sense
                                                             to have a selectBox with "-Infinity" and "+Infinity" option inside*/
                                                      var textField = document.createElement('input');
                                                      textField.name = id;
                                                      textField.id = id;
                                                      textField.type = 'text';
                                                      textField.value = defaultValue;
                                                      OpenLayers.Event.observe(textField, "click",
                                                      OpenLayers.Function.bindAsEventListener(
                                                      WOC.textFieldClearing, textField));
                                                      td.appendChild(textField);
                                                }
                                        }
                                } else if(valuesReference != null &&
                                                valuesReference.length > 0) {
                                        // TODO Values reference for literal data.
                                        alert("Value reference! UNIMPLEMENTED");



                                } else {
                                        // Should never happen!!!
                                        alert("This should not have happened!!! ");



                                }
                        } else {
                                // Can happen!!!
                                // TODO The datatype of literal data is unsupported!
                                alert("Datatype is unsupported! Data type:" +
                                                dataType.getReference());
                        }
                }

                /**
                * Method: getInputXMLStrFromDOMElement
                *
                * Parameters:
                * element - {DOMElement} The HTML document's element that is used to
                *     to fill in the literal data. Like an text field.
                *
                * Throws:
                * {EmptyStringValueEx} In case value is empty.
                */
                this.getInputXMLStrFromDOMElement = function(element) {
                        // Note! No reference is used here!
                        var inputXMLStr = "<wps:Data><wps:LiteralData";
                        var datatype = this.getDataType();
                        if(datatype != null && datatype.getReference() != null) {
                                inputXMLStr += " dataType=\"" + datatype.getReference() + "\"";
                        }
                        // TODO Use some of user selected allowed UoMs! Has to be implemented!
                        inputXMLStr += ">";
                        // The actual data is added here.
                        if(datatype && datatype.getReference() &
                                        this.isBooleanDataType(datatype.getReference())) {
                                // Checkbox.
                                if(element.checked) {
                                        inputXMLStr += "true";
                                } else {
                                        inputXMLStr += "false";
                                }
                        } else if(anyValue) {
                                // Any value can be given - we use a text field for this!
                                var value = element.value; //firstChild.nodeValue;
                                if(value == "") {
                                        // An empty string is not allowed!!!
                                        throw 'EmptyStringValueEx';
                                }
                                inputXMLStr += value;
                        } else if(allowedValues) {
                                // Just some values are allowed - we use a drop down list for this!
                                var optionIndex = element.options.selectedIndex;
                                inputXMLStr += element.options[optionIndex].firstChild.nodeValue;
                        } else if(valuesReference) {
                                // TODO Values reference.
                                alert("Value reference is UNIMPLEMENTED!");



                        } else {
                                // Should never happen!!!
                                alert("Exception! This should not have happened!");



                        }
                        inputXMLStr += "</wps:LiteralData></wps:Data>";
                        return inputXMLStr;
                }
        },

        /*
        * Function: isSupportedTextFieldDataType
        *    This function is used to check if the value having the datatype can be
        *    given using a text field.
        *
        *    Data types are from: XML Schema Part 2: Datatypes Second Edition
        *    (W3C Recommendation 28 October 2004).
        *
        * Parameters:
        * datatypeInclNS - {String} Data type name. Has to include the namespace!
        *
        * Returns:
        * {Boolean} True if the data type can be shown in an text field and is a
        *     supported, else false.
        */
        isSupportedTextFieldDataType:function(datatypeInclNS) {
                if(!datatypeInclNS || datatypeInclNS == "") {
                        return false;
                }
                // Removing and checking the namespace/URL.
                var datatype = datatypeInclNS.split(":");

                if(datatype[0] == "http" || datatype[0] == "https") {
                        datatype = datatypeInclNS.split("#");
                        var allowedURLs = ['http://www.w3.org/TR/xmlschema-2/',
                                        'http://www.w3.org/TR/2001/REC-xmlschema-2-20010502/'];
                        var urlAccepted = false;
                        for(var i=0; i<allowedURLs.length; i++) {
                                if(datatype[0] == allowedURLs[i]) {
                                        urlAccepted = true;
                                }
                        }
                        if(!urlAccepted) {
                                return false;
                        }
                } else if(datatype.length == 2) {
                        var allowedNamespaces = ['xs'];
                        var namespaceAccepted = false;
                        for(var i=0; i<allowedNamespaces.length; i++) {
                                if(datatype[0] == allowedNamespaces[i]) {
                                        namespaceAccepted = true;
                                }
                        }
                        if(!namespaceAccepted) {
                                return false;
                        }
                } else {
                        return false;
                }
                // Some URI is required!
                if(datatype.length != 2) {
                        return false;
                }
                var textFieldPrimitiveTypes = ['double','Double','float','Float','decimal','Decimal','anyURI','AnyURI',
                                'string','String','Duration','duration','DateTime','dateTime','Time','time','Date','date',
                                'GYearMonth','GYearMonth','GMonthDay','GDay','GMonth','GYear','qName',
                                'gMonthDay','gDay','gMonth','gYear','QName'];
                // Missing primitive types: ['xs:hexBinary', 'xs:base64Binary', 'xs:NOTATION'];

                // First check if the type is a supported primitive type.
                for(var i=0; i<textFieldPrimitiveTypes.length; i++) {
                        if(datatype[1] == textFieldPrimitiveTypes[i]) {
                                return true;
                        }
                }
                var textFieldDerivedTypes = ['integer','nonPositiveInteger',
                                'negativeInteger','long','int','short','nonNegativeInteger',
                                'unsignedLong','unsignedInt','unsignedShort','positiveInteger',
                                'normalizedString','token','language','Name','NCName'];
                // Missing derived types: ['xs:byte','xs:unsignedByte',
                // 'xs:NMTOKEN', 'xs:NMTOKENS', 'xs:ID', 'xs:IDREF', 'xs:IDREFS',
                // 'xs:ENTITY', 'xs:ENTITIES'];

                // Secondly check if the type is a supported derived type.
                for(var i=0; i<textFieldDerivedTypes.length; i++) {
                        if(datatype[1] == textFieldDerivedTypes[i]) {
                                return true;
                        }
                }
                return false;
        },

        /**
        * Function: isBooleanDataType
        *     This function is used to check if the value having the datatype can be
        *     given using a checkbox.
        *
        * Parameters
        * datatypeInclNS - {String} Data type name. Has to include the namespace!
        *
        * Returns:
        * {Boolean} True if the data type is an boolean can be shown using a
        *     checkbox, else false.
        */
        isBooleanDataType:function(datatypeInclNS) {
                if(!datatypeInclNS || datatypeInclNS == "") {
                        return false;
                }
                // Removing and checking the namespace/URL.
                var datatype = datatypeInclNS.split(":");
                if(datatype.length != 2) {
                        return false;
                }
                if(datatype[0] == "http" || datatype[0] == "https") {
                        datatype = datatypeInclNS.split("#");
                        var allowedURLs = ['http://www.w3.org/TR/xmlschema-2/',
                                        'http://www.w3.org/TR/2001/REC-xmlschema-2-20010502/'];
                        var urlAccepted = false;
                        for(var i=0; i<allowedURLs.length; i++) {
                                if(datatype[0] == allowedURLs[i]) {
                                        urlAccepted = true;
                                }
                        }
                        if(!urlAccepted) {
                                return false;
                        }
                } else if(datatype.length == 2) {
                        var allowedNamespaces = ['xs'];
                        var namespaceAccepted = false;
                        for(var i=0; i<allowedNamespaces.length; i++) {
                                if(datatype[0] == allowedNamespaces[i]) {
                                        namespaceAccepted = true;
                                }
                        }
                        if(!namespaceAccepted) {
                                return false;
                        }
                } else {
                        return false;
                }
                // Some URI is required!
                if(datatype[1] == "boolean") {
                        return true;
                }
                return false;
        },
        CLASS_NAME:"WOC.LiteralInputData"
});