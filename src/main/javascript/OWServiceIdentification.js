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
 * Class: WOC.OWServiceIdentification
 *     Implements storing of the OWS service identification. 
 *     For more detail on the identification data see OGC 06-121r3, p.25-28
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 */
WOC.OWServiceIdentification = OpenLayers.Class({
        /**
     * Constructor: WOC.OWServiceIdentification
         */
        initialize:function() {
                /**
                * Variable: title
                * {String} The title of the OWS service.
                *     Mandatory.
                */
                var title = "";
                /**
                * Variable: serviceType
                * {String} The type of the OWS service.
                *     Mandatory.
                */
                var serviceType = "";
                /**
                * Variable: serviceTypeVersion
                * {String} The version of the OWS service's type.
                *     Mandatory.
                */
                var serviceTypeVersion = "";
                /**
                * Variable: abst
                * {String} The OWS service's abstract.
                *     Optional.
                */
                var abst = "";
                // var keywords = new Array();
                // var fees = "";
                // var accessConsraints = "";
                
                /**
                 * Method: parseFromNode
                 *     Parses the OWS identification data from the given node.
                 *
                 * Parameters: 
                 * node - {DOMElement} Node having the having the OWS identification 
                 * data.
                 */
                this.parseFromNode = function(node) {
                        title = WOC.getElementsByTagNameNS(
                                        node, WOC.OWS_NAMESPACE, WOC.OWS_PREFIX, 
                                        'Title')[0].firstChild.nodeValue;
                        serviceType = WOC.getElementsByTagNameNS(
                                        node, WOC.OWS_NAMESPACE, WOC.OWS_PREFIX, 
                                        'ServiceType')[0].firstChild.nodeValue;
                        serviceTypeVersion = WOC.getElementsByTagNameNS(
                                        node, WOC.OWS_NAMESPACE, 
                                        WOC.OWS_PREFIX, 
                                        'ServiceTypeVersion')[0].firstChild.nodeValue;
                        var abstNodes = WOC.getElementsByTagNameNS(
                                        node, WOC.OWS_NAMESPACE, 
                                        WOC.OWS_PREFIX, 
                                        'Abstract');
                        if(abstNodes && abstNodes.length > 0) {
                                abst = abstNodes[0].firstChild.nodeValue;
                        }
                }
                
                /**
                 * Method: getTitle
                 *     Returns the title of the service.
                 * 
                 * Returns:
                 * {String}
                 */
                this.getTitle = function() {
                        return title;
                }
                
                /**
                 * Method: getServiceType
                 *     Returns the abstract of the object.
                 * 
                 * Returns:
                 * {String}
                 */
                this.getServiceType = function() {
                        return serviceType;
                }
                                
                /**
                 * Method: getServiceTypeVersion
                 *     Returns the type version of the service.
                 * 
                 * Returns:
                 * {String}
                 */
                this.getServiceTypeVersion = function() {
                        return serviceTypeVersion;
                }
                                
                /**
                 * Method: getAbstract
                 *     Returns the abstract of the service.
                 * 
                 * Returns:
                 * {String}
                 */
                this.getAbstract = function() {
                        return abst;
                }
        },
        CLASS_NAME:"WOC.OWServiceIdentification"
});