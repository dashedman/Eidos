"use strict"

import { NotImplementedError } from "../exceptions.js"

/** @template V */
class DequeItem {
    /**
     * 
     * @param {V} value 
     */
    constructor(value) {
        /** @type {DequeItem<V>} */
        this.prevItem = null
        /** @type {DequeItem<V>} */
        this.nextItem = null
        this.value = value
    }
}

/** @template V */
export default class Deque{ 
    /**
     * @interface Iterable
     * @param {Iterable<readonly V>} [iterable]
     */
    constructor(iterable, maxlen=null){
        this.length = 0
        this.maxlen = maxlen
        this.firstItem = this.lastItem = null

        if(iterable){
            for(let item of iterable){
                this.push(item)
            }
        }
    }

    clear(){
        this.length = 0
        this.firstItem = this.lastItem = null
    }

    /**
     * 
     * @param {V} value 
     */
    push(value){
        this.length++
        if(this.lastItem === null) {
            this.firstItem = this.lastItem = new DequeItem(value)
            return
        }

        let newItem = new DequeItem(value)
        this.lastItem.nextItem = newItem
        newItem.prevItem = this.lastItem

        this.lastItem = newItem
    }

    /**
     * 
     * @param {V} value 
     */
     pushLeft(value){
        this.length++
        if(this.lastItem === null) {
            this.firstItem = this.lastItem = new DequeItem(value)
            return
        }

        let newItem = new DequeItem(value)
        this.firstItem.prevItem = newItem
        newItem.nextItem = this.firstItem

        this.firstItem = newItem
    }
    
    /**
     * 
     * @param {Iterable<V>} iterable 
     */
    extend(iterable) {
        for(let item of iterable) {
            this.push(item)
        }
    }

    /**
     * 
     * @param {Iterable<V>} iterable 
     */
    extendLeft(iterable) {
        for(let item of iterable) {
            this.pushLeft(item)
        }
    }

    /**
     * 
     * @param {number} index 
     * @param {value} value 
     */
    insert(index, value) {
        throw new NotImplementedError('Deque method not implemented!')
    }

    /**
     * @returns {V}
     */
    pop() {
        // no items
        if(this.length === 0) return null
        let value = this.lastItem.value
        // delete item
        this.length--
        if(this.length === 0) {
            // delete one item
            this.firstItem = this.lastItem = null
        } else {
            let lastItem = this.lastItem
            this.lastItem = lastItem.prevItem

            this.lastItem.nextItem = null
            lastItem.prevItem = null
        }

        return value
    }

    /**
     * @returns {V}
     */
     popLeft() {
        // no items
        if(this.length === 0) return null
        let value = this.firstItem.value
        // delete item
        this.length--
        if(this.length === 0) {
            // delete one item
            this.firstItem = this.lastItem = null
        } else {
            let firstItem = this.firstItem
            this.firstItem = firstItem.nextItem
            
            this.firstItem.prevItem = null
            firstItem.nextItem = null
        }

        return value
    }

    /**
     * 
     * @param {V} value 
     */
    remove(value) {
        throw new NotImplementedError('Deque method not implemented!')
    }

    reverse() {
        throw new NotImplementedError('Deque method not implemented!')
    }

    /**
     * 
     * @param {number} n 
     */
    rotate(n=1){
        throw new NotImplementedError('Deque method not implemented!')
    }

    /**
     * 
     * @returns {boolean}
     */
    isEmpty() {
        return this.length === 0
    }

    /**
     * 
     * @param {V} value 
     * @param {number} start 
     * @param {number} end 
     */
    index(value, start=null, end=null) {
        throw new NotImplementedError('Deque method not implemented!')
    }

    /**
     * 
     * @param {V} value 
     */
    count(value) {
        throw new NotImplementedError('Deque method not implemented!')
    }

    /**
     * 
     * @returns {IterableIterator<[K1, K2, V]>}
     */
    entries(){
        throw new NotImplementedError('Deque method not implemented!')
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
     * @returns {IterableIterator<V>}
     */
    [Symbol.iterator] = this.entries

    forEach(callback, thisArg){
        for(const val of this){
            callback.call(thisArg, val, this)
        }
    }

    /**
     * @param {number} index
     * @returns {V}
     */
    get(index){
        throw new NotImplementedError('Deque method not implemented!')
    }

    /**
     * @param {number}
     * @returns {Boolean}
     */
    has(index){
        throw new NotImplementedError('Deque method not implemented!')
        const minorMap = this._majorMap.get(key1)
        if(minorMap !== undefined){
            return minorMap.has(key2)
        }
        return false
    }

    /**
     * @param {[number, V]}
     * @returns {Map2D<K1, K2, V>}
     */
    set(index, value){
        throw new NotImplementedError('Deque method not implemented!')
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
     * @param {number}
     * @returns {Boolean}
     */
    delete(index){
        throw new NotImplementedError('Deque method not implemented!')
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
