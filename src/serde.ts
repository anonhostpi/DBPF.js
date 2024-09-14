/**
 * Serde
 * 
 * A TypeScript library for serializing and deserializing JSON files in a Rust-like manner.
 */

import {
    Polyfills,
    EngineDetails
} from './boilerplate';

const cwd = (globalThis as any).process?.cwd || (() => "");
import {
    isAbsolute as isAbsolutePath,
    resolve as resolvePath,
} from 'path';

import {
    existsSync as fs_exists,
    writeFileSync as fs_write,
} from 'fs';

/**
 * A primitive JSON type.
 * 
 * @remarks
 * Note that ECMAScript's JSON does not support `bigint` serialization.
 */
export type JSONPrimitive = string | number | boolean | undefined | null;

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

    if( EngineDetails.supports.require ){
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
        throw new Polyfills.AggregateError(
            [error],
            `${constructor_name}-Deserializer: Error sanitizing path: ${cleaned}`
        );
    }
}

/**
 * A class for deserializing JSON files.
 * 
 * Based on how deserialization is implemented in the Rust programming language.
 */
export class Deserialized {
    /**
     * @param filepath - The file path of the JSON file.
     */
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

    /**
     * The file path of the JSON file.
     * @private
     */
    private filepath: string;
    /**
     * The name of the class (for logging purposes).
     * @private
     */
    private readonly log_name: string;

    /**
     * The path to the underlying JSON file, if provided.
     */
    get json(): string | undefined {
        return this.filepath   
    }

    /**
     * Load the JSON file.
     * 
     * @param new_path - The new file path to load, if different from the current file path.
     * @returns {Boolean} Whether the file was successfully loaded.
     */
    load( new_path?: string ): boolean {
        new_path = sanitize_path( new_path, false, this.log_name );

        if( new_path.length )
            this.filepath = new_path;

        if( !this.filepath.length ){
            console.warn(`${this.log_name}-Deserializer: No file path provided`);
            return false;
        }

        try {
            const deserialized: any = require( this.filepath );
            Deserialized.from.call( this, deserialized );
            return true;
        } catch( err ){
            console.warn(`${this.log_name}-Deserializer: Error loading file: ${this.filepath}`, err );
            return false;
        }
    }

    /**
     * Save the JSON file.
     * 
     * @param new_path - The new file path to save, if different from the current file path.
     * @returns {Boolean} Whether the file was successfully saved.
     */
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

    /**
     * Transform an object into a Deserialized instance.
     * 
     * Commonly used by child classes to ensure that the object conforms to the class structure.
     * 
     * @param {any} [this] The instance of the class to transform the object onto, if bound.
     * @param obj The object to transform.
     * @param strict Whether to strictly enforce the class structure by key.
     * @param typesafe Whether to strictly also enforce the class structure by type. Does nothing if `strict` is `false`.
     * @returns {Deserialized} The transformed object.
     */
    static from:(...args: any[]) => any = function(
        this: any,
        obj: any,
        strict: boolean = true,
        typesafe: boolean = true
    ): Deserialized {
        const self: any = this instanceof Deserialized ? this : new Deserialized();
        obj = JSON.parse( JSON.stringify( obj ) );

        const keys = Object.keys( self );

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

    /**
     * A static method to create a new Deserialized instance from a path
     * 
     * @param filepath The file path of the JSON file.
     * @returns {Deserialized} The Deserialized instance.
     */
    static read( filepath?: string ): Deserialized | void {
        filepath = sanitize_path( filepath );
        if( !filepath.length ){
            throw `JSON-Deserializer: No file path provided`
        }
        
        return new Deserialized( filepath );
    }
}