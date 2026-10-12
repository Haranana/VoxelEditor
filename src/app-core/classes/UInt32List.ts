export class UInt32List {
    #data: Uint32Array;
    #size = 0;

    constructor(initialCapacity = 16) {
        this.#data = new Uint32Array(initialCapacity);
    }

    get size(): number {
        return this.#size;
    }

    get(index: number): number {
        return this.#data[index];
    }

    add(value: number): void {
        this.ensureCapacity(this.#size + 1);
        this.#data[this.#size++] = value;
    }

    remove(value: number): boolean{
        const id = this.#data.findIndex((v)=>v===value);
        if(id===undefined) return false;
        this.#data[id] = this.#data[this.#size-1];
        this.#size--;
        return true;
    }

    clear(): void {
        this.#size = 0;
    }

    array(): Uint32Array{
        return this.#data;
    }

    copy(){
        const out = new UInt32List(this.#size);
        out.#data = new Uint32Array(this.#data);
        return out;
    }

    private ensureCapacity(requiredCapacity: number): void {
        if (requiredCapacity <= this.#data.length) {
            return;
        }

        let newCapacity = this.#data.length * 2;

        if (newCapacity === 0) {
            newCapacity = 16;
        }

        while (newCapacity < requiredCapacity) {
            newCapacity *= 2;
        }

        const newData = new Uint32Array(newCapacity);
        newData.set(this.#data);

        this.#data = newData;
    }
}