/* constructive points */

mki3d.points={};



/* initialisation of constructive points */
mki3d.pointsInit= function(){
    mki3d.points.point={};
    var i;
    for(i="A".charCodeAt(0); i<= "Z".charCodeAt(0); i++) {
	var pointChar=String.fromCharCode(i);
	mki3d.points.point[pointChar] = {
	    idx: mki3d.text.SYMBOLS.search(pointChar), 
	    pos: null, /* initially not set */
	    visible: false
	};
    }
}

mki3d.pointsInit(); // do the initialisation 


mki3d.pointsToDisplay= function(){
    if( !mki3d.tmp.display ) mki3d.tmp.display = {};
    mki3d.tmp.display.points=[];
    var pName;
    for(pName in mki3d.points.point) {
	var pObj= mki3d.points.point[pName];
	if( pObj.pos && pObj.visible ) mki3d.tmp.display.points.push(pObj);
    }
}

mki3d.setPointCallback = function( pointChar ) {
    var pObj=mki3d.points.point[pointChar];
    if(!pObj) return; // pointChar is not a point ID
    pObj.pos=  mki3d.vectorClone( mki3d.data.cursor.position );
    pObj.visible= true;
    mki3d.pointsToDisplay();
    return "POINT "+pointChar+" PLACED AT "+JSON.stringify(mki3d.data.cursor.position);
};
