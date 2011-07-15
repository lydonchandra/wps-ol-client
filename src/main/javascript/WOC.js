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
 * Class: WOC
 *     Main class of the WPS Client for OpenLayers.
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 */
var WOC = {};
/**
 * Constant: WOC.OWS_NAMESPACE
 * {String} Namespace for the OWS.
 */
WOC.OWS_NAMESPACE = "http://www.opengis.net/ows/1.1";
/**
 * Constant: WOC.OWS_PREFIX
 * {String} Namespace prefix for the OWS.
 * 
 * Note:
 *     This prefix is used if the browser can not use the namespace!
 */
WOC.OWS_PREFIX = "ows";
/**
 * Constant: WOC.WPS_NAMESPACE
 * {String} Namespace for the WPS.
 */
WOC.WPS_NAMESPACE = "http://www.opengis.net/wps/1.0.0";
/**
 * Constant: WOC.WPS_PREFIX
 * {String} Namespace prefix for the WPS.
 *
 * Note:
 *     This prefix is used if the browser can not use the namespace!
 */
WOC.WPS_PREFIX = "wps";
/**
 * Constant: WOC.OGC_NAMESPACE
 * {String} Namespace for the OGC.
 */
WOC.OGC_NAMESPACE = "http://www.opengis.net/ogc";

/**
 * Constant: WOC.SOAP_ENVELOPE_NAMESPACE
 * {String} Namespace for the SOAP Envelope.
 */
WOC.SOAP_ENVELOPE_NAMESPACE = "http://www.w3.org/2003/05/soap-envelope";

/**
 * Constant: WOC.SOAP_ENVELOPE_PREFIX
 * {String} Namespace prefix for the SOAP Envelope.
 *
 * Note:
 *     This prefix is used if the browser can not use the namespace!
 */
WOC.SOAP_ENVELOPE_PREFIX = "soap";

/** 
 * Function: WOC.getElementsByTagNameNS
 *     Returns the elements of the tag based on the name and namespace.
 *
 * Parameters:
 * parentnode - {DOMElement} Node from where the tags are searched.
 * nsUri - {String} URI of the namespace. This is used if the 
 *     getElementsByTagNameNS() method is available.
 * nsPrefix - {String} Prefix used for the namespace. This is used if the 
 *     getElementsByTagNameNS() method is unavailable.
 * tagName - {string} Name of those tags which are searched.
 * 
 * Returns:
 * {Array} DomElements found with the given parameters.
 */
WOC.getElementsByTagNameNS = function(parentNode, nsUri, 
                                      nsPrefix, tagName) {
        var elems = null;
        if(parentNode.getElementsByTagNameNS) {
                elems = parentNode.getElementsByTagNameNS(nsUri, tagName);
        } else {
                elems = parentNode.getElementsByTagName(nsPrefix + ':' + tagName);
        }
        // If the element is still null lets try without a namespace ;)
        if((!elems || elems.length < 1) && parentNode.getElementsByTagName) {
                elems = parentNode.getElementsByTagName(tagName);
        }
        return elems;
};

/*
WOC.hasAttributeNS = function(node, namespace, nsprefix, localName) {
        var has = false;
        if(node.hasAttributeNS) {
                has = node.hasAttributeNS(namespace, localName);
        } else {
                has = node.hasAttribute(nsprefix + ':' + localName);
        }
        // If the element has no attribute lets try without a namespace ;)
        if(!has) {
                has = node.hasAttribute(localName);
        }
        return has;
}

WOC.getAttributeNS = function(node, namespace, nsprefix, localName) {
        var attr = null;
        if(node.getAttributeNS) {
                attr = node.getAttributeNS(namespace, localName);
        } else {
                attr = node.getAttribute(nsprefix + ':' + localName);
        }
        // If the element has no attribute lets try without a namespace ;)
        if(!attr) {
                attr = node.getAttribute(localName);
        }
        return attr;
}
*/

/**
 * Function: WOC.checkboxChecker
 *     Checks a checkbox after an image corresponding to the checkbox has been 
 *     clicked.
 *
 * Parameters:
 * event - {Event} The event that is launched by the click.
 */
WOC.checkboxChecker = function(event) {
        if(event != null) {
                var img = event.target;
                var str = img.id + "";
                var checkbox = document.getElementById(str.substring(6));
                checkbox.checked = !checkbox.checked;
                // Change the class of this label
                if(checkbox.checked) {
                        img.src = "img/tick_box.png";
                        img.alt = "Checked";
                } else {
                        img.src = "img/cross_box.png";
                        img.alt = "Unchecked";
                }
        }
}

/**
 * Function: WOC.textFieldClearing
 *     Clears a textfield after it has been clicked on.
 *
 *
 * Parameters:
 * event - {Event} The event that is launched by the click.
 */
WOC.textFieldClearing = function(event) {
        if (event && event.target) {
                event.target.focus();
                event.target.value = "";
                //event.target.text = "";
                OpenLayers.Event.stop(event);
        }
}

/**
 * Function: WOC.ignoreEvent
 *     Ignores the occuring event and stops it.
 *
 * Parameters:
 * event - {Event} The event that has occured.
 */
WOC.ignoreEvent = function(event) {
        if (event) {
                OpenLayers.Event.stop(event);
        }
}

/**
* Function: WOC.getDomDocumentFromResponse
*     Gets a DOMDocument from the response
*
* Parameters:
* response - {XMLHttpRequest} 
*
* Returns:
* {DomDocument} If the response is not an ExceptionReport, else null.
*
* Throws: 
* {NoResponseEx} If the response object does not include
* neither a successful response or an exception report.
*/
WOC.getDomDocumentFromResponse = function(response) {
        var xmlDoc = null;
        // alert("Response: " + response.responseText);
        if(response.responseText.indexOf('no results') == -1 &&
                        response.readyState==4) {
                if(response.status >= 400) {
                        // Client exceptions are in the range 400 - 499 and
                        // server side exceptions in the range 500 - 599
                        // TODO Response status is an error! UNIMPLEMENTED!

                        alert("Request failed! \nPerhaps you tried to request a server which is not in the allowed hosts list of your proxy. \nResponse status: "+response.status); // Response's status is an error! UNIMPLEMENTED!
                        
                        return null;
                } else if(response.responseXML != null) {
                        xmlDoc = response.responseXML;
                } else if(response.responseText != null && response.responseText != "") {
                        xmlDoc = Sarissa.getDomDocument();
                        xmlDoc.async = false;
                        // Before parsing we need to remove the empty spaces between 
                        // elements.
                        xmlDoc = (new DOMParser()).parseFromString(
                                        response.responseText.replace(/>\s+</g, "><"), 
                                        "text/xml");
                } else {
                        throw 'NoResponseEx';
                }
        } else {
                throw 'NoResponseEx';
        }
        return xmlDoc;
}

/**
* Method:WOC.xml2Str
*     Interprets a DOMElement into single string.
* 
* Parameters: 
* xmlNode - {DOMElement}
* 
* Throws:
* {XmlSerializerNotSupported}
*/
WOC.xml2Str = function(xmlNode) {
        try {
                // Gecko-based browsers: Safari, Opera.
                return (new XMLSerializer()).serializeToString(xmlNode);
        }catch(e) {
                try {
                        // Internet Explorer.
                        return xmlNode.xml;
                }catch (e) {
                        throw 'XmlSerializerNotSupported';
                }
        }
}

WOC.openTestHtml = function(requestXML,serviceName){
    var width  = 820;
    var height = 600;
    var left = (screen.width  - width)/2;
    var top = (screen.height - height)/2;
    var params = 'width='+width+', height='+height;
    params += ', top='+top+', left='+left;
    params += ', directories=no';
    params += ', location=no';
    params += ', menubar=no';
    params += ', resizable=yes';
    params += ', scrollbars=yes';
    params += ', status=yes';
    params += ', toolbar=yes';
    var newwin = window.open('', "_blank", params);
	
    var d = newwin.document;
		d.open("text/html","replace");
	
		newwin.document.write("<html><head>" +
	            "<title>WPS Tester</title>" +
				"<script src='http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js'></script>" +
	            "<script type='text/javascript'>"+
					"$(function(){"+
						"$('#replacerLink').click(function(e){"+					// when the Encode button is clicked (for URLs)
							"var textarea = document.getElementById('request');"+
							"var len = textarea.value.length;"+
							"var start = textarea.selectionStart;"+
							"var end = textarea.selectionEnd;"+
							"var sel = textarea.value.substring(start, end);"+
							"var replace = sel.replace(/\&/g,'&amp;');"+
							"textarea.value = textarea.value.substring(0,start) + replace + textarea.value.substring(end,len); " +
						"});"+
					"});"+
				"</script>" +
				"</head><body><h1>WPS Tester</h1>"+
				//"<a href='http://www.52north.org/index.php?index' target='_blank'>"+
	            //    "<img src='http://52north.org/maven/project-sites/wps/52n-wps-site/images/logo_new.gif' height='110' width='252'/>"+
	            //"</a>"+
				"<form name='form1' method='post' action=''>"+
					  "<div>"+
						"<input name='url' value='"+serviceName+"' size='90' type='text'>"+		
					  "</div>"+
	            "</form>"+
				"<font color='#ffffff' face='Verdana, Arial, Helvetica, sans-serif'><b>Request:</b></font><br />"+
				"<form name='form2' method='post' action='' enctype='text/plain'>"+
					"<div>"+
							"<textarea id='request' name='request' cols='80' rows='20'>"+ requestXML +"</textarea>"+
					"</div>"+
					"<p>"+
							"<input value='   Clear    ' name='reset' type='reset'>"+
					"</p>"+
					"<p>"+
							"<input value='   Send    ' onclick='form2.action = form1.url.value' type='submit'>"+
					"</p>"+
				"</form>"+
				"<p><span id='replacerLink' style='cursor:pointer; text-decoration:underline;'>Encode</span> (mark the URL before)</p>"+
				"</body></html>"	);
	
    newwin.document.close();
    if (window.focus) {
            newwin.focus();
    }

}

/*
* Method:WOC.xml2Str
*     Interprets a DOMElement into single string.
* 
* Parameters: 
* domObject - {DOMElement} 
* initialString - {String} 
*/
/*
WOC.xml2Str = function(domObject, initialString) {
        var str = (initialString==undefined)?'' : initialString;
        if(domObject.nodeValue==undefined) {
                var multiStr = [];
                var temp = '';
                for(var i=0; i<domObject.childNodes.length; i++) {
                        // Each repeated node
                        if(domObject.childNodes[i].nodeName.toString().indexOf('#') < 0) {
                                var nodeNameStart = '<' + domObject.childNodes[i].nodeName;
                                var nodeNameEnd = '</' + domObject.childNodes[i].nodeName + '>';
                                var attsStr='';
                                var atts = domObject.childNodes[i].attributes;
                                if(atts != undefined){
                                        for(var j=0; j<atts.length; j++) {
                                                attsStr += ' ' + atts[j].nodeName + '="' + 
                                                                atts[j].firstChild.nodeValue+'"';
                                        }
                                }
                                temp = nodeNameStart + attsStr + '>' + 
                                                WOC.domToString(domObject.childNodes[i], str) + nodeNameEnd;
                                multiStr.push(temp);
                                str = temp;
                        } else {
                                // Node value
                                str = WOC.domToString(domObject.childNodes[i], str);
                                multiStr.push(str);
                        }
                }
                str = multiStr.join('');
        } else {
                return domObject.nodeValue;
        }
        return str;
}
*/