const fs = require("fs")
const YAML = require("yaml")

const md = fs.readFileSync("docs/spec/sections/ResourceTypes.md", "utf8")

function rectifyHexadecimal( string ){
    string = string.trim()
    // check that string matches 0x[0-9a-fA-F]+
    if( !string.match(/^0x[0-9a-fA-F]+$/) )
        return string
    // Upper case all except the 0x
    return string.replace(/(?<=0x)[0-9a-fA-F]+/g, match => match.toUpperCase())
}

function getTables( lines ){
    
    let tables = []
    
    let table_lines = []
    for( let i = 0; i < lines.length; i++ ){
        const line = lines[i]
        if( line.startsWith("|") ){
            table_lines.push(line)
        } else {
            if( table_lines.length > 0 ){
                tables.push(table_lines)
                table_lines = []
            }
        }
    }

    if( table_lines.length > 0 ){
        tables.push(table_lines)
    }
    
    tables = tables.map( table => {
        const isProper = table[1].startsWith("|-") || table[1].startsWith("|:")
        if( !isProper ){
            throw new Error("Table is not properly formatted")   
        }
        
        const header = table[0].split("|").map( cell => cell.trim().toLowerCase() )
        // since we use tables with starting pipes, the first element is always empty
        header.shift()
        
        // ending pipes are optional
        if( header[header.length - 1] === "" )
            header.pop()
        
        const rows = table.slice(2).map( row => {
            const cells = row.split("|").map( cell => cell.trim() )
            cells.shift()
            if( cells.length === header.length + 1 ){
                cells.pop()
            }
            return cells
        })
        
        const _table = {}
        rows.forEach( row => {
            const key = rectifyHexadecimal(row[0])
            const data = _table[key] = {}
            header.forEach(( key, index ) => {
                data[key] = rectifyHexadecimal(row[index])
            })
            
            if( Object.keys(data).includes("source") ){
                const links = data.source.split(",").map( link => link.trim() )
                const sources = links.map( link => {
                    const search = new RegExp(`^${ link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }\s*:\s*(.*)$`, "m")
                    const match = md.match(search)
                    if( match ){
                        return match[1]
                    }
                }).filter(Boolean)
                delete data.source
                data.sources = sources
            }
        })
        
        return _table
    })
    
    return tables
}

function parseMarkdownList(markdown) {
    const lines = markdown.split('\n').filter(Boolean); // Split into lines, ignore empty ones
    let segments = [];

    // identify the root lists
    let list_lines = [];
    for(let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if(line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            list_lines.push(line);
        } else {
            if(list_lines.length > 0) {
                segments.push(list_lines);
                list_lines = [];
            }
        }
    }

    if(list_lines.length > 0) {
        segments.push(list_lines);
    }

    // function to handle depth of lists
    function handleSubSegments( segments, indent ){
        let sub_segment = [];
        for(let i = 0; i < segments.length; i++) {
            const line = segments[i];
            const line_indent = line.search(/\S/);
            if(line_indent === indent) {
                sub_segment.push(line);
            } else if(line_indent > indent) {
                sub_segment.push(handleSubSegments(segments.slice(i), line_indent));
                i += sub_segment[sub_segment.length - 1].length;
            } else {
                break;
            }
        }
        return sub_segment;
    }

    segments = segments.map( segment => {
        const indent = segment[0].search(/\S/);
        return handleSubSegments(segment, indent);
    })

    function parseLists( segments ){
        return segments.map( segment => {
            if(Array.isArray(segment[0])) {
                return parseLists(segment);
            } else {
                return segment.map( line => {
                    return line.trim().replace(/^[*-]\s*/, '').replace(/^\`+|\`+$/g, '')
                });
            }
        })
    }

    return parseLists(segments);
}

function parseCodeBlocks(markdown) {
    const block_regex = /```([\w\-_]+)?(.*)[\r\n]([\s\S]*?)[\r\n]```/g;
    const code_blocks = [];
    let match;

    while((match = block_regex.exec(markdown)) !== null) {
        code_blocks.push({
            language: match[1],
            description: match[2].trim(),
            code: match[3]
        })
    }

    return code_blocks;
}

let sections = md.split(/^## /gm).slice(1)
sections = sections.map( section => {
    const title = section.match(/.*$/m)[0]
    const tag = title.split(" - ")[0].trim()
    const label = title.split(" - ")[1].trim()
    const out = {
        tag,
        label,
        tables: [],
        sub_sections: []
    }
    
    const original_content = section.replace(/.*$/m, "").trim()
    let sub_sections = []

    // find the ### lines, then find the next #{1,3} line
    const first_line_regex = /^### (.*)$/gm
    const next_section_regex = /^(#{1,3}) (.*)$/gm

    let match = first_line_regex.exec(original_content)

    while( match ){
        const start = match.index + match[0].length
        const title = match[1]
        const next_section = next_section_regex.exec(original_content.slice(start))
        const end = next_section ? next_section.index : original_content.length
        sub_sections.push([original_content.slice(start, start + end), title])
        match = first_line_regex.exec(original_content.slice(start + end))
    }

    const original_lines = original_content.split("\n")
    out.tables = getTables(original_lines)
    out.sub_sections = [...sub_sections].map( match => {
        const title = match[1]
        let content = match[0]
        const code_blocks = parseCodeBlocks(content)
        content = content.replace(/```([\w\-_]+)?(.*)[\r\n]([\s\S]*?)[\r\n]```/g, "")
        const lines = content.split("\n").map( line => line.replace(/\r/g, "") )
        if( lines[lines.length - 1].trim() === "" )
            lines.pop()
        if( lines[0].trim() === "" )
            lines.shift()
        const tables = getTables(lines)
        const lists = parseMarkdownList( lines.join("\n") )
        const out = {
            title,
            code_blocks: code_blocks,
        }
        if( !tables.length && !lists.length ){
            out.content = content
        }
        if( tables.length ){
            out.tables = tables
        }
        if( lists.length ){
            out.lists = lists
        }
        
        return out
    })
    
    return out
})

const parent = "src/Plugins/ResourceTypes"
const codeblocks = {}
sections.forEach( section => {
    const map = codeblocks[section.tag] = {}
    section.sub_sections.forEach( sub => {
        sub.code_blocks.forEach( block => {
            if( !map[sub.title] ){
                map[sub.title] = []
            }
            map[sub.title].push(block)
        })

        delete sub.code_blocks
    })
})

Object.keys(codeblocks).forEach( tag => {
    const set = codeblocks[tag]
    if( Object.keys(set).includes("Structure") ){
        const kaitais = set["Structure"].filter( block => block.language === "yaml")
        if( kaitais.length ){

            // get .meta.id from each kaitai
            const files = new Map()
            kaitais.forEach( kaitai => {
                const yaml = YAML.parse(kaitai.code)
                if( yaml.meta && yaml.meta.id ){
                    files.set(yaml.meta.id, kaitai.code)
                }
            })
            
            files.forEach( (code, id) => {
                const directory = `${parent}/${tag}`
                if( !fs.existsSync(directory) ){
                    fs.mkdirSync(directory, {recursive: true})
                }
                const outfile = `${directory}/${id}.ksy`
                fs.writeFileSync(outfile, code)
            })
        }
    }
})

sections.forEach( section => {
    const directory = `${parent}/${section.tag}`
    if( !fs.existsSync(directory) ){
        fs.mkdirSync(directory, {recursive: true})
    }
    const outfile = `${directory}/details.json`
    fs.writeFileSync(outfile, JSON.stringify(section, null, 2))
})