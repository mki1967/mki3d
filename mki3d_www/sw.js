/*
  service worker for mki3d.html
*/

var appName = 'mki3d';
var version = '0.32';
var currentCacheName= appName+'_'+version;   // e.g.: 'mki3d_0.0.1';

self.addEventListener('install', e => {
    e.waitUntil(
	caches.open(currentCacheName).then(cache =>
				       {
					   return fetch('files-to-cache.json').then(response => {
					       return response.json();
					   } ).then( files => {
					       console.log(files);
					       return cache.addAll(files);
					   } )
				       }).then( () => {
					   console.log("CACHED !!!");
				       })
    );

});

self.addEventListener('activate', e => {
    e.waitUntil(
	caches.keys().then( cacheNames =>
			    {
				console.log(cacheNames); // test
				let toDelete = cacheNames.filter(
					name => name.localeCompare(currentCacheName) != 0 && name.includes(appName+'_')
				);
				console.log(toDelete);  // test
				return Promise.all (
				    toDelete.map( cacheName  => caches.delete(cacheName) )
				);
			    }
			  )
    )
});


self.addEventListener('fetch', e => {
    e.respondWith(
	caches.match(e.request).then(response => {
	    return response || fetch(e.request);
	})
    );
});
