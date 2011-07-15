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
 * Class: WOC.ExceptionReport
 *     Contains information needed to inform the user of exceptions and 
 *     warnings.
 * 
 * Currently allowed exception codes include
 *     {WrongNamespaceEx} The namespace is wrong! Like mixing wps, ogc or 
 *         ows namespaces.
 *     {ElementMissingEx} A mandatory element is missing.
 *     {AttributeMissingEx} A mandatory attribute is missing from the element.
 *     {TextNodeMissingEx} An element is empty even if it should include 
 *         something.
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 */
WOC.ExceptionReport = OpenLayers.Class({
        /**
     * Constructor: WOC.ExceptionReport
         *
         * Parameters:
         * exceptionCode - {String} Code of the exception.
     * exceptionTexts - {Array{String}} Array of exception descriptions.
         * time - {Date} Time and date when the exception occured.
     */
        initialize:function(code, texts, time) {
                /**
                * Variable: exceptionTexts
                * {Array{String}} Array of exception descriptions.
                */
                var exceptionTexts = texts;
                /**
                * Variable: exceptionCode
                * {String} Code of the exception.
                */
                var exceptionCode = code;
                /**
                * Variable: time
                * {Date} Time and date when the exception occured.
                */
                var time = time
                
                /**
                 * Method: getExceptionCode
                 *     Returns a code for the exception.
                 *
                 * Returns:
                 * {String}
                 */
                this.getExceptionCode = function() {
                        return exceptionCode;
                }
                
                /**
                 * Method: getExceptionTexts
                 *     Returns an array of exception descriptions
                 *
                 * Returns:
                 * {Array of Strings}
                 */
                this.getExceptionTexts = function() {
                        return exceptionTexts;
                }
                
                /**
                 * Method: getTime
                 *     Returns the time and date when the exception occured.
                 *
                 * Returns:
                 * {Date}
                 */
                this.getTime = function() {
                        return time;
                }
        },
        CLASS_NAME:"WOC.ExceptionReport"
});