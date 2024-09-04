import * as details from './details.json';

type IDBPFEntry = import("../../../DBPF").IDBPFEntry;
type TaggedEntry = import("../../../DBPF").TaggedEntry;

const data = details.tables[0];
const ids = Object.keys(data)
const TAG = details.tag;

export function parse( entry: IDBPFEntry, detailed?: boolean ): IDBPFEntry {
    const hex = "0x" + entry.type.toString(16).toUpperCase().padStart(8, "0");
    if( ids.includes( hex ) ){
        (entry as TaggedEntry).tag = TAG;
        if( detailed )
            (entry as TaggedEntry).details = data[hex as keyof typeof data];
        (entry as TaggedEntry).details = {
            type: data[hex as keyof typeof data].type,
        }
    }
    return (entry as TaggedEntry);
}