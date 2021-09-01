// LOADER SCRIPT
async function initGame(){
    await utils.loadScript("js/loader.js")
    await loadLibs()

    console.log("Game started...")
    let canvas = document.getElementById("viewport");

    state = new Statement(canvas)
    state.loop.interval = 0.016
    
    await loadGame(state)

    state.run()
}
// start
initGame()