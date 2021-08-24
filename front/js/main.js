const loopInterval = 0.016

let canvas = document.getElementById("viewport");

var game = new Statement(canvas)

game.loopInterval = loopInterval

game.run()