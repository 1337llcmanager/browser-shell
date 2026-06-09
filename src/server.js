'use strict';

import { Workbox } from './workbox-window.min.js';
import { start as startBrowser } from './browser.js';
import { fsRoot } from './config.js';
import { install as installFilesystem } from './filesystem.js';

/**
 * Parcel doesn't like relative links to routes in a service worker.
 * So let's do it at run-time vs. build-time! Swap all 
 * <code class="parcel-ignore">/fs/...</code> for <a> links to server.
 */
function fixFsUrls() {
  const links = document.querySelectorAll('.parcel-ignore');
  if(!links) return;
  
  links.forEach(link => {
    const path = link.innerHTML;
    link.innerHTML = '';

    const a = document.createElement('a');
    a.href = path;
    a.innerHTML = path;
    a.target = '_blank';
    link.appendChild(a);
  });
}

/**
 * Register the nohost service worker, passing `route`
 */
export function start() {
  if(!('serviceWorker' in navigator)) {
    console.log('[nohost] unable to initialize service worker: not supported.');
    return;
  }

  // Downloaded via package.json script from https://www.npmjs.com/package/nohost?activeTab=versions via unpkg
  const wb = new Workbox(`nohost-sw.js?route=${encodeURIComponent(fsRoot)}`);

  // Wait on the server to be fully ready to handle routing requests
  wb.controlling.then(() => {
    fixFsUrls();
    startBrowser();
  });

  // Deal with first-run install, if necessary
  wb.addEventListener('installed', (event) => {
    if(!event.isUpdate) {
      installFilesystem();
    }
  });
  
  // Register the service worker after event listeners have been added.
  wb.register();
}
