import { polyfill, AggregateError } from './polyfill'; // see polyfill.ts for usage

const {
    // path
    isAbsolute: isAbsolutePath,
    resolve: resolvePath,
    // fs
    existsSync: fs_exists,
    writeFileSync: fs_write,
    // process
    cwd
} = polyfill(
    {
        isAbsolute: (path: string) => /^[a-zA-Z]:[\\/]/.test(path),
        resolve: (...paths: string[]) => paths.join("/"),
        existsSync: () => true, 
        writeFileSync: () => {}, // no-op
    },
    "path",
    "fs",
    globalThis.process as any || {}
)

export type JSONPrimitive = string | number | boolean | undefined | null; // bigint is not supported by ECMAScript's JSON

function validateEnumerableTemplate<T>(obj: any, typeTemplate: T): boolean {
    for (const key in typeTemplate) {
        if (typeof typeTemplate[key] === 'object' && typeTemplate[key] !== null) {
            if (!validateEnumerableTemplate(obj[key], typeTemplate[key])) {
                return false;
            }
        } else if (typeof obj[key] !== typeof typeTemplate[key]) {
            return false;
        }
    }
    return true;
}

function sanitize_path(
    unclean_path: string = "",
    exists: boolean = false,
    constructor_name: string = "JSON"
){
    if( constructor_name === "Deserialized" )
        constructor_name = "JSON";

    let cleaned = unclean_path.trim();
    if( !cleaned.length )
        return "";

    if( !polyfill.check() ){
        console.warn("Node.js functionality is not available");
        return cleaned;
    }

    try {
        cleaned = isAbsolutePath( cleaned ) ? cleaned : resolvePath( cwd(), cleaned );

        if( !cleaned.endsWith('.json') ){
            throw `${constructor_name}-Deserializer: Invalid file extension: ${cleaned}`;
        }

        if( exists && !fs_exists( cleaned ) ){
            throw `${constructor_name}-Deserializer: File not found: ${cleaned}`;
        }

        return cleaned;
    } catch( error ) {
        throw new AggregateError(
            [error],
            `${constructor_name}-Deserializer: Error sanitizing path: ${cleaned}`
        );
    }
}

export class Deserialized {
    private filepath: string;
    private readonly log_name: string;

    constructor( filepath?: string ){
        this.log_name = this.constructor.name === "Deserialized" ? "JSON" : this.constructor.name;
        this.filepath = sanitize_path( filepath, false, this.log_name );

        if( !new.target ){
            if( !(this instanceof Deserialized) )
                return new Deserialized( filepath );
        }

        if( this.filepath.length )
            this.load();
    }

    get json(): string | undefined {
        return this.filepath   
    }

    load( new_path?: string ): boolean {
        new_path = sanitize_path( new_path, false, this.log_name );

        if( new_path.length )
            this.filepath = new_path;

        if( !this.filepath.length ){
            console.warn(`${this.log_name}-Deserializer: No file path provided`);
            return false;
        }

        try {
            const deserialized: any = polyfill.require( this.filepath );
            Deserialized.from.call( this, deserialized );
            return true;
        } catch( err ){
            console.warn(`${this.log_name}-Deserializer: Error loading file: ${this.filepath}`, err );
            return false;
        }
    }

    save( new_path?: string ): boolean {
        new_path = sanitize_path( new_path, false, this.log_name );

        if( new_path.length )
            this.filepath = new_path;

        if( !this.filepath.length ){
            console.log(`${this.log_name}-Deserializer: No file path provided`);
            return false;
        }

        try {
            fs_write( this.filepath, JSON.stringify( this ), 'utf8' );
            return true;
        } catch( err ){
            console.warn(`${this.log_name}-Deserializer: Error saving file: ${this.filepath}`, err );
            return false;
        }
    }

    // workaround to allow flexible overrides in subclasses
    static from:(...args: any[]) => any = function(
        this: any,
        obj: any,
        strict: boolean = true,
        typesafe: boolean = true
    ): Deserialized {
        const self: any = this instanceof Deserialized ? this : new Deserialized();
        obj = JSON.parse( JSON.stringify( obj ) );

        const keys = Object.keys( obj );

        for( const key in obj ){
            if( typeof self[key] !== "function" ){
                if( strict && keys.includes( key ) ){
                    if( typesafe ){
                        if( typeof self[key] === typeof obj[key] ){
                            if( typeof self[key] === "object" ){
                                if( validateEnumerableTemplate( obj[key], self[key] ) ){
                                    self[key] = obj[key];
                                }
                            } else {
                                self[key] = obj[key];
                            }
                        }
                    } else {
                        self[key] = obj[key];
                    }
                } else if( !strict ){
                    self[key] = obj[key];
                }
            }
        }

        return self;
    }

    static read( filepath?: string ): Deserialized | void {
        filepath = sanitize_path( filepath );
        if( !filepath.length ){
            throw `JSON-Deserializer: No file path provided`
        }
        
        return new Deserialized( filepath );
    }
}