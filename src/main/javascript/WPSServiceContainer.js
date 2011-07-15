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
 * Class: WOC.WPSServiceContainer
 *     The container for WPS instances.
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 *
 */
WOC.WPSServiceContainer = OpenLayers.Class({
        /**
     * Constructor: WOC.WPSServiceContainer
         */
        initialize: function() {
                /*
                * Variable: services
                * {HashTable{WOC.WPSService}} The WPS service instances.
                *     The key of the table is the name of the server.
                */
                var services = new Array();
                
                /**
                 * Method: getService
                 *     Returns a service from the container based on the given URL.
                 *
                 * Parameters: 
                 * url - {String} URL of the service.
                 * 
                 * Returns:
                 * {WOC.WPSService}
                 *
                 * Throws: 
                 * {ServiceNotFoundEx} The service is not in the container.
                 */
                this.getService = function(url) {
                        if(!services[url]) {
                                throw 'ServiceNotFoundEx';
                        }
                        return services[url];
                }
                
                /**
                * Method: getServiceCount
                *     Returns the number of services in the container.
                *
                * Returns: 
                * {Integer} The number of services.
                */
                this.getServiceCount = function() {
                        var count = 0;
                        for(var i in services) {
                                count++;
                        }
                        return count;
                }
                
                /**
                * Method: addService
                *     Adds a new WPS service instance based on the given url to the 
                *     container.
                * 
                * Parameters:
                * url - {String} URL of the service instance.
                * client - {WOC.WPSClient} The WPS client.
                * 
                * Throws:
                * {ServiceExistsEx} If the service already exists in the 
                *     container.
                * {URLEx} If the URL is unvalid.
                */
                this.addService = function(url, client) {
                        // Check the existing servers. No need to add a second time!
                        if(services[url]) {
                                throw 'ServiceExistsEx';
                        }
                        // Check the URL beginning.
                        if(url.length < 8) {
                                throw 'URLEx';
                        }
                        if(url.substring(0,7) != "http://" && url.substring(0,8) != "https://") {
                                throw 'URLEx';
                        }
                        services[url] = new WOC.WPSService(url, client);
                        services[url].getCapabilities(client.getCapabilitiesMethod);
                }
                
                /**
                * Method: removeService
                *     Removes a WPS service instance from the container.
                *
                * Parameters:
                * url - {String} URL of the service instance.
                */
                this.removeService = function(url) {
                        // Check that the server exists!
                        if(services[url]) {
                                services[url] = null;
                        }
                }
        },
        CLASS_NAME:"WOC.WPSServiceContainer"
});