/** export mki3d.data to COLLADA **/

mki3d.collada={};
mki3d.collada.oDOM=null; // object DOM

mki3d_collada_export= function(){
    return '<?xml version="1.0" encoding="utf-8"?>\n'+
	mki3d_collada();
}

mki3d_collada= function() {
    var initString='<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1"></COLLADA>';
    var oParser = new DOMParser();
    mki3d.collada.oDOM = oParser.parseFromString(initString, "text/xml");

    mki3d_collada_assets();

    var oSerializer = new XMLSerializer();
    var outString = oSerializer.serializeToString( mki3d.collada.oDOM);
    return outString;
}

mki3d_collada_assets= function() {
    oDOM=mki3d.collada.oDOM; // reference to COLLADA DOM
    var asset = oDOM.createElement("asset");
    var collada = oDOM.getElementsByTagName("COLLADA")[0]; // root element
    collada.appendChild(asset);

    var contributor=oDOM.createElement("contributor");
    asset.appendChild(contributor);

    var author=oDOM.createElement("author");
    contributor.appendChild(author);
    author.appendChild( oDOM.createTextNode("MKI3D User") );

    var authoring_tool= oDOM.createElement("authoring_tool");
    contributor.appendChild(authoring_tool);
    authoring_tool.appendChild( oDOM.createTextNode("MKI3D RAPID MODELER") );
}


