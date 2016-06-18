/* operations on the set indexes */

/* get the sorted set of set indextes of elements' endpoints */
mki3d.getSetIdxArray= function( elements ) {
    var array =[]
    var i,j;
    for(i=0; i<elements.length; i++) 
	for(j=0; j<elements[i].length; j++){
	    array.push(elements[i][j].set);
	}
    array.sort(function(a, b){return a-b}); // numerical sort
    if( array.length == 0) return array;
    var out=[array[0]];
    for(i=1; i<array.length; i++)
	if(array[i] != array[i-1]) out.push(array[i]);
    return out;
}

/* get maximal set index in model.segments and model.triangles */
mki3d.getMaxSetIndex= function( model ){
    var max = -1; // if the model is empty then -1
    var elements = model.segments.concat(model.triangles);
    var i,j;
    for(i=0; i<elements.length; i++) 
	for(j=0; j<elements[i].length; j++){
	    if(max<elements[i][j].set) max=elements[i][j].set;
	}
    return max;
}


/* comperss set of indexes, so that 0 ... maximal index become indexes of non-empty sets   */
mki3d.compressSetIndexes= function( data ) {
    var elements = data.model.segments.concat(data.model.triangles);
    if(elements.length==0) return; // empty elements -- no indexes
    var idxSet = mki3d.getSetIdxArray(elements);
    if(idxSet[idxSet.length-1] == idxSet.length-1) return; // indexes already are compressed
    /* here: we have non-empty uncompressed set of indexes */
    var map=[];
    var i;
    for(i=0; i <= idxSet[idxSet.length-1]; i++) map.push( null ); /// old set values can be in [0, idxSet[idxSet.length-1]] !!!!
    for(i=0; i<idxSet.length; i++) map[idxSet[i]]=i;
    /* renumber the indexes of the endpoints */
    var j;
    for(i=0; i<elements.length; i++) 
	for(j=0; j<elements[i].length; j++){
	    elements[i][j].set= map[elements[i][j].set];
	}
    if( !map[data.set.current] ){
	data.set.current = idxSet.length; // the lowest new index of empty set
    } else {
	data.set.current = map[data.set.current]; // new index for current set
    }
}

mki3d.numberOfEndpointsInSet= function( setIdx, elements ){
    var i,j;
    var total=0;
    for(i=0; i<elements.length; i++) 
	for(j=0; j<elements[i].length; j++){
	    if(elements[i][j].set== setIdx) total++;
	}
    return total;
}



mki3d.currentSetStatistics= function(data) {
    var msg = "CURRENT SET IDX: "+data.set.current;
    msg+= "<br> ENDPOINTS IN SEGMENTS: "+mki3d.numberOfEndpointsInSet(data.set.current, data.model.segments);
    msg+= "<br> ENDPOINTS IN TRIANGLES: "+mki3d.numberOfEndpointsInSet(data.set.current, data.model.triangles);
    msg+= "<br> MAXIMAL NON-EMPTY SET INDEX IS: "+mki3d.getMaxSetIndex( data.model );
    return msg;
}
/* place all endpoints of element in set setIdx */
mki3d.elementPlaceInSet = function( element, setIdx ) {
    var i;
    for(i=0; i<element.length; i++) element[i].set = setIdx;    
}

/* Place the elements' array in the set setIdx */
mki3d.elementArrayPlaceInSet = function( elementArray, setIdx ){
    var i;
    for(i=0; i<elementArray.length; i++) 
	mki3d.elementPlaceInSet(elementArray[i], setIdx);
}



/* elements contained in set */

mki3d.isElementInSet = function(element, setIdx) {
    var i;
    for(i=0; i<element.length; i++)
	if(element[i].set != setIdx) return false;
    return true;
}

mki3d.elementsInSet = function( elements, setIdx) {
    var out=[];
    var i;
    for(i=0; i<elements.length; i++)
	if(mki3d.isElementInSet(elements[i], setIdx)) out.push(elements[i]);
    return out;
}

/* elements incident to set */

mki3d.isElementIncidentToSet = function(element, setIdx) {
    var i;
    for(i=0; i<element.length; i++)
	if(element[i].set == setIdx) return true;
    return false;
}

mki3d.elementsIncidentToSet = function( elements, setIdx) {
    var out=[];
    var i;
    for(i=0; i<elements.length; i++)
	if(mki3d.isElementIncidentToSet(elements[i], setIdx)) out.push(elements[i]);
    return out;
}


/* making models based on sets */

mki3d.createInSetModel = function(setIdx){
    var model={};
    model.segments= mki3d.elementsInSet( mki3d.data.model.segments, setIdx);
    model.triangles= mki3d.elementsInSet( mki3d.data.model.triangles, setIdx);
    model.setRestriction="inSet";
    return model;
};


mki3d.createIncidentToSetModel = function(setIdx){
    var model={};
    model.segments= mki3d.elementsIncidentToSet( mki3d.data.model.segments, setIdx);
    model.triangles= mki3d.elementsIncidentToSet( mki3d.data.model.triangles, setIdx);
    model.setRestriction="incidentToSet";
    return model;
};

/* glue operations */

/* Returns glue segments to set setIdx, for all endpoints.  */
mki3d.glueSegmentsOfEndpoints = function( endpoints, setIdx ){
    var out=[];
    var i;
    for(i=0; i<endpoints.length; i++){
	out.push( mki3d.newSegment(endpoints[i],endpoints[i]) );
	out[out.length-1][1].set=setIdx; // the second endpoint in set setIdx
	out[out.length-1].sort(mki3d.pointCompare); // repair sorting
    }
    return out;
}

/* Returns glue triangles to set setIdx, for all segments.  */
mki3d.glueTrianglesOfSegments = function( segments, setIdx ){
    var out=[];
    var i;
    for(i=0; i<segments.length; i++){
        var clone0= mki3d.pointClone(segments[i][0]);
	clone0.set= setIdx;
	out.push( mki3d.newTriangle(clone0 ,segments[i][0],segments[i][1]) ); // sorts endpoints
	/* old - buggy - code 
	   out.push( mki3d.newTriangle(segments[i][0],segments[i][0],segments[i][1]) ); // tutaj przestawia !!!
	   out[out.length-1][0].set=setIdx; // one doubled endpoint in set setIdx
	   out[out.length-1].sort(mki3d.pointCompare); // repair sorting
	*/
        clone0 = mki3d.pointClone(segments[i][0]); // another clone of segments[i][0]
        var clone1 = mki3d.pointClone(segments[i][1]); 
        clone0.set= setIdx;
	clone1.set= setIdx;
	out.push( mki3d.newTriangle(clone0,clone1,segments[i][1]) );// sorts endpoints
        /* old - buggy - code 
      	   out.push( mki3d.newTriangle(segments[i][0],segments[i][1],segments[i][1]) );// tutaj przestawia !!!
	   out[out.length-1][0].set=setIdx; 
	   out[out.length-1][1].set=setIdx; // two different endpoints in set setIdx
	   out[out.length-1].sort(mki3d.pointCompare); // repair sorting
	*/
    }
    return out;
}

