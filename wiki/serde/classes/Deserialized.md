[**DBPF.js v1.0.4**](../../README.md) • **Docs**

***

[DBPF.js v1.0.4](../../README.md) / [serde](../README.md) / Deserialized

# Class: Deserialized

A class for deserializing JSON files.

Based on how deserialization is implemented in the Rust programming language.

## Constructors

### new Deserialized()

> **new Deserialized**(`filepath`?): [`Deserialized`](Deserialized.md)

#### Parameters

• **filepath?**: `string`

The file path of the JSON file.

#### Returns

[`Deserialized`](Deserialized.md)

#### Defined in

[src/serde.ts:108](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/serde.ts#L108)

## Properties

### filepath

> `private` **filepath**: `string`

The file path of the JSON file.

#### Defined in

[src/serde.ts:125](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/serde.ts#L125)

***

### log\_name

> `private` `readonly` **log\_name**: `string`

The name of the class (for logging purposes).

#### Defined in

[src/serde.ts:130](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/serde.ts#L130)

***

### from()

> `static` **from**: (...`args`) => `any`

Transform an object into a Deserialized instance.

Commonly used by child classes to ensure that the object conforms to the class structure.

#### Parameters

• ...**args**: `any`[]

#### Returns

`any`

The transformed object.

#### Defined in

[src/serde.ts:203](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/serde.ts#L203)

## Accessors

### json

> `get` **json**(): `undefined` \| `string`

The path to the underlying JSON file, if provided.

#### Returns

`undefined` \| `string`

#### Defined in

[src/serde.ts:135](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/serde.ts#L135)

## Methods

### load()

> **load**(`new_path`?): `boolean`

Load the JSON file.

#### Parameters

• **new\_path?**: `string`

The new file path to load, if different from the current file path.

#### Returns

`boolean`

Whether the file was successfully loaded.

#### Defined in

[src/serde.ts:145](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/serde.ts#L145)

***

### save()

> **save**(`new_path`?): `boolean`

Save the JSON file.

#### Parameters

• **new\_path?**: `string`

The new file path to save, if different from the current file path.

#### Returns

`boolean`

Whether the file was successfully saved.

#### Defined in

[src/serde.ts:172](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/serde.ts#L172)

***

### read()

> `static` **read**(`filepath`?): `void` \| [`Deserialized`](Deserialized.md)

A static method to create a new Deserialized instance from a path

#### Parameters

• **filepath?**: `string`

The file path of the JSON file.

#### Returns

`void` \| [`Deserialized`](Deserialized.md)

The Deserialized instance.

#### Defined in

[src/serde.ts:245](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/serde.ts#L245)
