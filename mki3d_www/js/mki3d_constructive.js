/* parameters of constructive methods */

mki3d.constructive={};
mki3d.constructive.scalingFactor=1.0; // used in scaling

/* constructive methods */

mki3d.checkConstructivePoints= function( methodName, neededPoints ){
    var missingPoints= mki3d.pointsNotDisplayed( neededPoints );
    if( missingPoints!="" ) {
	return "<br> "+methodName+" NEEDS THE POINTS: '"+neededPoints
	    +"' AND THE POINTS '"+missingPoints +"' ARE UNSET OR HIDDEN."
	    +"<br> (USE 'QPS...' TO SET THE POINTS OR 'QPJ...' TO DISPLAY HIDDEN POINTS)";
    }
    return ""; // empty string means OK

}

mki3d.constructiveMoveAB= function(){
    var methodName ="MOVE AB";
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
