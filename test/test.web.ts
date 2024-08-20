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
                "filesize",
                "magic",
                "dbpf-major",
                "dbpf-minor",
                "dbpf-usermajor",
                "dbpf-userminor",
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
            dbpfChildren["filesize"].textContent = `${ dbpf.filesize } bytes`;
            dbpfChildren["fileext"].textContent = dbpf.extension;
            const magic = dbpf.magic;
            const magicText = `0x${
                magic.toString(16).padStart(8,"0").toUpperCase()
            } (=${ magic })`;
            dbpfChildren["magic"].textContent = magicText;

            output?.appendChild( dbpfElement );

            (dbpf.init() as Promise<DBPF>).then(( initialized: DBPF ) => {

                const dbpfMajor = initialized.header.dbpf.major;
                const dbpfMajorText = `0x${
                    dbpfMajor.toString(16).padStart(8,"0").toUpperCase()
                } (=${ dbpfMajor })`;
                const dbpfMinor = initialized.header.dbpf.minor;
                const dbpfMinorText = `0x${
                    dbpfMinor.toString(16).padStart(8,"0").toUpperCase()
                } (=${ dbpfMinor })`;
                const dbpfUserMajor = initialized.header.dbpf.usermajor
                const dbpfUserMajorText = `0x${
                    dbpfUserMajor.toString(16).padStart(8,"0").toUpperCase()
                } (=${ dbpfUserMajor })`;
                const dbpfUserMinor = initialized.header.dbpf.userminor;
                const dbpfUserMinorText = `0x${
                    dbpfUserMinor.toString(16).padStart(8,"0").toUpperCase()
                } (=${ dbpfUserMinor })`;
                const dbpfCreated = initialized.header.dbpf.created;
                const dbpfCreatedText = `0x${
                    dbpfCreated.toString(16).padStart(8,"0").toUpperCase()
                } (=${ dbpfCreated }) (${ new Date( dbpfCreated ).toLocaleString() })`;
                const dbpfModified = initialized.header.dbpf.modified;
                const dbpfModifiedText = `0x${
                    dbpfModified.toString(16).padStart(8,"0").toUpperCase()
                } (=${ dbpfModified }) (${ new Date( dbpfModified ).toLocaleString() })`;
                
                dbpfChildren["dbpf-major"].textContent = dbpfMajorText;
                if( dbpfMajor === 0 ){
                    dbpfChildren["dbpf-major"].style.color = "grey";
                    dbpfChildren["dbpf-major"].style.fontStyle = "italic";
                } else {
                    dbpfChildren["dbpf-major"].style.fontWeight = "bold";
                }
                dbpfChildren["dbpf-minor"].textContent = dbpfMinorText;
                if( dbpfMinor === 0 ){
                    dbpfChildren["dbpf-minor"].style.color = "grey";
                    dbpfChildren["dbpf-minor"].style.fontStyle = "italic";
                } else {
                    dbpfChildren["dbpf-minor"].style.fontWeight = "bold";
                }
                dbpfChildren["dbpf-usermajor"].textContent = dbpfUserMajorText;
                if( dbpfUserMajor === 0 ){
                    dbpfChildren["dbpf-usermajor"].style.color = "grey";
                    dbpfChildren["dbpf-usermajor"].style.fontStyle = "italic";
                } else {
                    dbpfChildren["dbpf-usermajor"].style.fontWeight = "bold";
                }
                dbpfChildren["dbpf-userminor"].textContent = dbpfUserMinorText;
                if( dbpfUserMinor === 0 ){
                    dbpfChildren["dbpf-userminor"].style.color = "grey";
                    dbpfChildren["dbpf-userminor"].style.fontStyle = "italic";
                } else {
                    dbpfChildren["dbpf-userminor"].style.fontWeight = "bold";
                }
                dbpfChildren["dbpf-created"].textContent = dbpfCreatedText;
                if( dbpfCreated === 0 ){
                    dbpfChildren["dbpf-created"].style.color = "grey";
                    dbpfChildren["dbpf-created"].style.fontStyle = "italic";
                } else {
                    dbpfChildren["dbpf-created"].style.fontWeight = "bold";
                }
                dbpfChildren["dbpf-modified"].textContent = dbpfModifiedText;
                if( dbpfModified === 0 ){
                    dbpfChildren["dbpf-modified"].style.color = "grey";
                    dbpfChildren["dbpf-modified"].style.fontStyle = "italic";
                } else {
                    dbpfChildren["dbpf-modified"].style.fontWeight = "bold";
                }

                const indexMajor = initialized.header.index.major;
                const indexMajorText = `0x${
                    indexMajor.toString(16).padStart(8,"0").toUpperCase()
                } (=${ indexMajor })`;
                const indexMinor = initialized.header.index.minor;
                const indexMinorText = `0x${
                    indexMinor.toString(16).padStart(8,"0").toUpperCase()
                } (=${ indexMinor })`;
                const indexCount = initialized.header.index.count;
                const indexCountText = `0x${
                    indexCount.toString(16).padStart(8,"0").toUpperCase()
                } (=${ indexCount })`;
                const indexSize = initialized.header.index.size;
                const indexSizeText = `0x${
                    indexSize.toString(16).padStart(8,"0").toUpperCase()
                } (=${ indexSize })`;
                const indexOffset = initialized.header.index.offset;
                const indexOffsetText = `0x${
                    indexOffset.toString(16).padStart(8,"0").toUpperCase()
                } (=${ indexOffset })`;
                const indexFirst = initialized.header.index.first;
                const indexFirstText = `0x${
                    indexFirst.toString(16).padStart(8,"0").toUpperCase()
                } (=${ indexFirst })`;
    
                dbpfChildren["index-major"].textContent = indexMajorText;
                if( indexMajor === 0 ){
                    dbpfChildren["index-major"].style.color = "grey";
                    dbpfChildren["index-major"].style.fontStyle = "italic";
                } else {
                    dbpfChildren["index-major"].style.fontWeight = "bold";
                }
                dbpfChildren["index-minor"].textContent = indexMinorText;
                if( indexMinor === 0 ){
                    dbpfChildren["index-minor"].style.color = "grey";
                    dbpfChildren["index-minor"].style.fontStyle = "italic";
                } else {
                    dbpfChildren["index-minor"].style.fontWeight = "bold";
                }
                dbpfChildren["index-count"].textContent = indexCountText;
                if( indexCount === 0 ){
                    dbpfChildren["index-count"].style.color = "grey";
                    dbpfChildren["index-count"].style.fontStyle = "italic";
                } else {
                    dbpfChildren["index-count"].style.fontWeight = "bold";
                }
                dbpfChildren["index-size"].textContent = indexSizeText;
                if( indexSize === 0 ){
                    dbpfChildren["index-size"].style.color = "grey";
                    dbpfChildren["index-size"].style.fontStyle = "italic";
                } else {
                    dbpfChildren["index-size"].style.fontWeight = "bold";
                }
                dbpfChildren["index-offset"].textContent = indexOffsetText;
                if( indexOffset === 0 ){
                    dbpfChildren["index-offset"].style.color = "grey";
                    dbpfChildren["index-offset"].style.fontStyle = "italic";
                } else {
                    dbpfChildren["index-offset"].style.fontWeight = "bold";
                }
                dbpfChildren["index-first"].textContent = indexFirstText;
                if( indexFirst === 0 ){
                    dbpfChildren["index-first"].style.color = "grey";
                    dbpfChildren["index-first"].style.fontStyle = "italic";
                } else {
                    dbpfChildren["index-first"].style.fontWeight = "bold";
                }
    
                const holeCount = initialized.header.hole.count;
                const holeCountText = `0x${
                    holeCount.toString(16).padStart(8,"0").toUpperCase()
                } (=${ holeCount })`;
                const holeSize = initialized.header.hole.size;
                const holeSizeText = `0x${
                    holeSize.toString(16).padStart(8,"0").toUpperCase()
                } (=${ holeSize })`;
                const holeOffset = initialized.header.hole.offset;
                const holeOffsetText = `0x${
                    holeOffset.toString(16).padStart(8,"0").toUpperCase()
                } (=${ holeOffset })`;

                dbpfChildren["hole-count"].textContent = holeCountText;
                if( holeCount === 0 ){
                    dbpfChildren["hole-count"].style.color = "grey";
                    dbpfChildren["hole-count"].style.fontStyle = "italic";
                } else {
                    dbpfChildren["hole-count"].style.fontWeight = "bold";
                }
                dbpfChildren["hole-size"].textContent = holeSizeText;
                if( holeSize === 0 ){
                    dbpfChildren["hole-size"].style.color = "grey";
                    dbpfChildren["hole-size"].style.fontStyle = "italic";
                } else {
                    dbpfChildren["hole-size"].style.fontWeight = "bold";
                }
                dbpfChildren["hole-offset"].textContent = holeOffsetText;
                if( holeOffset === 0 ){
                    dbpfChildren["hole-offset"].style.color = "grey";
                    dbpfChildren["hole-offset"].style.fontStyle = "italic";
                } else {
                    dbpfChildren["hole-offset"].style.fontWeight = "bold";
                }

                let removedLoading = false;const indeces = Object.keys( initialized.table );
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

                    const group = entry.group;
                    const groupText = `0x${
                        group.toString(16).padStart(8,"0").toUpperCase()
                    } (=${ group })`;
                    const type = entry.type;
                    const typeText = `0x${
                        type.toString(16).padStart(8,"0").toUpperCase()
                    } (=${ type })`;
                    const instance = entry.instance;
                    const instanceText = `0x${
                        instance.toString(16).padStart(16,"0").toUpperCase()
                    } (=${ instance })`;
                    const offset = entry.offset;
                    const offsetText = `0x${
                        offset.toString(16).padStart(8,"0").toUpperCase()
                    } (=${ offset })`;
                    const sizeCompressed = entry.size.compressed;
                    const sizeCompressedText = `0x${
                        sizeCompressed.toString(16).padStart(8,"0").toUpperCase()
                    } (=${ sizeCompressed })`;
                    const sizeMemory = entry.size.memory;
                    const sizeMemoryText = `0x${
                        sizeMemory.toString(16).padStart(8,"0").toUpperCase()
                    } (=${ sizeMemory })`;
                    const sizeFile = entry.size.file;
                    const sizeFileText = `0x${
                        sizeFile.toString(16).padStart(8,"0").toUpperCase()
                    } (=${ sizeFile })`;

                    entryChildren["resource-group"].textContent = groupText;
                    if( group === 0 ){
                        entryChildren["resource-group"].style.color = "grey";
                        entryChildren["resource-group"].style.fontStyle = "italic";
                    } else {
                        entryChildren["resource-group"].style.fontWeight = "bold";
                    }
                    entryChildren["resource-type"].textContent = typeText;
                    if( type === 0 ){
                        entryChildren["resource-type"].style.color = "grey";
                        entryChildren["resource-type"].style.fontStyle = "italic";
                    } else {
                        entryChildren["resource-type"].style.fontWeight = "bold";
                    }
                    entryChildren["resource-instance"].textContent = instanceText;
                    if( instance === BigInt(0) ){
                        entryChildren["resource-instance"].style.color = "grey";
                        entryChildren["resource-instance"].style.fontStyle = "italic";
                    } else {
                        entryChildren["resource-instance"].style.fontWeight = "bold";
                    }
                    entryChildren["resource-offset"].textContent = offsetText;
                    if( offset === 0 ){
                        entryChildren["resource-offset"].style.color = "grey";
                        entryChildren["resource-offset"].style.fontStyle = "italic";
                    } else {
                        entryChildren["resource-offset"].style.fontWeight = "bold";
                    }
                    entryChildren["resource-size-compressed"].textContent = sizeCompressedText;
                    if( sizeCompressed === 0 ){
                        entryChildren["resource-size-compressed"].style.color = "grey";
                        entryChildren["resource-size-compressed"].style.fontStyle = "italic";
                    } else {
                        entryChildren["resource-size-compressed"].style.fontWeight = "bold";
                    }
                    entryChildren["resource-size-memory"].textContent = sizeMemoryText;
                    if( sizeMemory === 0 ){
                        entryChildren["resource-size-memory"].style.color = "grey";
                        entryChildren["resource-size-memory"].style.fontStyle = "italic";
                    } else {
                        entryChildren["resource-size-memory"].style.fontWeight = "bold";
                    }
                    entryChildren["resource-size-file"].textContent = sizeFileText;
                    if( sizeFile === 0 ){
                        entryChildren["resource-size-file"].style.color = "grey";
                        entryChildren["resource-size-file"].style.fontStyle = "italic";
                    } else {
                        entryChildren["resource-size-file"].style.fontWeight = "bold";
                    }

                    if( !removedLoading ){
                        dbpfChildren["dbpf-contents"].innerText = '';
                        removedLoading = true;
                    }
                    dbpfChildren["dbpf-contents"]?.appendChild( entryElement );
                }
            })
        }
    }
    console.log( (event.target as any).files.length, "files added. Total:", files.length );
    (input as any).value = '';
});