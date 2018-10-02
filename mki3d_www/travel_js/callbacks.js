// CALLBACKS

function setViewportProjections() {
    var wth = parseInt(window.innerWidth)-30;
    var hth = parseInt(window.innerHeight)-30;
    var canvas = document.getElementById("canvasId");

    canvas.setAttribute("width", ''+wth);
    canvas.setAttribute("height", ''+hth);
    gl.viewportWidth = wth;
    gl.viewportHeight = hth;
    projection.screenX=wth;
    projection.screenY=hth;

    pMatrix= projectionMatrix(projection);

    gl.viewport(0,0,wth,hth);
    // gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
}


function onWindowResize() {

    // stopIntervalAction();
    animation.stop();
    setViewportProjections()
    drawScene();

}

function onKeyUp(e){
    animation.stop();
    animation.keyAction=false;
}

function onKeyDown(e){

    // stopIntervalAction();
    // animation.stop();
    if( animation.keyAction ) return; // already set action
    animation.keyAction=true;
    
    // var code=e.keyCode? e.keyCode : e.charCode;
    var code= e.which || e.keyCode;
    switch(code)
    {
	case 38: // up
	animation.start( ru )
	break;
	case 73: // I
	case 87: // W
	animation.start( mu )
	break;
	case 40: // down
	animation.start( rd )
	break;
	case 75: // K
	case 83: // S
	animation.start( md )
	break;
	case 37: // left
	animation.start( rl )
	break;
	case 74:// J
	case 65:// A
	animation.start( ml )
	break;
	case 39:// right
	animation.start( rr )
	break;
	case 76: // L
	case 68: // D
	animation.start( mr )
	break;
	case 70: // F
	case 13: // Enter
	animation.start( animation.movForward )
	break;
	case 66: // B
	case 86: // V
	case 8: // Backspace
	animation.start( animation.movBack )
	break;
	case 32: // space
	animation.start( lv )
	/*
	if( traveler.rotYZ==0) {
	    traveler.rotXZ= nearestRightAngle(traveler.rotXZ);
	} else {
	    traveler.rotYZ=0;
	}
	drawScene();
	*/
	break;

	case 84: // T
	animation.MouseUpStopAction =  !animation.MouseUpStopAction;
	showAndHideMessage( "INERTIA: "+(!animation.MouseUpStopAction), 1000 );
	break;
	
	
	case 27: // escape
	hideMessage();
	break;
	
	case 72: // H
	showMessage(helpMessage);
	break;
    }
}



function sectorAction(xSector, ySector){
    animation.start(animation.sectors[ySector][xSector]);
}

function onMouseDown(evt){

    // console.log(evt); // test
    
    if( animation.requestId != 0 ) {
	animation.stop();
	return;
    }
    
    var wth = parseInt(window.innerWidth);
    var hth = parseInt(window.innerHeight);
    var xSector= Math.floor(6*evt.clientX/wth);
    var ySector= Math.floor(6*evt.clientY/hth);

    sectorAction(xSector, ySector);
}

function onMouseUp(evt){
    if( animation.MouseUpStopAction ) {
	animation.stop();
    }
}

function onTouchDown(evt){
    evt.preventDefault();
    // console.log(evt); // test
    
    if( animation.requestId != 0 ) {
	animation.stop();
	return;
    }
    
    var wth = parseInt(window.innerWidth);
    var hth = parseInt(window.innerHeight);
    var xSector= Math.floor(6*evt.touches[0].clientX/wth);
    var ySector= Math.floor(6*evt.touches[0].clientY/hth);

    sectorAction(xSector, ySector);
}

function onTouchUp(evt){
    evt.preventDefault();
    animation.stop();
}

/* set game callbacks */
function setCallbacks(){
    canvas = document.getElementById("canvasId");
    canvas.addEventListener("touchstart", onTouchDown, false);
    canvas.addEventListener("touchend", onTouchUp, false);
    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    window.onresize=onWindowResize;
    window.onkeydown=onKeyDown;
    window.onkeyup=onKeyUp; // cancelling action 
}

/* hold on callbacks */
function cancelCallbacks() {
    window.onresize=null;
    window.onkeydown=null;
    window.onkeyup=null;
    canvas.removeEventListener("touchstart", onTouchDown);
    canvas.removeEventListener("touchend", onTouchUp);
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mouseup", onMouseUp);
    
    animation.stop(); 
}
