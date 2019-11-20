
// inserting to stageArray
function insertNewStage(){
var idx = stageArray.length;
stageArray[idx]={};
stageArray[idx].bgColor=bgColor;
stageArray[idx].scene=scene;
stageArray[idx].traveler=traveler;
// stageArray[idx].token=token;
    stageArray[idx].linkSymbol=linkSymbol;
    frameBox= makeFrameBox(traveler);
stageArray[idx].frameBox=frameBox;
/*
The GL buffers for the graphs: scene, traveler, token, framebox, ...  must be initialised by initBuffers(...)
This is done in webGLStart().
*/
}


function makeFrameBox(traveler) {
    var v000= [traveler.vMin[0]-XMargin, traveler.vMin[1]-YMargin,traveler.vMin[2]-ZMargin ];
    var v001= [traveler.vMin[0]-XMargin, traveler.vMin[1]-YMargin,traveler.vMax[2]+ZMargin ];
    var v010= [traveler.vMin[0]-XMargin, traveler.vMax[1]+YMargin,traveler.vMin[2]-ZMargin ];
    var v011= [traveler.vMin[0]-XMargin, traveler.vMax[1]+YMargin,traveler.vMax[2]+ZMargin ];

    var v100= [traveler.vMax[0]+XMargin, traveler.vMin[1]-YMargin,traveler.vMin[2]-ZMargin ];
    var v101= [traveler.vMax[0]+XMargin, traveler.vMin[1]-YMargin,traveler.vMax[2]+ZMargin ];
    var v110= [traveler.vMax[0]+XMargin, traveler.vMax[1]+YMargin,traveler.vMin[2]-ZMargin ];
    var v111= [traveler.vMax[0]+XMargin, traveler.vMax[1]+YMargin,traveler.vMax[2]+ZMargin ];

    var frameBox = {}; // create new object
    frameBox.nrOfLines=  12;
    frameBox.linesVertices = new Float32Array( [
	v000[0],v000[1],v000[2], v001[0],v001[1],v001[2],
	v010[0],v010[1],v000[2], v011[0],v011[1],v011[2],
	v100[0],v100[1],v100[2], v101[0],v101[1],v101[2],
	v110[0],v110[1],v110[2], v111[0],v111[1],v111[2],

	v000[0],v000[1],v000[2], v010[0],v010[1],v010[2],
	v001[0],v001[1],v001[2], v011[0],v011[1],v011[2],
	v100[0],v100[1],v100[2], v110[0],v110[1],v110[2],
	v101[0],v101[1],v101[2], v111[0],v111[1],v111[2],

	v000[0],v000[1],v000[2], v100[0],v100[1],v100[2],
	v001[0],v001[1],v001[2], v101[0],v101[1],v101[2],
	v010[0],v010[1],v010[2], v110[0],v110[1],v110[2],
	v011[0],v011[1],v011[2], v111[0],v111[1],v111[2]
    ] );

    frameBox.linesColors = new Float32Array( [
	1,1,1, 1,1,1,
	1,1,1, 1,1,1,
	1,1,1, 1,1,1,
	1,1,1, 1,1,1,

	1,1,1, 1,1,1,
	1,1,1, 1,1,1,
	1,1,1, 1,1,1,
	1,1,1, 1,1,1,

	1,1,1, 1,1,1,
	1,1,1, 1,1,1,
	1,1,1, 1,1,1,
	1,1,1, 1,1,1
    ] );

    frameBox.nrOfTriangles=0;
    frameBox.trianglesVertices = new Float32Array( [
    ] );

    frameBox.trianglesColors = new Float32Array( [
    ] );

    return frameBox;
}

function restoreStage(stage)
{
    bgColor=stage.bgColor;
    scene=stage.scene;
    traveler=stage.traveler;
    // token=stage.token;
    linkSymbol=stage.linkSymbol;
    frameBox= stage.frameBox;

    loadBuffers( scene, buffersScene );
    // loadBuffers( token, buffersToken );
    loadBuffers( linkSymbol, buffersLinkSymbol );
    loadBuffers( frameBox, buffersFrameBox );
    
}
