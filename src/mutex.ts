export class Mutex {
    private _lock: Promise<void>;
    private _isLocked: boolean = false;
    get isLocked() {
        return this._isLocked;
    }
    constructor() {
        this._lock = Promise.resolve();
    }

    async getLock() {
        let unlock: () => void;
        await this._lock;
        await new Promise<void>( set_resolve => {
            this._isLocked = true;
            this._lock = new Promise<void>(resolve => {
                unlock = () => {
                    resolve();
                    this._isLocked = false;
                }
                set_resolve();
            });
        })
        return unlock!;
    }
}