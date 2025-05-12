class AbstractListener {
    listen(event) {
        throw new Error("Abstract method!");
    }
}

class AbstractPublisher {
    constructor() {
        /**
         * @type {Listener[]}
         */
        this.__listeners = []
    }

    notify(event) {
        this.__listeners.listen()
    }
}
