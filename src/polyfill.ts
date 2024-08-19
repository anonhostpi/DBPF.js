// Usage is described at the bottom of this file.
import './imports';

const {
    assign,
    defineProperty,
    freeze,
    getOwnPropertyNames
} = Object;

const {
    hasOwnProperty
} = Object.prototype;

export function deepFreeze(object: any): any {
    // Retrieve the property names defined on object
    const propNames = getOwnPropertyNames(object);

    // Freeze properties before freezing the object itself
    for (const name of propNames) {
        const value = object[name];

        // If value is an object, recursively freeze it
        if (value && typeof value === "object") {
            deepFreeze(value);
        }
    }

    // Freeze the object itself
    return freeze(object);
}

const hasRequire = typeof (globalThis.require || (typeof window !== "undefined" && window.require) || require) === 'function';
const isNode = !!(typeof process !== "undefined" && process.versions && process.release);

interface SafeRequire {
    (module: string): any;
    original?: any;
}

const safe_require: SafeRequire = hasRequire && typeof window === "undefined" ? (globalThis.require || require) : (() => {
    const cache: Record<string, any> = {};
    const acceptable_js_responses: (string | null)[] = [
        // Javascript
        'application/x-javascript',
        'application/javascript',
        'text/javascript',
        'text/ecmascript',
        'application/ecmascript',
    ]
    const acceptable_json_responses: (string | null)[] = [
        // JSON
        'application/json',
        'text/json',
        'application/x-json',
        'text/x-json',
    ];
    return ((module: string) => {
        if( typeof safe_require.original !== "undefined" ){
            try {
                const out = safe_require.original( module );
                if( out ) return out;
            } catch ( err ) {
                console.warn( err );
            }
        }

        if( !hasOwnProperty.call( cache, module ) ){
            const xhr = new XMLHttpRequest();
            xhr.open('get', module, false);
            try {    
                xhr.send();
                if (xhr.status === 200) {
                    if( acceptable_js_responses.includes(xhr.getResponseHeader('Content-Type')) ){
                        const fnBody = 'var module = {}; var exports = module.exports = {};\n' + xhr.responseText + '\nreturn exports;';
                        cache[module] = (new Function(fnBody)).call({});
                    } else if( acceptable_json_responses.includes(xhr.getResponseHeader('Content-Type')) ){
                        cache[module] = JSON.parse(xhr.responseText);
                    }
                }
            } catch ( error ) {
                console.warn( error );
            }
        }
        return cache[module];
    })
})();

if( hasRequire && typeof window !== "undefined" ){
    safe_require.original = (globalThis.require || window.require || require)
}

interface PolyfillUtility {
    (...modules: (string | Record<any, any>)[]): Record<any, any>;
    check: () => boolean;
    require: (module: string) => any;
    isNode?: boolean;
}

export const polyfill: PolyfillUtility = (
    ...modules: (string | Record<any, any>)[]
) => {
    modules = modules.map((mod: any) => {

        switch( typeof mod ){
            case 'string':
                return safe_require(mod) || {};
            default:
                return mod;
        }

    });

    return assign({}, ...modules);
}

polyfill.check = () => hasRequire;
polyfill.require = safe_require;
defineProperty(
    polyfill,
    'isNode',
    {
        writable: false,
        configurable: false,

        value: isNode
    });

// Base Polyfills:

const {
    AggregateError
} = polyfill(
    {
        AggregateError: class AggregateError extends Error {
            errors: any[];
            constructor(errors: any[], message?: string, options?: { cause?: Error | string }) {
                super(message);
                this.errors = errors;
            }
            override name = 'AggregateError';
        }
    },
    (globalThis as any)
)
export { AggregateError };
/*
# Usage:

## `polyfill( ...args )`

`polyfill( ...args )` is a wrapper around `Object.assign({}, ...args)` that parses any string arguments as modules using `require()`.

NOTE: Just like `Object.assign()`, later arguments will overwrite earlier ones.

### Examples:

```typescript
// merge two objects into a new one, like Object.assign()
const merged = polyfill( { a: 1, overwritten: 3 }, { b: 2, overwritten: 4 } );
// - out: { a: 1, b: 2, overwritten: 4 }

// merge two modules into a new one
const fs_path_merged = polyfill('fs', 'path');
// - out: provides an fs-like module populated/overwritten with path's exports

// provide browser polyfills and overwrite them with Node.js APIs, if those APIs are available:
const path = polyfill( 'path-browserify', 'path' );

// provide your own polyfills
const { isAbsolute } = polyfill(
    {
        isAbsolute: (path: string) => /^[a-zA-Z]:[\\/]/.test(path)
    },
    "path"
)
```

## `polyfill.check()`

`polyfill.check()` returns a boolean indicating whether `require()` is available.

## `polyfill.require( module: string )`

`polyfill.require( module: string )` is a safety wrapper around `require( module )` that logs a warning (and returns undefined) if `require()` is not available.
*/