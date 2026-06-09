'use strict';

import { Terminal } from './xterm.min.js';
import { Fit } from './xterm-addon-fit.min.js';
Terminal.applyAddon(Fit);

import { molokaiTheme } from './config.js';
import { boot as vmBoot, resume as vmResume, suspend as vmSuspend } from './vm.js';

function createTerm() {
  const term = (window.term = new Terminal({ theme: molokaiTheme }));
  term.open(document.getElementById('terminal'));
  term.fit();
  return term;
}

export function start() {
  window.addEventListener('DOMContentLoaded', () => {
    const term = createTerm();
    vmBoot(term);

    // Whether or not the button is active or disabled (has .inactive class)
    function isInactive(elem) {
      return elem.classList.contains('inactive');
    }

    // Play
    document.querySelector('#term-play').onclick = function(e) {
      e.preventDefault();
      if(isInactive(e.target)) return;

      vmResume();
      term.focus();
    };

    // Pause
    document.querySelector('#term-pause').onclick = function(e) {
      e.preventDefault();
      if(isInactive(e.target)) return;

      vmSuspend();
    };
  });
}
