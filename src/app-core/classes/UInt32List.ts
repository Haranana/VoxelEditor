export class UInt32List {
    #data: Uint32Array;
    #initialCapacity: number;
    #size = 0;

    constructor(initialCapacity = 16) {
        this.#initialCapacity = Math.max(0, initialCapacity);
        this.#data = new Uint32Array(this.#initialCapacity);
    }

    get size(): number {
        return this.#size;
    }

    get capacity(): number {
        return this.#data.length;
    }

    get(index: number): number {
        if (index < 0 || index >= this.#size) {
            throw new RangeError("Index out of bounds");
        }

        return this.#data[index];
    }

    add(value: number): void {
        this.ensureCapacity(this.#size + 1);
        this.#data[this.#size] = value;
        this.#size++;
    }

    remove(value: number): boolean {
        let id = -1;

        for (let i = 0; i < this.#size; i++) {
            if (this.#data[i] === value) {
                id = i;
                break;
            }
        }

        if (id === -1) {
            return false;
        }

        this.#data[id] = this.#data[this.#size - 1];
        this.#size--;

        return true;
    }

    clear(): void {
        this.#data = new Uint32Array(this.#initialCapacity);
        this.#size = 0;
    }

    array(): Uint32Array {
        return this.#data.subarray(0, this.#size);
    }

    copy(): UInt32List {
        const out = new UInt32List(this.#size);

        out.#data.set(this.#data.subarray(0, this.#size));
        out.#size = this.#size;

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
        newData.set(this.#data.subarray(0, this.#size));

        this.#data = newData;
    }
}