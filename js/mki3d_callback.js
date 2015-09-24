/* event callbacks */

mki3d.callback = {};

mki3d.callback.helpOnKeyDown = function (e){
    mki3d.html.hideAllDivs();
    mki3d.html.showDiv(mki3d.html.divCanvas);
    window.onkeydown = mki3d.callback.canvasOnKeyDown;
}

mki3d.callback.canvasOnKeyDown = function (e){
    // var code=e.keyCode? e.keyCode : e.charCode;
    const rotStep = Math.PI / 36; // 5 degrees 
    var code= e.which || e.keyCode;
    switch(code)
    {
    case 13: // enter
        mki3d.action.enter();
	break;
    case 27: // escape
        mki3d.action.escape();
	break;
    case 32: // space
	mki3d.action.viewAlignRotation();
	break;
    case 38: // up
    case 73: // I
	mki3d.action.up();
	//mki3d.action.viewRotateUp( rotStep);
	break;
    case 40: // down
    case 75: // K
	mki3d.action.down();
	// mki3d.action.viewRotateUp(-rotStep);
	break;
    case 37: // left
    case 74:// J
	mki3d.action.left();
	// mki3d.action.viewRotateRight(-rotStep);
	break;
    case 39:// right
    case 76: // L
	mki3d.action.right();
	// mki3d.action.viewRotateRight( rotStep);
	break;
    case 70: // F
	mki3d.action.forward();
	break;
    case 66: // B
    case 86: // V
	mki3d.action.back();
	break;
    case 65: // A
	mki3d.action.nextMode();
	break;
    case 72: // H
	mki3d.action.help();
	break;

	/*
	  case 77: // M
	  case 82: // R
	  case 81: // Q
	  case 69: // E
	  case 191: // ?
	  case 68: // D
	  case 187: // +
	  case 189: // -
	  case 86: // V
	  case 46: // Delete
	  case 51: // #
	  case 83: // S
	  case 56: // *
	  case 88: // X
	  case 74: // J
	  break;
	*/
    }
};


mki3d.callback.onWindowResize = function () {
    var wth = parseInt(window.innerWidth)-10;
    var hth = parseInt(window.innerHeight)-10;
    var canvas = mki3d.html.canvas;
    var gl = mki3d.gl.context;
    canvas.setAttribute("width", ''+wth);
    canvas.setAttribute("height", ''+hth);
    gl.viewportWidth = wth;
    gl.viewportHeight = hth;
    gl.viewport(0,0,wth,hth);

    mki3d.setProjectionMatrix();
    mki3d.setModelViewMatrix();

    mki3d.redraw();
};

// niżej - do przerobienia


function onWindowResize() {

    stopIntervalAction();

    var wth = parseInt(window.innerWidth)-10;
    var hth = parseInt(window.innerHeight)-10;
    var canvas = document.getElementById("canvasId");

    canvas.setAttribute("width", ''+wth);
    canvas.setAttribute("height", ''+hth);
    gl.viewportWidth = wth;
    gl.viewportHeight = hth;
    projection.screenX=wth;
    projection.screenY=hth;

    pMatrix= projectionMatrix(projection);

    gl.viewport(0,0,wth,hth);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    drawScene();

}
