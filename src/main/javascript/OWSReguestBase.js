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
 * @class
 * @author Janne Kovanen, Finnish Geodetic Institute
 */
WOC.OWSRequestBase = OpenLayers.Class({
        /**
        * @constructor
        */
        initialize:function() {
                // Mandatory parameters
                var service = "";
                var request = "";
                var version = "";
        },
        
        /**
        * @param {Node} node The having the OWS identification data.
        */
        parseFromNode:function(node) {
                title = WOC.getElementsByTagNameNS(
                                node, WOC.OWS_NAMESPACE, WOC.OWS_PREFIX, 
                                'Title')[0].firstChild.nodeValue;
                serviceType = WOC.getElementsByTagNameNS(
                                node, WOC.OWS_NAMESPACE, WOC.OWS_PREFIX, 
                                'ServiceType')[0].firstChild.nodeValue;
                serviceTypeVersion = WOC.getElementsByTagNameNS(
                                node, WOC.OWS_NAMESPACE, WOC.OWS_PREFIX, 
                                'ServiceTypeVersion')[0].firstChild.nodeValue;
                var absts = WOC.getElementsByTagNameNS(
                                node, WOC.OWS_NAMESPACE, WOC.OWS_PREFIX, 
                                'Abstract');
                if(abst != null && abst.length > 0) {
                        abst = absts[0].firstChild.nodeValue;
                }
                // server.serviceType = serviceIdentification.getElementsByTagName("ServiceType").nodeValue;
                // server.serviceTypeVersion = serviceIdentification.getElementsByTagName("ServiceTypeVersion").nodeValue;
        },
        CLASS_NAME:"WOC.OWServiceIdentification"
});