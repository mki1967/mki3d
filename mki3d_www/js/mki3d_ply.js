mki3d.ply={}



mki3d_ply= function() {
    
    mki3d_ply_indexVertices(); // append idx attribute to each endpoint

    var outString=""+
	"ply\n" +
	"format ascii 1.0\n"+
	"comment exported from MKI3D ( https://mki1967.github.io/mki3d/ )\n"+
	"comment name: '"+mki3d.file.suggestedName+"'\n"

    // header
    outString += mki3d_ply_vertexHeader();
    outString += mki3d_ply_edgeHeader();
    outString += mki3d_ply_faceHeader();
    // ...
    outString += "end_header\n";
    // contents
    outString += mki3d_ply_vertices();
    outString +=mki3d_ply_edgesAndFaces();
    // cleanup
    mki3d_ply_deleteIdx(); // clean ply idx
    return outString+"\n";
}


/* Indexing of vertices required by PLY */
mki3d.idx={}
mki3d.idx.current=0;
mki3d.idx.edgeBase=0;
mki3d.idx.faceBase=0;


mki3d_ply_indexElementsVertices= function( elements ) { // increases mki3d.idx.current
    var i,j;
    for( i=0; i< elements.length; i++) {
	for( j=0; j<elements[i].length; j++) {
	    elements[i][j].idx= mki3d.idx.current;
	    mki3d.idx.current++;
	}
    }
}

mki3d_ply_indexVertices= function() {
    var model= mki3d.data.model;
    mki3d.idx.current=0;
    mki3d.idx.edgeBase= mki3d.idx.current;
    mki3d_ply_indexElementsVertices( model.segments );
    mki3d.idx.faceBase= mki3d.idx.current;
    mki3d_ply_indexElementsVertices( model.triangles );
}


mki3d_ply_deleteElementsIdx= function( elements ) { // removes ply indexes in elements table
    var i,j;
    for( i=0; i< elements.length; i++) {
	for( j=0; j<elements[i].length; j++) {
	    delete elements[i][j].idx;
	}
    }
}

mki3d_ply_deleteIdx= function() {  // removes ply indexes
    var model= mki3d.data.model;
    mki3d_ply_deleteElementsIdx(model.segments);
    mki3d_ply_deleteElementsIdx(model.triangles);
}


/* content lines */


// vertices
mki3d_ply_elementsVertices= function( elements ) { // output elements' endpoints as vertices lines
    outString="";
    var i,j;
    for( i=0; i< elements.length; i++) {
	for( j=0; j<elements[i].length; j++) {
	    outString+= elements[i][j].position[0]+" ";
	    outString+= elements[i][j].position[2]+" ";
	    outString+= elements[i][j].position[1]+" "; // Y is vertical in MKI3D
	    /*
	    outString+= elements[i][j].color[0]+" ";
	    outString+= elements[i][j].color[1]+" ";
	    outString+= elements[i][j].color[2]+" ";
	    */
	    outString+= Math.floor(255*elements[i][j].color[0])+" ";
	    outString+= Math.floor(255*elements[i][j].color[1])+" ";
	    outString+= Math.floor(255*elements[i][j].color[2])+" ";
	    
	    outString+="\n"
	}
    }

    return outString;
}

mki3d_ply_vertices= function( elements ) { // output elements' endpoints as vertices lines
    var model= mki3d.data.model;
    return ""+
	mki3d_ply_elementsVertices(model.segments)+
	mki3d_ply_elementsVertices(model.triangles);
}

// indexed elements
mki3d_ply_elements= function( elements, isList ) { // increases mki3d.idx.current
    outString="";
    var i,j;
    for( i=0; i< elements.length; i++) {
	if( isList ) outString+= elements[i].length+" "; // faces can be lists -- not tuples
	for( j=0; j<elements[i].length; j++) {
	    outString+= elements[i][j].idx+" ";
	}
	 outString+= "\n"
    }
    return outString;

}

mki3d_ply_edgesAndFaces= function( elements ) { // output edges and faces
    var model= mki3d.data.model;
    return ""+
	mki3d_ply_elements(model.segments, false)+
	mki3d_ply_elements(model.triangles, true );
}



// header lines

mki3d_ply_vertexHeader= function(){ // run after mki3d_ply_indexVertices()
    var model= mki3d.data.model;
    var outString =""+
	// "element vertex "+(2*model.segments.length+3*model.triangles.length)+"\n"+
	"element vertex "+mki3d.idx.current+"\n"+
	"property float x\n"+
	"property float y\n"+
	"property float z\n"+
	"property uchar red\n"+
	"property uchar green\n"+
	"property uchar blue\n"
    /*
	"property float red\n"+
	"property float green\n"+
	"property float blue\n"
    */
    return outString;
}

mki3d_ply_edgeHeader= function(){
    var model= mki3d.data.model;
    var outString =""+
	"element edge "+model.segments.length+"\n"+
	"property int vertex1\n"+
	"property int vertex2\n"
    return outString;
	
}

mki3d_ply_faceHeader= function(){
    var model= mki3d.data.model;
    var outString =""+
	"element face "+model.triangles.length+"\n"+
	"property list uchar int vertex_index\n"
    /*
	"element triangle "+model.triangles.length+"\n"+
	"property int vertex1\n"+
	"property int vertex2\n"+
	"property int vertex3\n"
    */
    return outString;
	
}

