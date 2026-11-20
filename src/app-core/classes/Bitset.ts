
export class BitSet {
    #data: Uint32Array;
    #size: number;

    constructor(size: number) {
        if (!Number.isInteger(size) || size < 0) {
            throw new Error("Invalid BitSet size");
        }

        this.#size = size;
        this.#data = new Uint32Array(Math.ceil(size / 32));
    }

    resize(newSize: number){
        if (!Number.isInteger(newSize) || newSize < 0) {
            throw new Error("Invalid BitSet size");
        }
        const newUint32Size = Math.ceil(newSize/32);
        const newData: Uint32Array = new Uint32Array(newUint32Size)
        newData.set(this.#data.subarray(0, newUint32Size));
        this.#data = newData;
        this.#size = newSize;

        //bits outside of the size in the last Uint32
        if (newSize % 32 !== 0 && newUint32Size > 0) {
            const mask = (1 << (newSize % 32)) - 1;
            newData[newUint32Size - 1] &= mask;
        }
    }

    get size(): number {
        return this.#size;
    }

    has(index: number): boolean {
        this.validateIndex(index);

        const arrayIndex = index >>> 5;
        const bitIndex = index & 31;

        return (this.#data[arrayIndex] & (1 << bitIndex)) !== 0;
    }

    add(index: number): boolean {
        this.validateIndex(index);

        const arrayIndex = index >>> 5;
        const bitIndex = index & 31;

        const mask = 1 << bitIndex;

        if ((this.#data[arrayIndex] & mask) !== 0) {
            return false;
        }

        this.#data[arrayIndex] |= mask;
        return true;
    }

    delete(index: number): boolean {
        this.validateIndex(index);

        const arrayIndex = index >>> 5;
        const bitIndex = index & 31;

        const mask = 1 << bitIndex;

        if ((this.#data[arrayIndex] & mask) === 0) {
            return false;
        }

        this.#data[arrayIndex] &= ~mask;
        return true;
    }

    clear(): void {
        this.#data.fill(0);
    }

    copy(): BitSet {
        const out = new BitSet(this.#size);
        out.#data.set(this.#data);
        return out;
    }

    private validateIndex(index: number): void {
        if (!Number.isInteger(index) || index < 0 || index >= this.#size) {
            throw new RangeError(`BitSet index out of range: ${index}`);
        }
    }
}
