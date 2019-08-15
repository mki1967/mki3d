mki3d.url={};

mki3d.url.base=document.referrer;

mki3d.url.minDistance=1; // minimal distance between link positions

mki3d.drawLinks= true; // draw the links

mki3d.url.editedIdx=null; // index of the edited link

mki3d.url.clipboard=null; // the cut or copied link

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
	let data= await response.json();
	// console.log(result); /// tests
	mki3d_texture.makeGlInTextures(data, mki3d.gl.context, mki3d.gl.compileAndLinkShaderProgram ); // make GL objects for loaded data
	mki3d_texture.deleteTextureGlObjects( mki3d.data, mki3d.gl.context ); // remove GL objects of old data
	
	mki3d.data=data; /// !!!
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

mki3d.url.cutLinkAtIdx= function(idx ){
    if( !mki3d.data.links || idx<0 || idx > mki3d.data.links.length-1 ) return "NOTHING TO BE CUT !!!";
    mki3d.url.clipboard= mki3d.data.links[ idx ];
    mki3d.data.links[ idx ]= mki3d.data.links[ mki3d.data.links.length-1 ];
    mki3d.data.links.pop();
    return "CUT: <code>"+JSON.stringify(mki3d.url.clipboard)+"</code>";
}

mki3d.url.pasteLinkIdxAtPosition= function(position ){
    if(mki3d.url.clipboard === null ) return "NOTHING IN THE LINK CLIPBOARD !!!";
    link=JSON.parse(JSON.stringify(mki3d.url.clipboard)); //clone
    link.position=JSON.parse(JSON.stringify(position));
    return mki3d.url.addLink( link );
}

mki3d.url.linkIdxAtPosition= function(position ){
    if( ! mki3d.data.links ) {
	return -1; // "THERE ARE NO LINKS"
    }
    nearestIdx=mki3d.findNearestEndpointIdx( position, mki3d.data.links  );
    if( nearestIdx === -1 || mki3d.distanceSquare(mki3d.data.links[nearestIdx].position, position) > 0 ) {
	return -1; // "THERE IS NO LINK AT "+JSON.stringify(position)+" !";
    }

    return nearestIdx ; 
    
}

// create complete link

mki3d.url.completeLink= function ( opener, input) {
    if(! input ) return null; // input must be!
    let url;
    if( mki3d.url.base )
	url=new URL(input, mki3d.url.base );
    else
	url=new URL(input);
    if( !opener ) return url;

    let openerURL= new URL(opener, window.location.href ); // if opener is relative URL we take the base of current window
    // add code for opener ...

    return String(openerURL)+encodeURI(String(url)); // the url as encoded parameter
}


