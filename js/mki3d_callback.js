/* event callbacks */

mki3d.callback = {};

mki3d.callback.canvasOnKeyDown = function (e){
    // var code=e.keyCode? e.keyCode : e.charCode;
    const rotStep = Math.PI / 36; // 5 degrees 
    var code= e.which || e.keyCode;
    switch(code)
    {
    case 38: // up
    case 73: // I
	// up();
	mki3d.viewRotateUp(mki3d.data.view, rotStep);
	break;
    case 40: // down
    case 75: // K
	// down();
	mki3d.viewRotateUp(mki3d.data.view, -rotStep);
	break;
    case 37: // left
    case 74:// J
	// left();
	mki3d.viewRotateRight(mki3d.data.view, -rotStep);
	break;
    case 39:// right
    case 76: // L
	// right();
	mki3d.viewRotateRight(mki3d.data.view, rotStep);
	break;
    case 70: // F
	forward();
	break;
    case 66: // B
    case 86: // V
	back();
	break;
    case 32: // space
	break;
	/*
	  case 77: // M
	  case 82: // R
	  case 81: // Q
	  case 69: // E
	  case 191: // ?
	  case 68: // D
	  case 13: // enter
	  case 187: // +
	  case 27: // escape
	  case 189: // -
	  case 86: // V
	  case 46: // Delete
	  case 51: // #
	  case 83: // S
	  case 65: // A
	  case 56: // *
	  case 88: // X
	  case 74: // J
	  break;
	*/
    }
    mki3d.redraw();
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
