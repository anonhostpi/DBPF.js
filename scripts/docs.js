const glob = require("glob")
const fs = require("fs")

if(fs.existsSync("src/spec.ts"))
    throw new Error( "Do NOT use spec.ts as a file name in the ./src folder. This name is reserved for generating spec documentation." )

console.log( "Renaming documents folder to spec" )
fs.renameSync("wiki/documents", "wiki/spec")

console.log( "Fixing spec links in wiki" )

const files = glob.sync("wiki/**/*.md")
files.forEach(file => {
    const path = file.split("/")
    const wikiIndex = path.indexOf("wiki") // wiki root
    const depthFromRoot = path.length - wikiIndex - 2
    const relativePathToRoot = "../".repeat(depthFromRoot)
    const correctDocumentPath = relativePathToRoot + "spec"
    const content = fs.readFileSync(file, "utf8")
    const newContent = content
        .replace(/\((?:\.\.\/)+spec/g, `(${correctDocumentPath}`)
        .replace(/\((?:\.\.\/)+documents/g, `(${correctDocumentPath}`)
    fs.writeFileSync(file, newContent)
})
const WIKI_README = "wiki/README.md"
const README = fs.readFileSync(WIKI_README, "utf8")
const newREADME = README.replace(/\(documents/g, "(spec")
fs.writeFileSync(WIKI_README, newREADME)