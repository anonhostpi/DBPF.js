[**DBPF.js v1.0.4**](../../README.md) • **Docs**

***

[DBPF.js v1.0.4](../../README.md) / [polyfill.events](../README.md) / EventedPromise

# Class: EventedPromise\<T\>

A Promise that emits events when resolved or rejected using a provided [EventEmitMethod](../type-aliases/EventEmitMethod.md) (EventEmitter.emit)

## Extends

- `Promise`\<`T`\>

## Type Parameters

• **T**

## Constructors

### new EventedPromise()

> **new EventedPromise**\<`T`\>(`executor`, `emit`): [`EventedPromise`](EventedPromise.md)\<`T`\>

#### Parameters

• **executor**

The executor function to be passed to the Promise constructor

• **emit**: [`EventEmitMethod`](../type-aliases/EventEmitMethod.md) \| `EmitterOptions` = `...`

An [EventEmitMethod](../type-aliases/EventEmitMethod.md) or an object with an emit method and events object or a set of options for emitting:
- emit: The method to emit events.

#### Returns

[`EventedPromise`](EventedPromise.md)\<`T`\>

#### See

[EventEmitMethod](../type-aliases/EventEmitMethod.md)
- events: An object with the keys `resolve` and `reject` that specify the event names to emit when resolving and rejecting.

#### Overrides

`Promise<T>.constructor`

#### Defined in

[src/polyfill.events.ts:83](https://github.com/anonhostpi/DBPF.js/blob/bec1c7f946ae1882f8cb333f8c038d29cc8e75d8/src/polyfill.events.ts#L83)

## Properties

### \[toStringTag\]

> `readonly` **\[toStringTag\]**: `string`

#### Inherited from

`Promise.[toStringTag]`

#### Defined in

node\_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:176

***

### \[species\]

> `readonly` `static` **\[species\]**: `PromiseConstructor`

#### Inherited from

`Promise.[species]`

#### Defined in

node\_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:180

## Methods

### catch()

> **catch**\<`TResult`\>(`onrejected`?): `Promise`\<`T` \| `TResult`\>

Attaches a callback for only the rejection of the Promise.

#### Type Parameters

• **TResult** = `never`

#### Parameters

• **onrejected?**: `null` \| (`reason`) => `TResult` \| `PromiseLike`\<`TResult`\>

The callback to execute when the Promise is rejected.

#### Returns

`Promise`\<`T` \| `TResult`\>

A Promise for the completion of the callback.

#### Inherited from

`Promise.catch`

#### Defined in

node\_modules/typescript/lib/lib.es5.d.ts:1557

***

### finally()

> **finally**(`onfinally`?): `Promise`\<`T`\>

Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
resolved value cannot be modified from the callback.

#### Parameters

• **onfinally?**: `null` \| () => `void`

The callback to execute when the Promise is settled (fulfilled or rejected).

#### Returns

`Promise`\<`T`\>

A Promise for the completion of the callback.

#### Inherited from

`Promise.finally`

#### Defined in

node\_modules/typescript/lib/lib.es2018.promise.d.ts:29

***

### then()

> **then**\<`TResult1`, `TResult2`\>(`onfulfilled`?, `onrejected`?): `Promise`\<`TResult1` \| `TResult2`\>

Attaches callbacks for the resolution and/or rejection of the Promise.

#### Type Parameters

• **TResult1** = `T`

• **TResult2** = `never`

#### Parameters

• **onfulfilled?**: `null` \| (`value`) => `TResult1` \| `PromiseLike`\<`TResult1`\>

The callback to execute when the Promise is resolved.

• **onrejected?**: `null` \| (`reason`) => `TResult2` \| `PromiseLike`\<`TResult2`\>

The callback to execute when the Promise is rejected.

#### Returns

`Promise`\<`TResult1` \| `TResult2`\>

A Promise for the completion of which ever callback is executed.

#### Inherited from

`Promise.then`

#### Defined in

node\_modules/typescript/lib/lib.es5.d.ts:1550

***

### all()

#### all(values)

> `static` **all**\<`T`\>(`values`): `Promise`\<`Awaited`\<`T`\>[]\>

Creates a Promise that is resolved with an array of results when all of the provided Promises
resolve, or rejected when any Promise is rejected.

##### Type Parameters

• **T**

##### Parameters

• **values**: `Iterable`\<`T` \| `PromiseLike`\<`T`\>\>

An iterable of Promises.

##### Returns

`Promise`\<`Awaited`\<`T`\>[]\>

A new Promise.

##### Inherited from

`Promise.all`

##### Defined in

node\_modules/typescript/lib/lib.es2015.iterable.d.ts:225

#### all(values)

> `static` **all**\<`T`\>(`values`): `Promise`\<\{ -readonly \[P in string \| number \| symbol\]: Awaited\<T\[P\<P\>\]\> \}\>

Creates a Promise that is resolved with an array of results when all of the provided Promises
resolve, or rejected when any Promise is rejected.

##### Type Parameters

• **T** *extends* [] \| readonly `unknown`[]

##### Parameters

• **values**: `T`

An array of Promises.

##### Returns

`Promise`\<\{ -readonly \[P in string \| number \| symbol\]: Awaited\<T\[P\<P\>\]\> \}\>

A new Promise.

##### Inherited from

`Promise.all`

##### Defined in

node\_modules/typescript/lib/lib.es2015.promise.d.ts:39

***

### allSettled()

#### allSettled(values)

> `static` **allSettled**\<`T`\>(`values`): `Promise`\<\{ -readonly \[P in string \| number \| symbol\]: PromiseSettledResult\<Awaited\<T\[P\<P\>\]\>\> \}\>

Creates a Promise that is resolved with an array of results when all
of the provided Promises resolve or reject.

##### Type Parameters

• **T** *extends* [] \| readonly `unknown`[]

##### Parameters

• **values**: `T`

An array of Promises.

##### Returns

`Promise`\<\{ -readonly \[P in string \| number \| symbol\]: PromiseSettledResult\<Awaited\<T\[P\<P\>\]\>\> \}\>

A new Promise.

##### Inherited from

`Promise.allSettled`

##### Defined in

node\_modules/typescript/lib/lib.es2020.promise.d.ts:38

#### allSettled(values)

> `static` **allSettled**\<`T`\>(`values`): `Promise`\<`PromiseSettledResult`\<`Awaited`\<`T`\>\>[]\>

Creates a Promise that is resolved with an array of results when all
of the provided Promises resolve or reject.

##### Type Parameters

• **T**

##### Parameters

• **values**: `Iterable`\<`T` \| `PromiseLike`\<`T`\>\>

An array of Promises.

##### Returns

`Promise`\<`PromiseSettledResult`\<`Awaited`\<`T`\>\>[]\>

A new Promise.

##### Inherited from

`Promise.allSettled`

##### Defined in

node\_modules/typescript/lib/lib.es2020.promise.d.ts:46

***

### race()

#### race(values)

> `static` **race**\<`T`\>(`values`): `Promise`\<`Awaited`\<`T`\>\>

Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
or rejected.

##### Type Parameters

• **T**

##### Parameters

• **values**: `Iterable`\<`T` \| `PromiseLike`\<`T`\>\>

An iterable of Promises.

##### Returns

`Promise`\<`Awaited`\<`T`\>\>

A new Promise.

##### Inherited from

`Promise.race`

##### Defined in

node\_modules/typescript/lib/lib.es2015.iterable.d.ts:233

#### race(values)

> `static` **race**\<`T`\>(`values`): `Promise`\<`Awaited`\<`T`\[`number`\]\>\>

Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
or rejected.

##### Type Parameters

• **T** *extends* [] \| readonly `unknown`[]

##### Parameters

• **values**: `T`

An array of Promises.

##### Returns

`Promise`\<`Awaited`\<`T`\[`number`\]\>\>

A new Promise.

##### Inherited from

`Promise.race`

##### Defined in

node\_modules/typescript/lib/lib.es2015.promise.d.ts:50

***

### reject()

> `static` **reject**\<`T`\>(`reason`?): `Promise`\<`T`\>

Creates a new rejected promise for the provided reason.

#### Type Parameters

• **T** = `never`

#### Parameters

• **reason?**: `any`

The reason the promise was rejected.

#### Returns

`Promise`\<`T`\>

A new rejected Promise.

#### Inherited from

`Promise.reject`

#### Defined in

node\_modules/typescript/lib/lib.es2015.promise.d.ts:60

***

### resolve()

#### resolve()

> `static` **resolve**(): `Promise`\<`void`\>

Creates a new resolved promise.

##### Returns

`Promise`\<`void`\>

A resolved promise.

##### Inherited from

`Promise.resolve`

##### Defined in

node\_modules/typescript/lib/lib.es2015.promise.d.ts:66

#### resolve(value)

> `static` **resolve**\<`T`\>(`value`): `Promise`\<`Awaited`\<`T`\>\>

Creates a new resolved promise for the provided value.

##### Type Parameters

• **T**

##### Parameters

• **value**: `T`

A promise.

##### Returns

`Promise`\<`Awaited`\<`T`\>\>

A promise whose internal state matches the provided promise.

##### Inherited from

`Promise.resolve`

##### Defined in

node\_modules/typescript/lib/lib.es2015.promise.d.ts:72

#### resolve(value)

> `static` **resolve**\<`T`\>(`value`): `Promise`\<`Awaited`\<`T`\>\>

Creates a new resolved promise for the provided value.

##### Type Parameters

• **T**

##### Parameters

• **value**: `T` \| `PromiseLike`\<`T`\>

A promise.

##### Returns

`Promise`\<`Awaited`\<`T`\>\>

A promise whose internal state matches the provided promise.

##### Inherited from

`Promise.resolve`

##### Defined in

node\_modules/typescript/lib/lib.es2015.promise.d.ts:78
