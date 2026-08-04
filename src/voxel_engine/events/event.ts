
type Listener<T> = ((data: T) => void)

export class VoxelEngineEvent<T> {
    
    private listeners: Listener<T>[] = [];

    //returns unsubscribe function
    subscribe(listener: Listener<T>): () => void {
        this.listeners.push(listener);

        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    emit(data: T): void {
        for (const listener of this.listeners) {
            listener(data);
        }
    }
}