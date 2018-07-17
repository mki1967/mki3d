mki3d.url={};


mki3d.url.load = async function( url ) { // load from url 
    console.log(mki3d.data); /// tests
    let backup= mki3d.data;
    try{
	console.log(mki3d.url.base);
	mki3d.message("LOADING FROM "+url+" ...");
	let response=await fetch(url, {cache: 'no-cache', mode: 'cors'} );
	console.log( response );   
	let result= await response.json();
	console.log(result); /// tests
	
	mki3d.data=result; /// !!!
	mki3d.tmpCancel();
	mki3d.setModelViewMatrix();
	mki3d.backup();
	mki3d.redraw();
	let filename = url.substring(url.lastIndexOf('/')+1);
	 mki3d.file.suggestedName= mki3d.file.withoutExtension(filename);
	
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
    console.log(mki3d.data); /// tests
}
