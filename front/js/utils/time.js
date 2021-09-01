function TimeManager(){
    // Date.now() better to use than new Date().getTime()
    // to prevent instantiating unnecessary Date objects. 
    //
    // But performance.now() better)))
    this.lastTime = null
    this.time = performance.now()
    this.deltaTime = null
}
TimeManager.prototype.calc = function() {
    // time difference between iterations 
    this.lastTime = this.time
    this.time = performance.now()
    this.deltaTime = this.time - this.lastTime
}
TimeManager.prototype.toNext = function(interval) {
    // remaining time until the start of the next iteraction
    return Math.max(0, interval - (performance.now() - this.time))
}