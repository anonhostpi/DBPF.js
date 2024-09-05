import * as details from './details.json';

type IDBPFEntry = import("../../../DBPF").IDBPFEntry;
type TaggedEntry = import("../../../DBPF").TaggedEntry;

const data = details.tables[0];
const ids = Object.keys(data)
const TAG = details.tag;
const LABEL = details.label;
const DOC = `https://anonhostpi.github.io/DBPF.js/docs/other/spec/sections/ResourceTypes#${TAG}---${LABEL}`;

const MAGIC = {
    PNG: 0x89504E47,
    JPG: 0xFFD8,
}

async function _parse( entry: IDBPFEntry ): Promise<void> {

    const _entry: TaggedEntry = entry as TaggedEntry;
    let magic: number | undefined;
    switch( _entry.details.type.trim() ){
        case "png":
            magic = await entry.reader.getBytesBE(4) as number;
            if( magic !== MAGIC.PNG )
                console.warn( `DBPF Thumbnail Entry (0x${ _entry.instance.toString(16) }) with non-compliant file type. Magic number:`, magic.toString(16), "Expected:", MAGIC.PNG.toString(16), `\n\nsee: ${DOC}` );
            break;
        case "jpg":
            magic = await entry.reader.getBytesBE(2) as number;
            if( magic !== MAGIC.JPG )
                console.warn( `DBPF Thumbnail Entry (0x${ _entry.instance.toString(16) }) with non-compliant file type. Magic number:`, magic.toString(16), "Expected:", MAGIC.JPG.toString(16), `\n\nsee: ${DOC}` );
            break;
        case "":
        case undefined:
            console.warn( `DBPF Thumbnail Entry (0x${ _entry.instance.toString(16) }) with no type.`, `\n\nsee: ${DOC}` );
            magic = MAGIC.PNG;
            break;
        default:
            console.warn( `DBPF Thumbnail Entry (0x${ _entry.instance.toString(16) }) with unrecognized type:`, _entry.details.type, `\n\nsee: ${DOC}` );
    }
    const isPNG = magic === MAGIC.PNG
    const isJPG = magic?.toString(16).slice(0,4).padStart(4, "0") === MAGIC.JPG.toString(16);
    
    if( !isPNG && !isJPG ){
        console.warn( `DBPF Thumbnail Entry (0x${ _entry.instance.toString(16) }) file type not recognized. Entry will not be parsed.`, `\n\nsee: ${DOC}` );
        return;
    }

    const mimetype = isPNG ? "image/png" : "image/jpeg";
    _entry.mimetype = mimetype;
}

export async function parse( entry: IDBPFEntry, detailed?: boolean ): Promise<IDBPFEntry> {
    const hex = "0x" + entry.type.toString(16).toUpperCase().padStart(8, "0");
    if( ids.includes( hex ) ){
        // tag the entry
        (entry as TaggedEntry).tag = TAG;
        // add metadata
        if( detailed )
            (entry as TaggedEntry).details = data[hex as keyof typeof data];
        (entry as TaggedEntry).details = {
            type: data[hex as keyof typeof data].type,
        }
        // begin parsing
        await _parse( entry );
    }
    return (entry as TaggedEntry);
}