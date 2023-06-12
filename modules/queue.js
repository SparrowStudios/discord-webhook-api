import { sleep } from "../modules/utils.js";

export default class Queue {

    constructor(processFunc) {
        this.processFunc = processFunc;
        this.elements = {};
        this.head = 0;
        this.tail = 0;
    }

    get length() {
        return this.tail - this.head;
    }

    get isEmpty() {
        return this.length === 0;
    }

    get hasNext() {
        return !this.isEmpty;
    }

    enqueue(element) {
        this.elements[this.tail] = element;
        this.tail++;
    }

    dequeue() {
        const item = this.elements[this.head];
        delete this.elements[this.head];
        this.head++;
        return item;
    }

    peek() {
        return this.elements[this.head];
    }

    async processNext() {
        let result = await this.processFunc(this.peek());
        this.dequeue();
        return result;
    }

    async processQueue(delay = 0) {
        while (this.hasNext) { 
            await this.processNext();
            if (delay > 0) { await sleep(1000); }
        }
    }
}
