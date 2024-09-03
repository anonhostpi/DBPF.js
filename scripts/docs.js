const glob = require("glob")
const fs = require("fs")

if(glob.sync("src/other*").length || glob.sync("src/documents*").length)
    throw new Error( "Do NOT use 'other' or 'documents' as a file name in the ./src folder. The paths src/other* and src/documents* are reserved for generating project documentation." )

console.log( "Renaming documents folder to other" )
fs.renameSync("wiki/documents", "wiki/other")

console.log( "Fixing project document links in the wiki" )

const files = glob.sync("wiki/**/*.md")
files.forEach(file => {
    const path = file.split("/")
    const wikiIndex = path.indexOf("wiki") // wiki root
    const depthFromRoot = path.length - wikiIndex - 2
    const relativePathToRoot = "../".repeat(depthFromRoot)
    const correctDocumentPath = relativePathToRoot + "other"
    let content = fs.readFileSync(file, "utf8")
    // re-add the header to the project documents
    if( file.includes("wiki/other") ){
        const depthFromDoc = depthFromRoot - 1
        const docPath = path.slice(wikiIndex + 2, wikiIndex + 2 + depthFromDoc).join("/")
        const originalDocPath = `docs/${docPath}/${path[path.length - 1]}`
        const originalContent = fs.readFileSync(originalDocPath, "utf8")
        const header = originalContent.match(/^---[\r\n]+[\s\S]*?[\r\n]+---[\r\n]+/)
        if( header ){
            content = header[0] + content
        }
        // add edit link in footer
        const editLink = `\n&nbsp;\n\n[_Edit this page_](https://github.com/anonhostpi/DBPF.js/tree/main/${originalDocPath})`
        content = content + editLink
    }
    if( depthFromRoot === 0 && path[path.length -1 ] === "README.md" ){
        // move [DBPF](DBPF/README.md) to its own section
        content = content.replace(/\- \[DBPF\]\(DBPF\/README\.md\)\n/g, "")
        const h1 = content.match(/^# .+$/m)
        if( h1 ){
            content = content.replace(/^# .+$/m, h1[0] + "\n\n## Primary Module\n\n\- [DBPF](DBPF/README.md)")
        }
    }

    const newContent = content
        .replace(/(\(|\[)(?:\.\.\/)+documents/g, `\$1${correctDocumentPath}`)
        .replace(/(\(|\[)documents/g, `\$1${correctDocumentPath}`)
        .replace(/(\(|\[)(?:\.\.\/)+docs/g, `\$1${correctDocumentPath}`)
        .replace(/(\(|\[)docs/g, `\$1${correctDocumentPath}`)
        .replace(/(?<=\*\*\*\s*.*)(?<!\[[^\]]*\]\([^\)]*)\s*[\\\/]\s*/gm, " / ") // bug fix for project document paths
        .replace(/(?<=\*\*\*\s*\[.*?\]\(.*?\).*)\/ (?:README|index)/gmi, "") // remove /README or /index from paths (for docusaurus)
        .replace(/(?<=\*\*\*\s*\[.*?\]\(.*?\).*)guides/gm, "Guides") // styling
    fs.writeFileSync(file, newContent)
})
const WIKI_README = "wiki/README.md"
const README = fs.readFileSync(WIKI_README, "utf8")
const newREADME = README.replace(/\(documents/g, "(other")
fs.writeFileSync(WIKI_README, newREADME)