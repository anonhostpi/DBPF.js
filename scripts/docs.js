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
    const content = fs.readFileSync(file, "utf8")
    const newContent = content
        .replace(/(\(|\[)(?:\.\.\/)+documents/g, `\$1${correctDocumentPath}`)
        .replace(/(\(|\[)documents/g, `\$1${correctDocumentPath}`)
        .replace(/(\(|\[)(?:\.\.\/)+docs/g, `\$1${correctDocumentPath}`)
        .replace(/(\(|\[)docs/g, `\$1${correctDocumentPath}`)
    fs.writeFileSync(file, newContent)
})
const WIKI_README = "wiki/README.md"
const README = fs.readFileSync(WIKI_README, "utf8")
const newREADME = README.replace(/\(documents/g, "(other")
fs.writeFileSync(WIKI_README, newREADME)