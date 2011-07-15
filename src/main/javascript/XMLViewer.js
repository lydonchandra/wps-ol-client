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
 * Class: WOC.popupXML
 *     Handling and viewing XML.
 *
 * Authors:
 *     Janne Kovanen, Finnish Geodetic Institute, janne.kovanen@fgi.fi
 *
 * Since Version / Date:
 *     0.1 / 22.09.2008
 */
 
/**
 * Function: WOC.popupXML
 *     Shows an XML document in an popup window for the user.
 *
 * Parameters:
 * popupTitle - {String} Title to show.
 * domRoots - {Array of DOMElements} The DOMElements, which are shown to the 
 *     user.
 */
WOC.popupXML = function(popupTitle, domRoots) {
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
        // Because the name has whitespace it has to be set here!
        newwin.name = popupTitle;
        d.open("text/html","replace");
        var wpsScriptElem = d.createElement('script');
        wpsScriptElem.setAttribute('type', 'text/javascript');
        wpsScriptElem.appendChild(d.createTextNode(
                        ' function updateVisibility(node) {' +
                        '        var sibling = node.nextSibling;' +
                        '        while(sibling) {' +
                        '                if(sibling.nodeName.toLowerCase() == "div") {' +
                        '                        if(sibling.style.display == "none") {' +
                        '                                sibling.style.display = "block";' +
                        '                                node.src = "img/xmlViewerArrowDown.png";' +
                        '                                node.alt = "Hide children";' +
                        '                        } else {' +
                        '                                sibling.style.display = "none";' +
                        '                                node.src = "img/xmlViewerArrowRight.png";' +
                        '                                node.alt = "Show children";' +
                        '                        }' +
                        '                        return;' +
                        '                } else if(sibling.nodeName.toLowerCase() == "img") {' +
                        '                        return;' +
                        '                } else {' +
                        '                        sibling = sibling.nextSibling;' +
                        '                }' +
                        '        }' +
                        '}'));
        var styleLink = d.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.type = 'text/css';
        styleLink.href = 'style/wpsStyle.css';
        styleLink.media = 'screen';
        var layoutLink =d.createElement('link');
        layoutLink.rel = 'stylesheet';
        layoutLink.type = 'text/css';
        layoutLink.href = 'layout/wpsLayout.css';
        layoutLink.media = 'screen';
        newwin.document.write("<html><head>" +
                WOC.xml2Str(wpsScriptElem) +
                WOC.xml2Str(styleLink) +
                WOC.xml2Str(layoutLink) +
                "<title>" + popupTitle + "</title>" +
                "</head><body><h1>" + popupTitle + "</h1>");
        for(var i=0; i<domRoots.length; i++) {
                if(i!=0) {
                        newwin.document.write("<hr width=\"100%\" size=\"2\"" +
                                        "color=\"green\" align=\"center\">");
                }
                var htmlDiv = d.createElement('div');
                htmlDiv.className = 'xmlMainViewer';
                WOC.addXMLToFormatedHTML(d, domRoots[i], htmlDiv);
                newwin.document.write(WOC.xml2Str(htmlDiv));
        }
        newwin.document.write("</body></html>");
        newwin.document.close();
        if (window.focus) {
                newwin.focus();
        }
}

/**
* Function: WOC.addXMLToFormatedHTML
*     Recursive method to add the source XML root node to the target 
*     node as HTML formated for viewing.
* 
* Parameters:
* d - {Document} Document that is used to create new DOMElements.
* sourceNode - {DOMElement} The source DOMElement of an XML document, whose 
*     content is added to to the target DOMElement of an HTML document
* targetNode - {DOMElement} The target DOMElement (part of an HTML document) to 
*     which one the source DOMElement's (XML) content is added.
*/
WOC.addXMLToFormatedHTML = function(d, sourceNode, targetNode) {
        // Image for dropdown
        if(sourceNode.hasChildNodes()) {
                var dropdownImage = d.createElement('img');
                dropdownImage.src = "img/xmlViewerArrowDown.png";
                dropdownImage.setAttribute('onclick', 'updateVisibility(this)');
                dropdownImage.setAttribute('alt', 'Hide children');
                targetNode.appendChild(dropdownImage);
        } 
        // Span creates an inline logical division.
        var beginTagBeginSpan = d.createElement('span');
        beginTagBeginSpan.className = 'xmlViewerTagSymbol';
        beginTagBeginSpan.appendChild(d.createTextNode('<'));
        targetNode.appendChild(beginTagBeginSpan);
        var beginTagNameSpan = d.createElement('span');
        beginTagNameSpan.className = 'xmlViewerNodeName';
        beginTagNameSpan.appendChild(
                        d.createTextNode(sourceNode.nodeName));
        targetNode.appendChild(beginTagNameSpan);
        // Attributes
        if(sourceNode.hasAttributes()) {
                for(var i=0; i<sourceNode.attributes.length; i++) {
                        var attributeNameSpan = d.createElement('span');
                        attributeNameSpan.className = 'xmlViewerAttrName';
                        attributeNameSpan.appendChild(d.createTextNode(' ' +
                                        sourceNode.attributes.item(i).nodeName));
                        targetNode.appendChild(attributeNameSpan);
                        var attributeEqualsSpan = d.createElement('span');
                        attributeEqualsSpan.appendChild(d.createTextNode('='));
                        targetNode.appendChild(attributeEqualsSpan);
                        var attributeValueSpan = d.createElement('span');
                        attributeValueSpan.className = 'xmlViewerAttrValue';
                        var attrValue = '"' + sourceNode.attributes.item(i).nodeValue + '"';
                        attributeValueSpan.appendChild(d.createTextNode(attrValue));
                        targetNode.appendChild(attributeValueSpan);
                }
        }
        // Ending the begin tag!
        var beginTagEndSpan = d.createElement('span');
        beginTagEndSpan.className = 'xmlViewerTagSymbol';
        if(sourceNode.hasChildNodes()) {
                beginTagEndSpan.appendChild(d.createTextNode('>'));
        } else {
                beginTagEndSpan.appendChild(d.createTextNode(' />'));
        }
        targetNode.appendChild(beginTagEndSpan);
        if(!sourceNode.hasChildNodes()) {
                targetNode.appendChild(d.createElement('br'));
        }
        // Children ... recursive call.
        if(sourceNode.hasChildNodes()) {
                var htmlDiv = d.createElement('div');
                htmlDiv.className = 'xmlViewer';
                for(var i=0; i<sourceNode.childNodes.length; i++) {
                        if(sourceNode.childNodes.item(i).nodeType == 
                                        d.ELEMENT_NODE) {
                                WOC.addXMLToFormatedHTML(d, sourceNode.childNodes.item(i),
                                                htmlDiv);
                        } else if(sourceNode.childNodes.item(i).nodeType == 
                                        d.TEXT_NODE) {
                                htmlDiv.appendChild(d.createTextNode(
                                                sourceNode.childNodes.item(i).nodeValue));
                        }
                        // COMMENT_NODE ?
                }
                targetNode.appendChild(htmlDiv);
                // End tag
                var endTagBeginSpan = d.createElement('span');
                endTagBeginSpan.className = 'xmlViewerTagSymbol';
                endTagBeginSpan.appendChild(d.createTextNode('</'));
                targetNode.appendChild(endTagBeginSpan);
                var endTagNameSpan = d.createElement('span');
                endTagNameSpan.className = 'xmlViewerNodeName';
                endTagNameSpan.appendChild(d.createTextNode(sourceNode.nodeName));
                targetNode.appendChild(endTagNameSpan);
                var endTagEndSpan = d.createElement('span');
                endTagEndSpan.className = 'xmlViewerTagSymbol';
                endTagEndSpan.appendChild(d.createTextNode('>'));
                targetNode.appendChild(endTagEndSpan);
                targetNode.appendChild(d.createElement('br'));
        }
}