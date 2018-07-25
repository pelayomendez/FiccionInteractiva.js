// FiccionInteractiva.js
// Pelayo Méndez 2018
// console.js - Command console
// v.0.1

import FICoreEngine from './engine.js'

class FIConsole {

    constructor() 
    {
      this._version = "1.0"
      this._type = 'FIConsole'
      this._console = document.getElementById('console')
      this._input = document.getElementById('input')
      this._screen = document.getElementById('display')
      this._console.addEventListener('submit', evt => this.onUserSubmitsText(evt));
      this.displayResize()
    }
  
    get type() { return this._type }
    set version(value) { this._version = value }
    get version() { return this._version }

    // Recive submited Text by the user an process it.
    onUserSubmitsText(event) 
    {
        event.preventDefault()
        
        if(FICoreEngine.isGameFinished()) return

        var inputString = this._input.value
        this._input.value = ''
        this.printText(inputString,'player')
    }

    // Print text to screen.
    printText(message, actor) 
    {
        if(actor == 'player'){
            var response = FICoreEngine.evaluateSentence(message)
            message = '> ' + message + '\n' + response
        }
        var displayString = this._screen.value + message + '\n'
        this._screen.value = displayString
        this.displayResize()
    }

    // Clear the console.
    clear() {
        this._screen.value = ''
    }

    // Load a fiction file.
    loadFiction(fictionFilePath) 
    {
        this.printText('Cargando:' + fictionFilePath,'terminal')
        FICoreEngine.loadFictionData(fictionFilePath, (message) => {
            var titleScreen = '\n' + message
            this.printText(titleScreen,'terminal')
            var actualRoom = FICoreEngine.moveTo('Comienzo')
            this.printText(actualRoom,'terminal')
        })
    }

    // Resize terminal.
    displayResize() 
    {
        this._screen.style.height = window.innerHeight - 30;
        this._screen.scrollTop = this._screen.scrollHeight;
    }

}

export default new FIConsole()