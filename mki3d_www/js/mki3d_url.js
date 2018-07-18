mki3d.url={};

mki3d.url.base=document.referrer;

mki3d.url.load = async function( input ) { // load from url 
    console.log(input); /// tests
    let backup= mki3d.data;
    let url;
    try{
	if( mki3d.url.base )
	    url=new URL(input, mki3d.url.base );
	else
	    url=new URL(input); 
	console.log(url);
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
	// let filename = url.substring(url.lastIndexOf('/')+1);
	let pathname = url.pathname;
	let filename = pathname.substring(pathname.lastIndexOf('/')+1);
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
