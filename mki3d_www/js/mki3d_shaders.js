/*jshint multistr: true */
var VERTEX_SHADER_STRING = " \
attribute vec3 aVertexPosition; \
attribute vec4 aVertexColor; \
uniform mat4 uMVMatrix; \
uniform mat4 uPMatrix; \
uniform vec3 mov; \
varying vec4 vColor; \
void main(void) { \
gl_Position = uPMatrix * uMVMatrix * vec4(mov+aVertexPosition, 1.0); \
vColor = aVertexColor; \
}";

var FRAGMENT_SHADER_STRING = " \
precision mediump float; \
varying vec4 vColor; \
void main(void) { \
gl_FragColor = vColor; \
}";

// SHADERS
var shaderProgram;

// parameters for shaders
var vertexPositionSize=3; // x,y,z -- three components of the position
var vertexColorSize=3;    // RGB   -- three components of the color
var mvMatrix; // model-view matrix -- uniform 
var pMatrix; // projection matrix  -- uniform
var mov; //  movement              -- uniform

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
        alert("Could not initialise shaders");
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
}



function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


function initBuffers(graph) {


    graph.linesVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, graph.linesVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, graph.linesVertices, gl.STATIC_DRAW);

    graph.linesColorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, graph.linesColorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, graph.linesColors, gl.STATIC_DRAW);

    graph.trianglesVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, graph.trianglesVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, graph.trianglesVertices, gl.STATIC_DRAW);

    graph.trianglesColorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, graph.trianglesColorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, graph.trianglesColors, gl.STATIC_DRAW);

}

