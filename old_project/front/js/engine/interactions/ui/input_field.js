export default class InputField {
    constructor (dispatcher, x=0, y=0, w=2, h=0.3) {
        this._dispatcher = dispatcher
        this._x = x
        this._y = y
        this._w = w
        this._h = h
    }

    focuse() {}
    unfocuse() {}
}