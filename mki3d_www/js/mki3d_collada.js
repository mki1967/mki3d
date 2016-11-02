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
    mki3d_collada_library_geometries();

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

    var created= oDOM.createElement("created");
    asset.appendChild(created);
    created.appendChild( oDOM.createTextNode((new Date()).toISOString()));

    var keywords= oDOM.createElement("keywords");
    asset.appendChild(keywords);
    keywords.appendChild( oDOM.createTextNode("COLLADA interchange"));
    
    var modified= oDOM.createElement("modified");
    asset.appendChild(modified);
    modified.appendChild( oDOM.createTextNode((new Date()).toISOString()));
    
}


mki3d_collada_library_geometries= function() {
    oDOM=mki3d.collada.oDOM; // reference to COLLADA DOM
    var library_geometries = oDOM.createElement("library_geometries");
    var collada = oDOM.getElementsByTagName("COLLADA")[0]; // root element
    collada.appendChild(library_geometries);

    var geometry=oDOM.createElement("geometry");
    library_geometries.appendChild(geometry);

    var mesh=oDOM.createElement("mesh");
    geometry.appendChild(mesh);

    var source=oDOM.createElement("source");
    mesh.appendChild(source);
    source.setAttribute("id", "Lines-positions");

    var float_array=oDOM.createElement("float_array");
    source.appendChild(float_array);
    float_array.setAttribute("id", "Lines-positions-array");
    float_array.setAttribute("count",mki3d.data.model.segments.length*2*3);
    var linesEndpoints= mki3d.getElementsEndpoints(mki3d.data.model.segments);
    float_array.appendChild( oDOM.createTextNode(" "));
    for( var i=0; i<linesEndpoints.length; i++ )
	for( var j=0; j<3; j++)
	    float_array.childNodes[0].appendData(" "+linesEndpoints[i].position[j]);

    var technique_common=oDOM.createElement("technique_common");
    source.appendChild(technique_common);
    var accessor=oDOM.createElement("accessor");
    technique_common.appendChild(accessor);
    accessor.setAttribute("source", "Lines-positions-array");
    accessor.setAttribute("count", mki3d.data.model.segments.length*2);
    accessor.setAttribute("stride", 3);

    var param=oDOM.createElement("param");
    accessor.appendChild(param);
    param.setAttribute("name","X");
    param.setAttribute("type","float");
    
    param=oDOM.createElement("param");
    accessor.appendChild(param);
    param.setAttribute("name","Y");
    param.setAttribute("type","float");

    param=oDOM.createElement("param");
    accessor.appendChild(param);
    param.setAttribute("name","Z");
    param.setAttribute("type","float");
    

    var vertices=oDOM.createElement("vertices");
    mesh.appendChild(vertices);
    vertices.setAttribute("id", "Lines-vertices");

    var input=oDOM.createElement("input");
    vertices.appendChild(input);
    input.setAttribute("semantic", "POSITION");
    input.setAttribute("source", "#Lines-positions");
    
}



