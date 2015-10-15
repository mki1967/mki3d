/* operations on the set indexes */

/* get the sorted set of set indextes of elements' endpoints */
mki3d.getSetIdxArray= function( elements ) {
    var array =[]
    var i,j;
    for(i=0; i<elements.length; i++) 
	for(j=0; j<elements[i].length; j++){
	    array.push(elements[i][j].set);
	}
    array.sort();
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
    for(i=0; i<idxSet[idxSet.length-1]; i++) map.push( null );
    for(i=0; i<idxSet[idxSet.length-1]; i++) map[idxSet[i]]=i;
    /* renumber the indexes of the endpoints */
    var j;
    for(i=0; i<elements.length; i++) 
	for(j=0; j<elements[i].length; j++){
	    elements[i][j].set= map[elements[i][j].set];
	}
    if( map[data.set.current] === null ){
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
