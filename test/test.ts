import { polyfill } from "../src/polyfill";
(globalThis as any).polyfill = polyfill;
import {
    DBPF,
    load,
    DBPFEntry,
    DBPFExpandedEntry
} from "../src/dbpf"

const input = document.getElementById('input');
const files: File[] = (globalThis as any).files = [];
const dbpfs: DBPF[] = (globalThis as any).dbpfs = [];
const entries: DBPFEntry[] = (globalThis as any).entries = [];

const output = document.getElementById('output') as HTMLElement;
const templates = {
    "file": document.getElementById('file-template'),
    "contents": document.getElementById('contents-template')
}

input?.addEventListener("change", function( event ) {

    while (output.firstChild) {
        output.removeChild(output.firstChild);
    }

    if( (event.target as any).files.length ) {
        const these_files = (event.target as any).files as File[];
        files.push( ...these_files );

        for( let file of these_files ){
            const dbpf = new DBPF( file );
            dbpfs.push( dbpf );

            const dbpfElement = templates.file?.cloneNode(true) as HTMLElement;
            dbpfElement.removeAttribute("id");
            dbpfElement.removeAttribute("style");

            const dbpfChildren: Record<string,HTMLElement> = {};
            ([
                "filename",
                "filepath",
                "fileext",
                "magic",
                "dbpf-major",
                "dbpf-minor",
                "dbpf-created",
                "dbpf-modified",
                "index-major",
                "index-minor",
                "index-count",
                "index-size",
                "index-offset",
                "index-first",
                "hole-count",
                "hole-size",
                "hole-offset",
                "dbpf-contents"
            ] as string[]).forEach(
                (className: string) => dbpfChildren[className] = dbpfElement.querySelector(`.${className}`) as HTMLElement
            );

            dbpfChildren["filename"].textContent = dbpf.filename;
            dbpfChildren["filepath"].textContent = dbpf.filepath;
            dbpfChildren["fileext"].textContent = dbpf.extension;
            dbpfChildren["magic"].textContent = `0x${dbpf.magic.toString(16)} (=${dbpf.magic})`;

            output?.appendChild( dbpfElement );

            (dbpf.init() as Promise<DBPF>).then(( initialized: DBPF ) => {

                dbpfChildren["dbpf-major"].textContent = dbpf.header.dbpf.major.toString();
                dbpfChildren["dbpf-minor"].textContent = dbpf.header.dbpf.minor.toString();
                dbpfChildren["dbpf-created"].textContent = `${dbpf.header.dbpf.created} (${new Date(dbpf.header.dbpf.created).toLocaleString()})`;
                dbpfChildren["dbpf-modified"].textContent = `${dbpf.header.dbpf.modified} (${new Date(dbpf.header.dbpf.modified).toLocaleString()})`;
    
                dbpfChildren["index-major"].textContent = dbpf.header.index.major.toString();
                dbpfChildren["index-minor"].textContent = dbpf.header.index.minor.toString();
                dbpfChildren["index-count"].textContent = dbpf.header.index.count.toString();
                dbpfChildren["index-size"].textContent = dbpf.header.index.size.toString();
                dbpfChildren["index-offset"].textContent = dbpf.header.index.offset.toString();
                dbpfChildren["index-first"].textContent = dbpf.header.index.first.toString();
    
                dbpfChildren["hole-count"].textContent = dbpf.header.hole.count.toString();
                dbpfChildren["hole-size"].textContent = dbpf.header.hole.size.toString();
                dbpfChildren["hole-offset"].textContent = dbpf.header.hole.offset.toString();

                let removedLoading = false;

                initialized.table.init().then(()=>{
                    const indeces = Object.keys( initialized.table );
                    console.log( indeces.length, "entries found" );
                    for( let index of indeces ){
                        const entry = initialized.table[Number(index)];
                        entries.push( entry );

                        const entryElement = templates.contents?.cloneNode(true) as HTMLElement;
                        entryElement.removeAttribute("id");
                        entryElement.removeAttribute("style");

                        const entryChildren: Record<string,HTMLElement> = {};
                        ([
                            "resource-index",
                            "resource-group",
                            "resource-type",
                            "resource-instance",
                            "resource-offset",
                            "resource-size-compressed",
                            "resource-size-memory",
                            "resource-size-file",
                        ] as string[]).forEach(
                            (className: string) => entryChildren[className] = entryElement.querySelector(`.${className}`) as HTMLElement
                        );
                        
                        entryChildren["resource-index"].textContent = index;
                        entryChildren["resource-group"].textContent = `0x${entry.group.toString(16)} (=${entry.group})`;
                        entryChildren["resource-type"].textContent = `0x${entry.type.toString(16)} (=${entry.type})`;
                        entryChildren["resource-instance"].textContent = `0x${entry.instance.toString(16)} (=${entry.instance})`;
                        entryChildren["resource-offset"].textContent = entry.offset.toString();
                        entryChildren["resource-size-compressed"].textContent = entry.size.compressed.toString();
                        entryChildren["resource-size-memory"].textContent = entry.size.memory.toString();
                        entryChildren["resource-size-file"].textContent = entry.size.file.toString();

                        if( !removedLoading ){
                            dbpfChildren["dbpf-contents"].innerText = '';
                            removedLoading = true;
                        }
                        dbpfChildren["dbpf-contents"]?.appendChild( entryElement );
                    }
                })
            })
        }
    }
    console.log( (event.target as any).files.length, "files added. Total:", files.length );
    (input as any).value = '';
});