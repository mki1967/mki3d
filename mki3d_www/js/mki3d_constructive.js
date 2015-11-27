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
    var p1= mki3d.points.point.A.pos;
    var p2= mki3d.points.point.B.pos;
    var i;
    for( i=0; i< selected.length; i++) {
	var pos= selected[i].position; // reference to position
	pos[0]+=p2[0]-p1[0];
	pos[1]+=p2[1]-p1[1];
	pos[2]+=p2[2]-p1[2];
    }
    mki3d.backup();
    mki3d.redraw();
    return "MOVED SELECTED ENDPOINTS BY THE VECTOR AB. (USE 'U' FOR SINGLE STEP UNDO.)";
}
