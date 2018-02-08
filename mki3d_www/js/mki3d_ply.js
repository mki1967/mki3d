mki3d.ply={}



mki3d_ply= function() {
    mki3d_ply_indexVertices();

    var outString=""+
	"ply\n" +
	"format ascii 1.0\n"+
	"comment exported from MKI3D ( https://mki1967.github.io/mki3d/ )\n"+
	"comment name: '"+mki3d.file.suggestedName+"'\n"

    // header
    outString += mki3d_ply_vertexHeader();
    // ...
    outString += "end_header\n";

    mki3d_ply_deleteIdx(); // clean ply idx
    return outString;
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


mki3d_ply_vertexHeader= function(){ // run after mki3d_ply_indexVertices()
    var model= mki3d.data.model;
    var outString =""+
	// "element vertex "+(2*model.segments.length+3*model.triangles.length)+"\n"+
	"element vertex "+mki3d.idx.current+"\n"+
	"property float x\n"+
	"property float y\n"+
	"property float z\n"+
	"property float red\n"+
	"property float green\n"+
	"property float blue\n"
    
    return outString;
}
