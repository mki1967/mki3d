/*
  
  MKI TRAVEL
  Copyright (C) 2018  Marcin Kik mki1967@gmail.com


  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/





function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        console.log("Could not initialise WebGL, sorry :-(");
    }
}




// SHADER PROGRAM

function tryToCompileShader(shader)
{
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
    }
}

function compileAndLinkShader( FRAGMENT_SHADER_STRING, VERTEX_SHADER_STRING) {
    var fragmentShader =gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, FRAGMENT_SHADER_STRING);
    tryToCompileShader(fragmentShader);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, VERTEX_SHADER_STRING);
    tryToCompileShader(vertexShader);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log("Could not initialise shaders");
    }
    return shaderProgram;
}

function initShaders() { // compile and link shader programs and  init their atributes and variables 

    shaderProgram =  compileAndLinkShader( FRAGMENT_SHADER_STRING, VERTEX_SHADER_STRING);
    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);


    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.vMov = gl.getUniformLocation(shaderProgram, "mov");
    shaderProgram.mRot = gl.getUniformLocation(shaderProgram, "rot");
}



function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


function declareBuffers(graph) {
    graph.linesVerticesBuffer = gl.createBuffer();
    graph.linesColorsBuffer = gl.createBuffer();
    graph.trianglesVerticesBuffer = gl.createBuffer();
    graph.trianglesColorsBuffer = gl.createBuffer();
}

function loadBuffers(graph, buf) {


    gl.bindBuffer(gl.ARRAY_BUFFER, buf.linesVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, graph.linesVertices, gl.STATIC_DRAW);
    graph.linesVerticesBuffer=buf.linesVerticesBuffer;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.linesColorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, graph.linesColors, gl.STATIC_DRAW);
    graph.linesColorsBuffer=buf.linesColorsBuffer;

    gl.bindBuffer(gl.ARRAY_BUFFER, buf.trianglesVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, graph.trianglesVertices, gl.STATIC_DRAW);
    graph.trianglesVerticesBuffer=buf.trianglesVerticesBuffer;

    gl.bindBuffer(gl.ARRAY_BUFFER, buf.trianglesColorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, graph.trianglesColors, gl.STATIC_DRAW);
    graph.trianglesColorsBuffer=buf.trianglesColorsBuffer;

}

function initBuffers(graph) {
    declareBuffers(graph);
    loadBuffers(graph, graph);
}


function drawSectors() {
    gl.useProgram(shaderProgram);

    // draw sectors
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, 
			glMatrix4(
			    1,   0,   0,   0,
			    0,   1,   0,   0,
			    0,   0,   1,  -1,
			    0,   0,   0,   1
			) 
		       );
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, IdMatrix );
    // gl.disable(gl.DEPTH_TEST);
    drawGraph(sectors);
    // restore matrices 
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    // gl.enable(gl.DEPTH_TEST);

}


function drawScene() {
    gl.useProgram(shaderProgram);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.depthFunc(gl.LEQUAL);
    
    gl.clearColor(bgColor[0], bgColor[1], bgColor[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    travMatrices=computeMatrices(traveler);
    // mvMatrix= modelViewMatrix(traveler);
    mvMatrix=travMatrices.modelView;
    gl.uniformMatrix3fv(shaderProgram.mRot, false,
			glMatrix3(
			    
				1, 0, 0,
				0, 1, 0,
				0, 0, 1
			    
			)
		       );
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);


    gl.uniform3f(shaderProgram.vMov,  0,0,0  );
    drawGraph(scene);
    
    drawGraph(frameBox);
    drawLinks();


    gl.useProgram(shaderProgram);
    if(animation.requestId == 0 ) drawSectors();

    gl.finish();


}



function drawLinks()
{
    if(! mki3d.data.links ) return;
    gl.uniformMatrix3fv(shaderProgram.mRot, false, travMatrices.revRot);
    for(let i=0; i<mki3d.data.links.length; i++)
	if(!mki3d.data.links[i].ignored){
	    let position= mki3d.data.links[i].position;
            gl.uniform3f(shaderProgram.vMov, position[0], position[1], position[2] );
            drawGraph(token); // test
	} 
 

    gl.uniform3f(shaderProgram.vMov,  0,0,0  ); // reset mov uniform
    
    gl.uniformMatrix3fv(shaderProgram.mRot, false,
			glMatrix3(
			    
				1, 0, 0,
				0, 1, 0,
				0, 0, 1
			    
			)
		       );
    
}


function drawGraph(graph, modelViewGL, monoProjectionGL) {

    /* draw triangles */
    if(graph.nrOfTriangles>0) {
	gl.bindBuffer(gl.ARRAY_BUFFER, graph.trianglesVerticesBuffer );
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexPositionSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, graph.trianglesColorsBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, vertexColorSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 3*graph.nrOfTriangles);
    }
    /* draw lines */
    if(graph.nrOfLines>0) {
	gl.bindBuffer(gl.ARRAY_BUFFER, graph.linesVerticesBuffer );
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexPositionSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, graph.linesColorsBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, vertexColorSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.LINES, 0, 2*graph.nrOfLines);
    }

    /* draw textured triangles */

    if(graph.texture){
	mki3d_texture.redraw(gl, mvMatrix, pMatrix, graph /* data */, shadeFactor,  function(gl, vs,fs){ return compileAndLinkShader(fs, vs); } /* unfortunate ! */);
    }

}




function startTravel()
{
    
    drawScene();

    
    showMessage(
		"<div style='font-size:30px;'> Touch/click the screen sectors to navigate !<br>(Or press keys - 'H' for help.)</div>"
	       );
    
    
    setCallbacks();
}

webGLStart=async function() {
    canvas = document.getElementById("canvasId");
    canvasTex = document.getElementById("canvasTexId");
    canvasTexDiv = document.getElementById("canvasTexDiv");

    initGL(canvas);
    initShaders();
    {
	/* test input parameter and try to load */
	mki3d.url.base=document.referrer; // Use referrer as the default base
	let params = (new URL(document.location)).searchParams;
	let base = params.get("base")
	if( base ){ // parameter 'base' overrides old value of 'mki3d.url.base'
	    // tested by opening: http://localhost:8000/mki3d_www/mki3d.html?input=ex3-expanded.mki3d&base=http://mki1967.github.io/mki3d/docs/examples/mki3d-data/
	    mki3d.url.base= base;
	}
	let input=params.get("input")
	// console.log(input) /// tests
	if(input) {
	    // mki3d.url.load("https://raw.githubusercontent.com/mki1967/mki3dgame/master/assets/stages/stage1.mki3d"); /// tests
	    await mki3d.url.load(input);
	}

	if(!mki3d.url.inputLoaded) mki3d.url.base=window.location.href; // base url if nothing was loaded 
	///////
    }

    sectors=makeGraph ( mki3d.sectors );
    initBuffers(sectors);
    /// initBuffers(moveMsg);
    /// initBuffers(rotateMsg);
    buffersScene={};
    buffersToken={};
    buffersFrameBox={};
    
    declareBuffers(buffersScene);
    declareBuffers(buffersToken);
    declareBuffers(buffersFrameBox);
      
    gl.clearColor(bgColor[0], bgColor[1], bgColor[2], 1.0);

    gl.enable(gl.DEPTH_TEST);

    setViewportProjections(); // sets projection an model view matrices

    /// test
    loadedStage =  makeStage(mki3d.data, mki3d.url.symbol); /// test
    restoreStage( loadedStage );
    
    /// console.log( mki3d.data ); /// test

    startTravel();


}

window.onload = webGLStart;

