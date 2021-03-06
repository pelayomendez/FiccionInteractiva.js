// FiccionInteractiva.js
// Pelayo Méndez 2018
// engine.js - Engine funcionality
// v.0.1

import FIGraphicUtils from './graphics.js'

let FICoreEngineInstance

class FICoreEngine {

    constructor() 
    {  

      if (!FICoreEngineInstance) {
        FICoreEngineInstance = this;
      }
  
      this._version = "1.0"
      this._type = 'FICoreEngine'
      this._fictionData = null
      this._actualLocation = null
  
      return FICoreEngineInstance
  
    }
  
    // Getters & Setters 
    get type() { return this._type }
    set version(value) { this._version = value }
    get version() { return this._version }
    get fictionData() { return this._fictionData }
    set fictionData(value) { this._fictionData = value }
    get actualLocation() { return this._actualLocation }
    set actualLocation(value) { this._actualLocation = value }

    // Load fiction file
    loadFictionData(fictionFileName, callback) 
    {
      var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open('GET', fictionFileName, true);
      xobj.addEventListener('load', () => {
        if (xobj.readyState == 4 && xobj.status == "200") {
          this.fictionData = JSON.parse(xobj.responseText)
          callback(this.fictionData.titulo + '\n' 
                 + this.fictionData.descripcion + '\n'
                 + this.fictionData.autor + ' (' 
                 + this.fictionData.fecha + ')')
        } else {
          this.fictionData = null
          callback("No se ha podido cargar el archivo.")
        }
      });
      xobj.send(null)
    }

    // Evaluate user command
    evaluateSentence(sentence) {

      if (this._fictionData == null)
        return "No hay ninguna ficción cargada."

      if(this.fictionData.gameOver)
        return

      // Elements for evaluating commands.
      var currentLocation = this.fictionData.mapa.find(((room) => { return room.id === this.actualLocation}))
      var filteredSentence = sentence.toLowerCase()
      var words = sentence.split(' ').reverse()

      // Command: Salidas
      if(filteredSentence == "salidas") {
        var stringSalidas = "Salidas: ";
        for(var i = 0; i < currentLocation.salidas.length; i++) {
          stringSalidas = stringSalidas + currentLocation.salidas[i].displayName
        }
        return stringSalidas
      }

      // Command: Ir

      var checkSalida = words[0]
      if(words[1] == "ir" && words.length == 2) checkSalida =  words[1]
      if(words[0] == "ir" && words.length == 1) {
        return "¿Hacia dónde?"
      }

      for(var i = 0; i < currentLocation.salidas.length; i++) {
        if(checkSalida.toLowerCase() == currentLocation.salidas[i].displayName.toLowerCase()) {
          return this.moveTo(currentLocation.salidas[i].destination)
        }
      }

      // Command: Mirar
      if(words[0] == "mirar" && words.length == 1) {
        return this.moveTo(currentLocation.id)
      }

      // Command: Ayuda
      if(words[0] == "ayuda") {
        return "Utiliza 'Mirar [nombre del objeto]' para inspeccionar objetos. 'Salidas' para saber hacia donde te puedes mover. Después '[nombre de la salida]' para moverte en esa dirección. Y cualquier otro verbo que se te ocurra para interactuar."
      }

      // Comando: Genérico
      if(currentLocation != 'undefinded') {
        for(var i = 0; i < words.length; i++) {
          let objectOnScene = currentLocation.interacciones[words[i]]
          if(objectOnScene) {
            for(var a = i+1; a < words.length; a++) {
              let verbOnScene = objectOnScene[words[a]]
              if(verbOnScene) {
                var isAnAction = verbOnScene.search(/#*#/i)
                if(isAnAction == -1) {
                  return this.replaceVariablesValue(verbOnScene)
                } else {
                  return this.processAction(verbOnScene.substring(1,verbOnScene.length-1))
                }
              }
            }
          }
        }   
        return "Eso no sirve de nada."
      } else {
        return "Nada que hacer."
      }

    }

    // Move to a new location
    moveTo(locationName) 
    {

      if (this.fictionData == null)
        return "No hay ninguna ficción cargada."
   
      var newLocation = this.fictionData.mapa.find(((room) => { return room.id.toLowerCase() === locationName.toLowerCase()}))     
      var locationText = ''
      
      if(newLocation != 'undefinded') {
        this.actualLocation = newLocation.id
        locationText += '\n' + newLocation.titulo + ':\n\n' + newLocation.descripcion 
        if(newLocation.objetos) {
          for(var i = 0; i < newLocation.objetos.length; i++) {
            if(newLocation.objetos[i].visible) {
              locationText += '\n\n'+newLocation.objetos[i].descripcionEscena
            }
          }
        }
        locationText += '\n\n...'
      } else {
        locationText = "Localización no encontrada."
      }

      if(newLocation.id.toLowerCase() == "final") {
        this.fictionData.gameOver = true
        locationText += '\n\n' +  this.fictionData.textoFin
      }

      if(newLocation.imagen != '') {
        var img = new Image();
        img.onload = () => {
          var result = FIGraphicUtils.imageToAscii(img)
        }
        img.src = './../data/images/'+newLocation.imagen;
      }

      return locationText

    }

    // Process an action
    processAction(actionName) {

      let actionText = ''

      var currentLocation = this.fictionData.mapa.find(((room) => { return room.id === this.actualLocation}))

      function setVar(varName, varValue) {
        currentLocation.variables[varName] = varValue
      }

      function setObjVisibillity(objName, varValue) {
        var selectedObj = currentLocation.objetos.find(((obj) => { return obj.displayName === objName}))
        if(selectedObj != 'undefinded') {
          selectedObj.visible = varValue
          if(varValue) actionText += ' ' + selectedObj.descripcionEscena
        }
      }

      if(currentLocation.acciones[actionName]) {
        actionText += currentLocation.acciones[actionName].descripcion
        eval(currentLocation.acciones[actionName].funcion)
        return actionText
      }

      return "No consigues que funcione."

    }

    // Replace variables value
    replaceVariablesValue(stringToReplace) {

      var currentLocation = this.fictionData.mapa.find(((room) => { return room.id === this.actualLocation}))

      var hasVariable=/\[(.+?)\]/;
      if (hasVariable.test(stringToReplace)) {
        var variableName = stringToReplace.match(/\[(.+?)\]/)[1]
        var valueToReplace = currentLocation.variables[variableName]
        stringToReplace = stringToReplace.replace(/\[(.+?)\]/g, valueToReplace)
      }

      return stringToReplace

    }

    // Check if game has finished
    isGameFinished() {
      
      return  this.fictionData.gameOver

    }
    
}

export default new FICoreEngine()