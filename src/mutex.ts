export class Mutex {
    private _lock: Promise<void>;
    constructor() {
        this._lock = Promise.resolve();
    }

    async getLock() {
        let unlock: () => void;
        await this._lock;
        await new Promise<void>( set_resolve => {
            this._lock = new Promise<void>(resolve => {
                unlock = resolve;
                set_resolve();
            });
        })
        return unlock!;
    }
}