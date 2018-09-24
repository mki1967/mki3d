// var rotXYcounter = 0;

function rotateXZ(traveler, angle)
{
    traveler.rotXZ=(traveler.rotXZ+angle+360)%360;
}

function rotateYZ(traveler, angle)
{
    traveler.rotYZ += angle;
    
    if(angle>0 && traveler.rotYZ > maxYZAngle) {
	animation.stop();
	traveler.rotYZ = maxYZAngle;
    }

    if(angle<0 && traveler.rotYZ < -maxYZAngle) {
	animation.stop();
	traveler.rotYZ = -maxYZAngle;
    }

}

function move(traveler, vector)
{
    var v=worldRotatedVector( traveler, vector );

    traveler.x= Math.max(  traveler.vMin[0]-XMargin, Math.min( traveler.vMax[0]+XMargin, traveler.x+v[0] ));
    traveler.y= Math.max(  traveler.vMin[1]-YMargin, Math.min( traveler.vMax[1]+YMargin, traveler.y+v[1] ));
    traveler.z= Math.max(  traveler.vMin[2]-ZMargin, Math.min( traveler.vMax[2]+ZMargin, traveler.z+v[2] ));
    checkLinks();

}

function checkLinks() {
    if(! mki3d.data.links ) return;
    let vTraveler=[traveler.x,traveler.y,traveler.z];
    for(let i=0; i<mki3d.data.links.length; i++) {
	let link= mki3d.data.links[i]
	let position= link.position;
	if( maxDistance(vTraveler,position)<linkInDistance && !link.ignored ) {
	    animation.stop();
	    let url=mki3d.url.completeLink( link.opener, link.url);
	    /*
	    if(confirm( url )){
		window.open( url, "_self");
	    } else {
		link.ignored=true;
	    }
	    */
	    globalGotoURL=url;
	    showMessage(
		"<div style='font-size:30px;'>"+link.label+"</div><div style='font-size:20px;'><code>"+url+"</code></div>"+gotoMessageButton
	    );
	    link.ignored=true;

	} else if(maxDistance(vTraveler,position)>linkOutDistance) {
	    link.ignored=false;
	}
    } 

}
