mki3d.url={};

mki3d.url.base=document.referrer;

mki3d.url.minDistance=1; // minimal distance between link positions

mki3d.drawLinks= true; // draw the links

// mki3d.url.symbol = {"model":{"segments":[[{"position":[-1,0,0],"color":[0,0,1],"set":0},{"position":[0,-1,0],"color":[0,0,1],"set":0}],[{"position":[-1,0,0],"color":[0,0,1],"set":0},{"position":[0,1,0],"color":[0,0,1],"set":0}],[{"position":[0,-1,0],"color":[0,0,1],"set":0},{"position":[1,0,0],"color":[0,0,1],"set":0}],[{"position":[0,1,0],"color":[0,0,1],"set":0},{"position":[1,0,0],"color":[0,0,1],"set":0}]],"triangles":[[{"position":[-1,0,0],"color":[1,1,1],"set":0},{"position":[0,-1,0],"color":[1,1,1],"set":0},{"position":[0,0,0],"color":[1,1,1],"set":0}],[{"position":[-1,0,0],"color":[1,0,0],"set":0},{"position":[0,0,0],"color":[1,0,0],"set":0},{"position":[0,1,0],"color":[1,0,0],"set":0}],[{"position":[0,-1,0],"color":[1,0,0],"set":0},{"position":[0,0,0],"color":[1,0,0],"set":0},{"position":[1,0,0],"color":[1,0,0],"set":0}],[{"position":[0,0,0],"color":[1,1,1],"set":0},{"position":[0,1,0],"color":[1,1,1],"set":0},{"position":[1,0,0],"color":[1,1,1],"set":0}]]},"view":{"focusPoint":[0,0,0],"rotationMatrix":[[1,0,0],[0,1,0],[0,0,1]],"scale":2,"screenShift":[0,0,60]},"projection":{"zNear":0.25,"zFar":300,"zoomY":4},"backgroundColor":[0,1,1],"cursor":{"position":[0,0,0],"marker1":null,"marker2":null,"color":[0,0,1],"step":0.5},"clipMaxVector":[100000000000000000000,100000000000000000000,100000000000000000000],"clipMinVector":[-100000000000000000000,-100000000000000000000,-100000000000000000000],"light":{"vector":[0,0,1],"ambientFraction":0.2},"set":{"current":0}};




mki3d.url.load = async function( input ) { // load from url 
    // console.log(input); /// tests
    let backup= mki3d.data;
    let url;
    try{
	if( mki3d.url.base )
	    url=new URL(input, mki3d.url.base );
	else
	    url=new URL(input); 
	// console.log(url); /// tests
	mki3d.message("LOADING FROM "+url+" ...");
	let response=await fetch(url, {cache: 'no-cache', mode: 'cors'} );
	// console.log( response );   
	let result= await response.json();
	// console.log(result); /// tests
	
	mki3d.data=result; /// !!!
	mki3d.tmpCancel();
	mki3d.setModelViewMatrix();
	mki3d.backup();
	mki3d.redraw();
	// let filename = url.substring(url.lastIndexOf('/')+1);
	let pathname = url.pathname;
	let filename = pathname.substring(pathname.lastIndexOf('/')+1);
	mki3d.file.suggestedName= mki3d.file.withoutExtension(filename);
	mki3d.url.base= url; // new base for next load
	mki3d.message("LOADED FROM "+url+".");
    }
    catch( err ) {
	console.log(err);
	mki3d.message("FAILED TO LOAD FROM "+url+".");
	mki3d.data= backup;
	mki3d.tmpCancel();
	mki3d.setModelViewMatrix();
	mki3d.backup();
	mki3d.redraw();
    }
    // console.log(mki3d.data); /// tests
}

mki3d.url.newLink= function(){
    return {
	label:"",
	opener:"",
	url:"",
	position: [0,0,0]
    }
}


mki3d.url.addLink= function(link ){
    if( ! mki3d.data.links ) {
	mki3d.data.links=[]
    }
    nearest=mki3d.findNearestEndpoint( link.position, mki3d.data.links  );
    if( !nearest || mki3d.distanceSquare(nearest.position, link.position) >= mki3d.url.minDistance * mki3d.url.minDistance ) {
	mki3d.data.links.push( link );
	return "NEW LINK ADDED AT "+JSON.stringify(link.position)+"!";
    }

    return "ADDING NEW LINK FAILED !!!<br>(TOO CLOSE TO ANOTHER LINK; MIN_URL_DISTANCE="+mki3d.url.minDistance+")"; 
    
}

