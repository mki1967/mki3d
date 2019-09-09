/* single step backup / undo operations for mki3d */

mki3d.backup={};

mki3d.backup.backupDataString=null; // backuped data  (initially no backup)

mki3d.backup.preDataString=null;  // stringified data before the action to be backuped if the action changes the data

// use this function before the action that can cause the backup if data is changed
mki3d.backup.prepare= function(){
    mki3d.backup.preDataString= JSON.stringify( mki3d.data );
}

// use this function after the action that can cause the backup if data is changed
mki3d.backup.commit= function(){
    if( mki3d.backup.preDataString === null ){
	// console.log( "'mki3d.backup.commit()' not peceded with 'mki3d.backup.prepare()' !!!" );
	return;
    }
    { // compare relevant data fragments
	let tmp=JSON.stringify( mki3d.data.model ).concat( JSON.stringify( mki3d.data.texture ) );
	let d=JSON.parse( mki3d.backup.preDataString );
	let tmp2=JSON.stringify( d.model ).concat( JSON.stringify( d.texture ) );
	if( tmp.localeCompare(tmp2) == 0 ) {
	    // no change in data - no backup
	    mki3d.backup.preDataString=null; // always null after commit
	    return;
	}
    }
    // do backup of preData
    mki3d.backup.backupDataString=mki3d.backup.preDataString; // old backup is lost !
    mki3d.backup.preDataString=null; // always null after commit
}

/* swap backup data and current mki3d.data */
mki3d.undo= function(){
    if( mki3d.backup.backupDataString === null){
	mki3d.message( "No backup data !!!");
	return;
    }
    let tmp= JSON.stringify( mki3d.data );
    mki3d_texture.deleteTextureGlObjects( mki3d.data, mki3d.gl.context ); // remove GL objects of old data
    mki3d.data= JSON.parse(  mki3d.backup.backupDataString );
    mki3d_texture.makeGlInTextures(mki3d.data, mki3d.shadeFactor, mki3d.gl.context, mki3d.gl.compileAndLinkShaderProgram ); // make GL objects for loaded data
    mki3d.tmpRebuildSelected();
    mki3d.backup.backupDataString=tmp; // swaped
    mki3d.redraw();
    mki3d.message("UNDO");
}
