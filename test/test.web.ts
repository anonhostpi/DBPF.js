import {
    DBPF,
    DBPFEntry,
    IDBPFEntry,
} from "../src/DBPF"

import mime from "mime";

const toast = document.getElementById('toast') as HTMLElement;
function notify( message: string, link?: string){
    const clone = toast.cloneNode(true) as HTMLElement;
    clone.removeAttribute("id");
    // set the message
    clone.textContent = message;
    // set the link
    if( link ){
        const a = document.createElement("a");
        a.href = link;
        a.textContent = "Goto";
        
        clone.appendChild( a );
    }
    // add the clone to the document
    toast.parentElement?.appendChild( clone );
    // add the show class
    setTimeout(() => {
        clone.style.visibility = "visible";
        clone.classList.add("show");
    }, 100);
    // remove the show class after 3 seconds
    setTimeout(() => clone.classList.remove("show"), 2500);
    setTimeout(() => clone.remove(), 3100);
}

function blobToDebugHTML(blob: Blob, name: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        
        // Read the blob as an ArrayBuffer
        reader.readAsArrayBuffer(blob);
        
        reader.onload = function() {
            const arrayBuffer = reader.result;
            const byteArray = new Uint8Array(arrayBuffer as ArrayBuffer);
            
            const line_count = Math.ceil(byteArray.length / 16);

            const lines = new Array(line_count)

            // Convert each byte to a two-character hexadecimal string
            for (let i = 0; i < byteArray.length; i++) {
                const hexByte = byteArray[i].toString(16).padStart(2, '0').toUpperCase();
                
                const line_no = Math.floor(i / 16);
                if( !lines[line_no] )
                    lines[line_no] = [];
                lines[line_no].push( hexByte );
            }

            const line_nos = [ ...lines.keys() ];
            
            if( !lines[lines.length - 1].length ){
                lines.pop();
                line_nos.pop();
            }

            let parsed_body: any = lines.map((line: string[], l:number) => {
                // decode the byte to ASCII
                const decoded = line.map(( byte: string ) => {
                    const char = String.fromCharCode( parseInt( byte, 16 ) );
                    return char.match(/[ -~]/) ? char : ".";
                })
                const wrapped = decoded.map((char: string, i: number) => `<span id='D${l}-${i}'><span>${ char }</span></span>` );
                return `<span id='D${l}'><span>` + wrapped.join("") + "</span></span>"; 
            })
            parsed_body = parsed_body.join("<br>");
            parsed_body = `<pre>${ parsed_body }</pre>`;

            let parsed_header: any = line_nos.map( line_no => {
                return `<li id='L${line_no}'><span>0x` + line_no.toString(16).padStart(8, "0").toUpperCase() + "</span></li>";
            })
            parsed_header = `<ul>\n${ parsed_header.join("\n") }\n</ul>`;

            let parsed_bytes: any = lines.map((line: string[], l:number) => {
                const wrapped = line.map((byte:string, i:number) => `<span id='B${l}-${i}'><span>${ byte }</span></span>` );
                return `<span id='B${l}'><span>` + wrapped.join("") + "</span></span>"; 
            });
            parsed_bytes = `<pre>${ parsed_bytes.join("\n") }</pre>`;

            const html = `
                <html>
                    <head>
                        <title>${ name }</title>
                        <style>
                            body > *:not(script,h1) {
                                display: inline-block;
                                vertical-align: top;
                                font-size: 14px;
                                line-height: 20px;
                            }

                            body > *:not(script,h1) > * {
                                background: #000;
                                padding: 10px;
                                border-radius: 5px;
                                border: 2px solid #969696;
                            }

                            ul {
                                list-style: none;
                                margin-block: 0;
                                margin-inline: 0;
                                padding-inline: 0px;
                                width: 92px;
                                text-align: right;
                            }

                            pre {
                                margin: 0px 0px 0px 10px;
                            }

                            body {
                                font-family: monospace;
                                font-size: 0;
                                background: #110f1a;
                                color: white;
                            }

                            h1 {
                                margin-left: 127px;
                                font-size: 26px;
                            }

                            a {
                                color: #fff;
                            }

                            body > *:not(script,h1) > pre {
                                background: #414651;
                                box-shadow: 0px 0px 10px 0px rgb(0 0 0 / 59%) inset;
                                -webkit-box-shadow: 0px 0px 10px 0px rgb(0 0 0 / 59%) inset;
                                -moz-box-shadow: 0px 0px 10px 0px rgb(0 0 0 / 59%) inset;
                                border-color: #fff;
                            }

                            pre > span > span > span {
                                margin: 6px;
                            }

                            .permahighlight {
                                padding: 3px;
                                margin: 1px;
                                position: relative;
                                z-index: 1;
                                border-radius: 5px;
                                border: 2px solid white;
                            }

                            .highlight {
                                background: #399362;
                                padding: 3px;
                                margin: 3px;
                                position: relative;
                                z-index:2;
                                border-radius: 5px;
                            }

                            .permahighlight.highlight {
                                background: initial;
                                margin: 1px;
                            }

                            .permahighlight.highlight::before {
                                position: absolute;
                                content: "";
                                top: 2px;
                                left: 2px;
                                right: 2px;
                                bottom: 2px;
                                background: #399362;
                                border-radius: 1px;
                            }

                            .permahighlight.highlight > span {
                                position: relative;
                                z-index: 1;
                            }

                            .rowhighlight > span {
                                background: #2b352f;
                                padding: 0px 4px;
                                margin: 0px -4px;
                                position: relative;
                                z-index: 1;
                                border-radius: 3px;
                            }

                            pre .rowhighlight > span {
                                background: #1f1f1f;
                                padding: 1px 1px;
                                margin: -1px -1px;
                            }
                        </style>
                    </head>
                    <body>
                        <h1><a id='name'>${ name }.txt</a></h1>
                        <div>
                            ${ parsed_header }
                        </div>
                        <div id='bytes'>
                            ${ parsed_bytes }
                        </div>
                        <div>
                            ${ parsed_body }
                        </div>
                        <script>
                            const name = document.getElementById('name');
                            const bytes = [...document
                                .getElementById('bytes')
                                .querySelectorAll("span")
                                .values()]
                                    .map( span => span.textContent )
                                    .join(" ")
                                        .trim();
                            const file = new File(
                                [ bytes ],
                                name.textContent,
                                { type: "text/plain" }
                            )
                            const URL = window.URL.createObjectURL( file );
                            name.href = URL;
                            name.download = file.name;

                            const byteElements = document.querySelectorAll("span[id^='B'][id*='-']");
                            byteElements.forEach((element, i) => {
                                const decoded = document.getElementById(\`D\${element.id.slice(1)}\`);
                                // on mouseover, add the highlight class to the corresponding decoded character
                                element.onmouseover = function(){
                                    decoded.classList.add("highlight");
                                }
                                // on mouseout, remove the highlight class from the corresponding decoded character
                                element.onmouseout = function(){
                                    decoded.classList.remove("highlight");
                                }
                                // on click, toggle the permahighlight class on the corresponding decoded character
                                element.onclick = function(){
                                    element.classList.toggle("permahighlight");
                                    decoded.classList.toggle("permahighlight");
                                }
                                // vice versa
                                decoded.onmouseover = function(){
                                    element.classList.add("highlight");
                                }
                                decoded.onmouseout = function(){
                                    element.classList.remove("highlight");
                                }
                                decoded.onclick = function(){
                                    decoded.classList.toggle("permahighlight");
                                    element.classList.toggle("permahighlight");
                                }
                            });
                            
                            document.querySelectorAll("li").forEach(( element, i ) => {
                                const byteElement = document.getElementById(\`B\${element.id.slice(1)}\`);
                                const decodedElement = document.getElementById(\`D\${element.id.slice(1)}\`);
                                function highlight(){
                                    element.classList.add("rowhighlight");
                                    byteElement.classList.add("rowhighlight");
                                    decodedElement.classList.add("rowhighlight");
                                }
                                function unhighlight(){
                                    element.classList.remove("rowhighlight");
                                    byteElement.classList.remove("rowhighlight");
                                    decodedElement.classList.remove("rowhighlight");
                                }
                                element.onmouseover = highlight;
                                element.onmouseout = unhighlight;
                                byteElement.onmouseover = highlight;
                                byteElement.onmouseout = unhighlight;
                                decodedElement.onmouseover = highlight;
                                decodedElement.onmouseout = unhighlight;
                            })
                        </script>
                    </body>
                </html>
            `

            resolve(html);
        };
        
        reader.onerror = function() {
            reject(reader.error);
        };
    });
}


const input = document.getElementById('input');
const files: File[] = (globalThis as any).files = [];
const dbpfs: DBPF[] = (globalThis as any).dbpfs = [];
const entries: DBPFEntry[] = (globalThis as any).entries = [];

const output = document.getElementById('output') as HTMLElement;
const templates = {
    "file": document.getElementById('file-template'),
    "contents": document.getElementById('contents-template'),
    "blob": document.getElementById('blob-template')
}

input?.addEventListener("change", async function( event ) {
    
    while (output.firstChild) {
        output.removeChild(output.firstChild);
    }
    
    if( (event.target as any).files.length ) {
        const these_files = (event.target as any).files as File[];
        files.push( ...these_files );
        
        for( let file of these_files ){
            const dbpf = await DBPF.create( file );
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
                "trash-count",
                "trash-size",
                "trash-offset",
                "mode-flag",
                "header-segments",
                "dbpf-contents"
            ] as string[]).forEach(
                (className: string) => dbpfChildren[className] = dbpfElement.querySelector(`.${className}`) as HTMLElement
            );
            
            dbpfChildren["filename"].textContent = dbpf.filename;
            dbpfChildren["filename"].id = dbpf.filename;
            dbpfChildren["filepath"].textContent = dbpf.filepath;
            dbpfChildren["filesize"].textContent = `${ dbpf.filesize } bytes`;
            dbpfChildren["fileext"].textContent = dbpf.extension;
            const magic = dbpf.magic;
            const magicText = `0x${
            magic.toString(16).padStart(8,"0").toUpperCase()
            } (=${ magic })`;
            dbpfChildren["magic"].textContent = magicText;
            
            output?.appendChild( dbpfElement );
            
            const dbpfMajor = dbpf.header.dbpf.major;
            const dbpfMajorText = `0x${
            dbpfMajor.toString(16).padStart(8,"0").toUpperCase()
            } (=${ dbpfMajor })`;
            const dbpfMinor = dbpf.header.dbpf.minor;
            const dbpfMinorText = `0x${
            dbpfMinor.toString(16).padStart(8,"0").toUpperCase()
            } (=${ dbpfMinor })`;
            const dbpfUserMajor = dbpf.header.dbpf.usermajor
            const dbpfUserMajorText = `0x${
            dbpfUserMajor.toString(16).padStart(8,"0").toUpperCase()
            } (=${ dbpfUserMajor })`;
            const dbpfUserMinor = dbpf.header.dbpf.userminor;
            const dbpfUserMinorText = `0x${
            dbpfUserMinor.toString(16).padStart(8,"0").toUpperCase()
            } (=${ dbpfUserMinor })`;
            const dbpfCreated = dbpf.header.dbpf.created;
            const dbpfCreatedText = `0x${
            dbpfCreated.toString(16).padStart(8,"0").toUpperCase()
            } (=${ dbpfCreated }) (${ new Date( dbpfCreated ).toLocaleString() })`;
            const dbpfModified = dbpf.header.dbpf.modified;
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
            
            const indexMajor = dbpf.header.index.major;
            const indexMajorText = `0x${
            indexMajor.toString(16).padStart(8,"0").toUpperCase()
            } (=${ indexMajor })`;
            const indexMinor = dbpf.header.index.minor;
            const indexMinorText = `0x${
            indexMinor.toString(16).padStart(8,"0").toUpperCase()
            } (=${ indexMinor })`;
            const indexCount = dbpf.header.index.count;
            const indexCountText = `0x${
            indexCount.toString(16).padStart(8,"0").toUpperCase()
            } (=${ indexCount })`;
            const indexSize = dbpf.header.index.size;
            const indexSizeText = `0x${
            indexSize.toString(16).padStart(8,"0").toUpperCase()
            } (=${ indexSize })`;
            const indexOffset = dbpf.header.index.offset;
            const indexOffsetText = `0x${
            indexOffset.toString(16).padStart(8,"0").toUpperCase()
            } (=${ indexOffset })`;
            const indexFirst = dbpf.header.index.first;
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
            
            const trashCount = dbpf.header.trash.count;
            const trashCountText = `0x${
            trashCount.toString(16).padStart(8,"0").toUpperCase()
            } (=${ trashCount })`;
            const trashSize = dbpf.header.trash.size;
            const trashSizeText = `0x${
            trashSize.toString(16).padStart(8,"0").toUpperCase()
            } (=${ trashSize })`;
            const trashOffset = dbpf.header.trash.offset;
            const trashOffsetText = `0x${
            trashOffset.toString(16).padStart(8,"0").toUpperCase()
            } (=${ trashOffset })`;
            
            dbpfChildren["trash-count"].textContent = trashCountText;
            if( trashCount === 0 ){
                dbpfChildren["trash-count"].style.color = "grey";
                dbpfChildren["trash-count"].style.fontStyle = "italic";
            } else {
                dbpfChildren["trash-count"].style.fontWeight = "bold";
            }
            dbpfChildren["trash-size"].textContent = trashSizeText;
            if( trashSize === 0 ){
                dbpfChildren["trash-size"].style.color = "grey";
                dbpfChildren["trash-size"].style.fontStyle = "italic";
            } else {
                dbpfChildren["trash-size"].style.fontWeight = "bold";
            }
            dbpfChildren["trash-offset"].textContent = trashOffsetText;
            if( trashOffset === 0 ){
                dbpfChildren["trash-offset"].style.color = "grey";
                dbpfChildren["trash-offset"].style.fontStyle = "italic";
            } else {
                dbpfChildren["trash-offset"].style.fontWeight = "bold";
            }
            
            const modeFlag = `0x${
            dbpf.table.mode.toString(16).padStart(8,"0").toUpperCase()
            } (=${ dbpf.table.mode })`;
            const headerSegments = dbpf.table.headerSegments.map( bit => bit.toString() ).join(", ");
            
            dbpfChildren["mode-flag"].textContent = modeFlag;
            if( dbpf.table.mode === 0 ){
                dbpfChildren["mode-flag"].style.color = "grey";
                dbpfChildren["mode-flag"].style.fontStyle = "italic";
            } else {
                dbpfChildren["mode-flag"].style.fontWeight = "bold";
            }
            dbpfChildren["header-segments"].textContent = headerSegments;
            if( dbpf.table.headerSegments.length === 0 ){
                dbpfChildren["header-segments"].style.color = "grey";
                dbpfChildren["header-segments"].style.fontStyle = "italic";
            } else {
                dbpfChildren["header-segments"].style.fontWeight = "bold";
            }
            
            let removedLoading = false;const indeces = Array.from( dbpf.table.keys() )
            console.log( indeces.length, "entries found" );
            notify( `${ indeces.length } entries found in ${ dbpf.filename }`, `#${ dbpf.filename }` );
            for( let index of indeces ){
                const entry = await dbpf.table.get(index)
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
                    "resource-blobs"
                ] as string[]).forEach(
                    (className: string) => entryChildren[className] = entryElement.querySelector(`.${className}`) as HTMLElement
                );
                
                entryChildren["resource-index"].textContent = index.toString();
                
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
                const sizeFlag = entry.size.flag;
                const sizeFlagText = sizeFlag != null ? `0x${
                sizeFlag.toString(16).padStart(8,"0").toUpperCase()
                } (=${ sizeFlag })` : "Not Used In This Version";
                const sizeMemory = entry.size.memory;
                const sizeMemoryText = sizeMemory ? `0x${
                sizeMemory.toString(16).padStart(8,"0").toUpperCase()
                } (=${ sizeMemory })` : "Not Used In This Version";
                const sizeFile = entry.size.file.reduced;
                const sizeFileRaw = entry.size.file.raw;
                const sizeFileText = `RAW: 0x${
                sizeFileRaw.toString(16).padStart(8,"0").toUpperCase()
                }, S4PE: 0x${
                // see: https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi/Package/ResourceIndexEntry.cs#L98
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
                entryChildren["resource-size-compressed"].textContent = sizeFlagText;
                if( !sizeFlag ){
                    entryChildren["resource-size-compressed"].style.color = "grey";
                    entryChildren["resource-size-compressed"].style.fontStyle = "italic";
                } else {
                    entryChildren["resource-size-compressed"].style.fontWeight = "bold";
                }
                entryChildren["resource-size-memory"].textContent = sizeMemoryText;
                if( !sizeMemory ){
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
                
                entry.init!().then(async ()=>{
                    const blobList = entryChildren["resource-blobs"];
                    blobList.removeAttribute("style");
                    const blobElement = templates.blob?.cloneNode(true) as HTMLElement;
                    blobElement.removeAttribute("id");
                    blobElement.removeAttribute("style");

                    const name = `0x${ instance.toString(16) }`;

                    if( entry.mimetype ){
                        
                        const file = new File(
                            [ await entry.blob() ],
                            `${ name }.${ mime.getExtension( entry.mimetype ) }`,
                            { type: entry.mimetype }
                        )
                        
                        const URL = window.URL.createObjectURL( file );
                        
                        const blobChildren: Record<string,HTMLElement> = {};
                        ([
                            "blob-mime",
                            "blob-url"
                        ] as string[]).forEach(
                            (className: string) => blobChildren[className] = blobElement.querySelector(`.${className}`) as HTMLElement
                        );
                        
                        blobChildren["blob-mime"].textContent = file.type;
                        (blobChildren["blob-url"] as HTMLAnchorElement).href = URL;
                        (blobChildren["blob-url"] as HTMLAnchorElement).download = file.name;
                        (blobChildren["blob-url"] as HTMLAnchorElement).textContent = file.name;
                        
                        switch( entry.mimetype ){
                            case "image/png":
                            case "image/jpeg":
                            const img = new Image();
                            img.src = URL;
                            blobElement.appendChild( img );
                            break;
                        }
                    } else {
                        // create a link to view the byte contents as a text file of space delimited hex values
                        const blob = await entry.blob();

                        // delete all child nodes
                        while (blobElement.firstChild) {
                            blobElement.removeChild(blobElement.firstChild);
                        }

                        // create a new button element
                        const button = document.createElement("button");
                        button.textContent = "View Hex";

                        // set the button's onclick event
                        button.onclick = async function(){
                            const html = await blobToDebugHTML( blob, name );
                            const file = new File(
                                [ html ],
                                `0x${ instance.toString(16) }.html`,
                                { type: "text/html" }
                            )
                            const URL = window.URL.createObjectURL( file );
                            const a = document.createElement("a");
                            a.href = URL;
                            a.target = "_blank";
                            a.click();
                            // clean up
                            window.URL.revokeObjectURL( URL );
                        }

                        // embed the button in a h3, and append it to the blobElement
                        const h3 = document.createElement("h3");
                        h3.appendChild( button );
                        blobElement.appendChild( h3 );
                    }
                    blobList.appendChild( blobElement );
                })
                
                if( !removedLoading ){
                    dbpfChildren["dbpf-contents"].innerText = '';
                    removedLoading = true;
                }
                dbpfChildren["dbpf-contents"]?.appendChild( entryElement );
            }
            notify( `${ indeces.length } entries loaded from ${ dbpf.filename }`, `#${ dbpf.filename }` );
        }
    }
    console.log( (event.target as any).files.length, "files added. Total:", files.length );
    (input as any).value = '';
});