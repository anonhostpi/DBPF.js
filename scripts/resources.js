const fs = require("fs")
const md = fs.readFileSync("docs/spec/sections/ResourceTypes.md", "utf8")

let sections = md.split(/^## /gm).slice(1)
sections = sections.map( section => {
    const title = section.match(/.*$/m)[0]
    const tag = title.split(" - ")[0].trim()
    const label = title.split(" - ")[1].trim()
    const out = {
        tag,
        label,
        content: section.replace(/.*$/m, "").trim(),
        tables: []
    }

    // remove any lines that don't start with a |
    out.content = out.content.split("\n").filter( line => line.startsWith("|") )
    
    const table_splits = out.content
        .map((line, index) => line.startsWith('|-') ? index : -1)
        .filter(index => index !== -1)

    for( let i = 0; i < table_splits.length; i++ ){
        const start = table_splits[i] - 1
        const end = table_splits[i + 1] - 1 || out.content.length
        let rows = out.content.slice(start, end)
        const header = rows[0].split("|").map( cell => cell.trim().toLowerCase() )
        header.pop(); header.shift()
        rows.splice(0, 2) // remove the header and the separator
        const table = {}
        rows = rows.map( row => {
            const _row = row.split("|").map( cell => cell.trim() )
            _row.shift();
            return _row
        })
        rows.forEach( row => {
            const data = table[row[0]] = {}
            header.forEach(( key, index ) => {
                data[key] = row[index]
            })
            data.value = data.value.toUpperCase()

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
        })
        
        out.tables.push(table)
    }

    delete out.content

    return out
})

const parent = "src/Plugins/ResourceTypes"

sections.forEach( section => {
    const directory = `${parent}/${section.tag}`
    if( !fs.existsSync(directory) ){
        fs.mkdirSync(directory, {recursive: true})
    }
    const outfile = `${directory}/details.json`
    fs.writeFileSync(outfile, JSON.stringify(section, null, 2))
})