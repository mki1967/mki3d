/* parameters of constructive methods */

mki3d.constructive={};
/* scaling factor used used for scaling in all directions */
/* must be in [MKI3D_MIN_SCALE, MKI3D_MAX_SCALE] or [-MKI3D_MAX_SCALE, -MKI3D_MIN_SCALE] */ 
mki3d.constructive.scalingFactor=1.0; 

/* parameters of regular polygon */

mki3d.constructive.polygonNumberOfVertices=3;

/* constructive methods */


mki3d.polygonMakeVertex= function( vIdx ){
    var n=mki3d.constructive.polygonNumberOfVertices;
    var r=2*mki3d.data.cursor.step;
    var dx= r*Math.cos(vIdx*2*Math.PI/n);
    var dy= r*Math.sin(vIdx*2*Math.PI/n);
    
    mki3d.tmpRefreshVersorsMatrix();
    var v = mki3d.matrixVectorProduct( mki3d.tmp.versorsMatrix , [dx,dy,0] );

    var c = mki3d.data.cursor.position;

    return [ v[0]+c[0], v[1]+c[1], v[2]+c[2] ];
}

mki3d.constructivePolygonInsert= function(){
    mki3d.compressSetIndexes(mki3d.data);
    var newIdx = mki3d.getMaxSetIndex( mki3d.data.model )+1; // empty set
    mki3d.data.set.current=newIdx; // insert polygon to a new set

    var c = mki3d.data.cursor.color;
    var n=mki3d.constructive.polygonNumberOfVertices;
    var i;
    for(i=0; i<n; i++) {
	var p=mki3d.polygonMakeVertex( i );
	var pt1 = mki3d.newPoint( p[0], p[1], p[2],  
				  c[0], c[1], c[2] ,  
				  mki3d.data.set.current );
	p=mki3d.polygonMakeVertex( (i+1) % n );
	var pt2 = mki3d.newPoint( p[0], p[1], p[2],  
				  c[0], c[1], c[2] ,  
				  mki3d.data.set.current );
	var seg = mki3d.newSegment( pt1, pt2 );
	mki3d.modelInsertElement( mki3d.data.model.segments, seg);
    }
    mki3d.backup();
    return "<br>INSERTED REGULAR POLYGON SEGMENTS TO A NEW - CURRENT - SET."+
	" (CAN BE SELECTED WITH 'QSS')"+
	"<br> (USE 'U' FOR SINGLE STEP UNDO.)";
}

mki3d.constructivePolygonTriangles= function(){
    mki3d.compressSetIndexes(mki3d.data);
    var newIdx = mki3d.getMaxSetIndex( mki3d.data.model )+1; // empty set
    mki3d.data.set.current=newIdx; // insert polygon to a new set

    var c = mki3d.data.cursor.color;
    var n=mki3d.constructive.polygonNumberOfVertices;
    var i;
    for(i=0; i<n; i++) {
	var p=mki3d.polygonMakeVertex( i );
	var pt1 = mki3d.newPoint( p[0], p[1], p[2],  
				  c[0], c[1], c[2] ,  
				  mki3d.data.set.current );
	p=mki3d.polygonMakeVertex( (i+1) % n );
	var pt2 = mki3d.newPoint( p[0], p[1], p[2],  
				  c[0], c[1], c[2] ,  
				  mki3d.data.set.current );
	var cp = mki3d.vectorClone(mki3d.data.cursor.position);
	var pt3 = mki3d.newPoint( cp[0], cp[1], cp[2],  
				  c[0], c[1], c[2] ,  
				  mki3d.data.set.current );

	var tr = mki3d.newTriangle( pt1, pt2, pt3 );
	mki3d.modelInsertElement( mki3d.data.model.triangles, tr);
    }
    mki3d.backup();
    return "<br>INSERTED REGULAR POLYGON TRIANGLES TO A NEW - CURRENT - SET."+
	" (CAN BE SELECTED WITH 'QSS')"+
	"<br> (USE 'U' FOR SINGLE STEP UNDO.)";
}




mki3d.checkConstructivePoints= function( methodName, neededPoints ){
    var missingPoints= mki3d.pointsNotDisplayed( neededPoints );
    if( missingPoints!="" ) {
	return "<br> "+methodName+" NEEDS THE POINTS: '"+neededPoints
	    +"' AND THE POINTS '"+missingPoints +"' ARE UNSET OR HIDDEN."
	    +"<br> (USE 'QPS...' TO SET THE POINTS OR 'QPJ...' TO DISPLAY HIDDEN POINTS)";
    }
    return ""; // empty string means OK

}

/** MOVING SELECTED ENDPOINTS **/

mki3d.constructiveMoveAB= function(){
    var methodName ="MOVE BY AB";
    var neededPoints = "AB";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    if( !mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return "<br>NO SELECTED ENDPOINTS !!!";
    mki3d.backup();
    var selected=mki3d.tmp.selected;
    var pA= mki3d.points.point.A.pos;
    var pB= mki3d.points.point.B.pos;
    var i;
    for( i=0; i< selected.length; i++) {
	var pos= selected[i].position; // reference to position
	pos[0]+=pB[0]-pA[0];
	pos[1]+=pB[1]-pA[1];
	pos[2]+=pB[2]-pA[2];
    }
    mki3d.backup();
    mki3d.redraw();
    return "<br>MOVED SELECTED ENDPOINTS BY THE VECTOR AB.<br> (USE 'U' FOR SINGLE STEP UNDO.)";
}

mki3d.constructiveMoveInDirABLenCD= function(){
    var methodName ="MOVE IN DIRECTION AB BY LENGTH |CD|";
    var neededPoints = "ABCD";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    if( !mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return "<br>NO SELECTED ENDPOINTS !!!";
    var A= mki3d.points.point.A.pos;
    var B= mki3d.points.point.B.pos;
    var AB=[B[0]-A[0], B[1]-A[1], B[2]-A[2]];
    var lenAB=mki3d.vectorLength(AB);
    if( lenAB==0 ) return "LENGTH |AB| IS ZERO - NO DIRECTION !";
    var C= mki3d.points.point.C.pos;
    var D= mki3d.points.point.D.pos;
    var CD=[D[0]-C[0], D[1]-C[1], D[2]-C[2]];
    var lenCD=mki3d.vectorLength(CD);
    if( lenCD==0 ) return "LENGTH |CD| IS ZERO - NO MOVEMENT !";

    var s= lenCD/lenAB;
    var dv= AB;
    mki3d.vectorScale(dv, s,s,s);

    mki3d.backup();
    
    var selected=mki3d.tmp.selected;
    var i;
    for( i=0; i< selected.length; i++) {
	mki3d.vectorMove(selected[i].position, dv[0], dv[1], dv[2]);
    }
    mki3d.backup();
    mki3d.redraw();
    return "<br>MOVED SELECTED ENDPOINTS IN DIRECTION AB BY THE LENGTH |CD|.<br> (USE 'U' FOR SINGLE STEP UNDO.)";
}



/** SCALING SELECTED ENDPOINTS **/


/* scale each coordinate of v by, respectively, sx,sy,sz, where FP is a fixed point */
mki3d.scaleWithFixedPoint= function(v, sx,sy,sz , FP){
    v[0]= FP[0]+sx*(v[0]-FP[0]);
    v[1]= FP[1]+sy*(v[1]-FP[1]);
    v[2]= FP[2]+sz*(v[2]-FP[2]);
}

mki3d.constructiveScaleWithFixedPointO= function(){
    var methodName ="SCALE";
    var neededPoints = "O";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    if( !mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return "<br>NO SELECTED ENDPOINTS !!!";
    mki3d.backup();
    var selected=mki3d.tmp.selected;
    var pO= mki3d.points.point.O.pos;
    var i;
    for( i=0; i< selected.length; i++) {
	var pos= selected[i].position; // reference to position
	var s= mki3d.constructive.scalingFactor
	mki3d.scaleWithFixedPoint(selected[i].position, s,s,s , pO);
    }
    mki3d.backup();
    mki3d.redraw();
    return "<br>SELECTED POINTS SCALED BY SCALING FACTOR WITH FIXED POINT 'O'.<br> (USE 'U' FOR SINGLE STEP UNDO.)";
}

mki3d.constructiveScaleByABOverCD= function(){
    var methodName ="SCALE BY |AB|/|CD|";
    var neededPoints = "OABCD";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    if( !mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return "<br>NO SELECTED ENDPOINTS !!!";
    mki3d.backup();
    var selected=mki3d.tmp.selected;
    var pO= mki3d.points.point.O.pos;
    var A= mki3d.points.point.A.pos;
    var B= mki3d.points.point.B.pos;
    var C= mki3d.points.point.C.pos;
    var D= mki3d.points.point.D.pos;
    var AB=[B[0]-A[0], B[1]-A[1], B[2]-A[2]];
    var lenAB=mki3d.vectorLength(AB);
    var CD=[D[0]-C[0], D[1]-C[1], D[2]-C[2]];
    var lenCD=mki3d.vectorLength(CD);
    if( lenCD==0 ) return "LENGTH |'CD'| IS ZERO - CAN NOT SCALE BY |'AB'|/|'CD'| !";
    var s=lenAB/lenCD;
    if( s > MKI3D_MAX_SCALE )
	return "|'AB'|/|'CD'| IS "+Math.abs(s)+" > "+MKI3D_MAX_SCALE+" - TOO LARGE !";

    var i;
    for( i=0; i< selected.length; i++) {
	var pos= selected[i].position; // reference to position
	mki3d.scaleWithFixedPoint(selected[i].position, s,s,s , pO);
    }
    mki3d.backup();
    mki3d.redraw();
    var warning="";
    if(s==0) warning="<br> WARNING: |AB|/|CD| WAS ZERO !"
    return "<br>SELECTED POINTS SCALED BY |'AB'|/|'CD'| WITH FIXED POINT 'O'."+warning+"<br> (USE 'U' FOR SINGLE STEP UNDO.)";
}



/** CURSOR JUMPING **/

mki3d.moveCursorToIntersectionABandCDE = function(){
    var methodName ="MOVE CURSOR TO INTERSECTION OF AB AND CDE";
    var neededPoints = "ABCDE";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    var A= mki3d.points.point.A.pos;
    var B= mki3d.points.point.B.pos;
    var C= mki3d.points.point.C.pos;
    var D= mki3d.points.point.D.pos;
    var E= mki3d.points.point.E.pos;

    var result = mki3d.lineABplaneCDEintersection( A,B, C,D,E );
    if(!result) return "<br> INTERSECTION POINT OF AB AND CDE COULD NOT BE FOUND.";
    mki3d.data.cursor.position = result;
    mki3d.redraw();
    return "<br> CURSOR MOVED TO THE INTERSECTION OF LINE AB AND PLANE CDE.";
}




mki3d.lineABplaneCDEintersection= function( A,B, C,D,E ){
    var CD = [ D[0]-C[0], D[1]-C[1], D[2]-C[2] ];
    var CE = [ E[0]-C[0], E[1]-C[1], E[2]-C[2] ];
    var AB = [ B[0]-A[0], B[1]-A[1], B[2]-A[2] ];

    var d = mki3d.matrixDeterminant( [ CD,
				       CE,
				       AB ] );

    if( d==0 ) return null; // no solution found

    var AC = [ C[0]-A[0], C[1]-A[1], C[2]-A[2] ];

    var d1= mki3d.matrixDeterminant( [ CD,
				       CE,
				       AC ] );

    var X= mki3d.vectorClone(AB);
    t=d1/d;
    mki3d.vectorScale(X, t,t,t );
    
    return [ A[0]+X[0], A[1]+X[1], A[2]+X[2] ];

}
