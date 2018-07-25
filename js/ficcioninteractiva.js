// FiccionInteractiva.js
// Pelayo Méndez 2018
// main.js - Main app
// v.0.1

import FIConsole from './console.js'

// Startup functions
document.addEventListener('DOMContentLoaded', function() {

    FIConsole.displayResize()
    FIConsole.clear()
    FIConsole.printText('Bienvenido a FicciónInteractiva.js!','terminal')
    FIConsole.loadFiction('../data/ejemplo.json')
    
}, false)