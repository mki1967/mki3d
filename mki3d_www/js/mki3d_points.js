/*** constructive points ***/

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


mki3d.pointsHide= function(){
    var pName;
    for(pName in mki3d.points.point) {
	mki3d.points.point[pName].visible=false;
    }
    mki3d.pointsToDisplay();
}

mki3d.pointsNotDisplayed= function( pointsString ){
    var result="";
    var i;
    for(i=0; i<pointsString.length; i++) {
	var pName= pointsString.substr(i,1);
	if( (!mki3d.points.point[pName]) ||
	    (!mki3d.points.point[pName].pos)  ||
	    (!mki3d.points.point[pName].visible) ){
	    result=result.concat(pName);
	}
    }
    return result;
}


/** calbacks for mki3d.tmp.afterPointsSelect **/

mki3d.setPointCallback = function( pointChar ) {
    var pObj=mki3d.points.point[pointChar];
    if(!pObj) return "<br>'"+pointChar+"' is not a point ID";
    pObj.pos=  mki3d.vectorClone( mki3d.data.cursor.position );
    pObj.visible= true;
    mki3d.pointsToDisplay();
    return "<br> POINT '"+pointChar+"' PLACED AT "+JSON.stringify(mki3d.data.cursor.position);
};


mki3d.jumpToPointCallback = function( pointChar ) {
    var pObj=mki3d.points.point[pointChar];
    if(!pObj) return "<br>'"+pointChar+"' is not a point ID";
    if(!pObj.pos) return "<br>'"+pointChar+"' HAS NOT BEEN SET! (USE 'QPS"+pointChar+"' TO SET IT.)";
    mki3d.data.cursor.position =  mki3d.vectorClone(pObj.pos);
    pObj.visible= true;
    delete mki3d.points.point[pointChar];
    mki3d.points.point[pointChar]=pObj; // move pObj to the last position
    mki3d.pointsToDisplay();
    return "<br> POINT '"+pointChar+"' FOUND WITH THE CURSOR AT "+JSON.stringify(mki3d.data.cursor.position);
};
