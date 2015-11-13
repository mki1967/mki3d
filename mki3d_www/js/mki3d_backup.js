/* backup operations (undo) for mki3d */

mki3d.backup={};

/* check and set initial autosave and backup */
mki3d.backupCheck= function(){
    if (!mki3d.backup.currentModelString) 
	mki3d.backup.currentModelString = JSON.stringify(mki3d.data.model);
    if(!mki3d.backup.oldModelString)
	mki3d.backup.oldModelString=mki3d.backup.currentModelString;

}

mki3d.backup= function(){
    mki3d.backupCheck();
    /* test for a change */
    var tmp= JSON.stringify(mki3d.data.model);
    if( tmp.localeCompare(mki3d.backup.currentModelString) == 0 ) return ""; // no change in the model
    /* here: the model has changed */
    mki3d.backup.oldModelString=mki3d.backup.currentModelString;
    mki3d.backup.currentModelString=tmp;
    return "<br> MODEL HAS CHANGED";
}

mki3d.restoreCurrentModel= function(){
    mki3d.data.model=JSON.parse(mki3d.backup.currentModelString);
    mki3d.tmpResetDisplayModel();
    mki3d.redraw();
}

/* swap backup and autosave and restore from autosave */
mki3d.undo= function(){
    mki3d.backupCheck();
    var tmp= mki3d.backup.currentModelString;
    mki3d.backup.currentModelString=mki3d.backup.oldModelString;
    mki3d.backup.oldModelString=tmp;
    mki3d.restoreCurrentModel();
}

