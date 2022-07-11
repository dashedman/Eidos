"use strict"
class EngineError extends Error {
    constructor(msg="Engine Error!") {
        super(msg)
    }
}

class NotImplementedError extends EngineError {
    constructor(msg="Not Implemented Error!") {
        super(msg)
    }
}

class AbstractMethodError extends EngineError {
    constructor(msg="Abstract method!") {
        super(msg)
    }
}

class PrepareEntityError extends EngineError {
    constructor(msg="Bad prepare params!") {
        super(msg)
    }
}

export {
    EngineError, NotImplementedError, AbstractMethodError, PrepareEntityError
}
