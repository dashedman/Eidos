"use strict"

/** @template K1, K2, V */
export default class Map2D{ 
    /**
     * @interface Iterable
     * @param {Iterable<readonly [K1, K2, V]>} [iterable]
     */
    constructor(iterable){
        this.size = 0
        this._majorMap = new Map()
        if(iterable){
            for(let [key1, key2, value] of iterable){
                this.set(key1, key2, value)
            }
        }
    }
    clear(){
        this._majorMap.clear()
        this.size = 0
    }
    /**
     * 
     * @returns {IterableIterator<[K1, K2, V]>}
     */
    entries(){
        const majorIter = this._majorMap.entries()
        let minorMap
        let minorIter = {
            next: () => ({done: true, value: undefined})
        }

        let key1, key2, value

        return {
            next: () => {
                let minorNext = minorIter.next()
                // if minor iterator is end
                if(minorNext.done){
                    // get next iterator
                    const majorNext = majorIter.next()

                    if(majorNext.done){
                        // if major iterator is end - end of this iterator
                        return {done: true, value: undefined}
                    }

                    [key1, minorMap] = majorNext.value
                    minorIter = minorMap.entries()

                    minorNext = minorIter.next()
                }
                [key2, value] = minorNext.value
                return {
                    value: [key1, key2, value],
                    done: false
                }
            },
            [Symbol.iterator]: function(){return this}
        }
    }

    /**
     * 
     * @returns {IterableIterator<[K1, K2, V]>}
     */
    [Symbol.iterator] = this.entries

    /**
     * 
     * @returns {IterableIterator<[K1, K2]>}
     */
    keys(){
        const iter = this[Symbol.iterator]()
        return {
            next: () => {
                const next_obj = iter.next()
                
                if(next_obj.done) return {done: true, value: undefined}
                return {
                    value: [next_obj.value[0], next_obj.value[1]],
                    done: false
                }
            },
            [Symbol.iterator]: function(){return this}
        }
    }

    /**
     * 
     * @returns {IterableIterator<V>}
     */
    values(){
        const iter = this[Symbol.iterator]()
        return {
            next: () => {
                const next_obj = iter.next()
                if(next_obj.done) return {value: undefined, done: true}
                return {
                    value: next_obj.value[2],
                    done: false
                }
            },
            [Symbol.iterator]: function(){return this}
        }
    }

    forEach(callback, thisArg){
        for(const [key1, key2, val] of this){
            callback.call(thisArg, val, key1, key2, this)
        }
    }

    /**
     * @param {[K1, K2]}
     * @returns {V}
     */
    get(key1, key2){
        const minorMap = this._majorMap.get(key1)
        if(minorMap !== undefined){
            return minorMap.get(key2)
        }
        return undefined
    }

    /**
     * @param {[K1, K2]}
     * @returns {Boolean}
     */
    has(key1, key2){
        const minorMap = this._majorMap.get(key1)
        if(minorMap !== undefined){
            return minorMap.has(key2)
        }
        return false
    }

    /**
     * @param {[K1, K2, V]}
     * @returns {Map2D<K1, K2, V>}
     */
    set(key1, key2, value){
        const minorMap = this._majorMap.get(key1)
        if(minorMap !== undefined){
            if(!minorMap.has(key2)){ 
                this.size++
            }
            minorMap.set(key2, value)
        }else{
            // create new minor map if not existed
            // for this key1
            this._majorMap.set(key1, new Map([[key2, value]]))
            this.size++
        }
        return this
    }

    /**
     * @param {[K1, K2]}
     * @returns {Boolean}
     */
    delete(key1, key2){
        const minorMap = this._majorMap.get(key1)
        if(minorMap !== undefined){
            if(minorMap.delete(key2)){
                // clear empty minor map
                if(minorMap.size == 0){
                    this._majorMap.delete(key1)
                }
                this.size--
                return true // successful delete
            }
            return false
        }
        return false
    }

}
