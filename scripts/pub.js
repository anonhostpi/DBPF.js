const fs = require("fs");
const path = require("path");
const glob = require("glob");
const { execSync } = require("child_process");
const YAML = require("yaml");

execSync("npx copyfiles -f pub/docusaurus.config.ts pub/build ", {stdio: "inherit"} )
execSync("npx copyfiles -f pub/sidebars.ts pub/build ", {stdio: "inherit"} )
execSync("npx copyfiles -f pub/img/* pub/build/static/img", {stdio: "inherit"} )
execSync("npx copy-folder wiki pub/build/docs", {stdio: "inherit"} )
// rename every README.md to the parent folder name, except for the root README.md. Rename that one to Table of Contents.md
// all links need to be updated to reflect the new file names. The links are typically relative, so we need to do something a bit advanced

// get all the README.md files
const readmeFiles = glob.sync("pub/build/docs/**/README.md").map(file => path.resolve(process.cwd(), file));

// get all wiki files
const wikiFiles = glob.sync("pub/build/docs/**/*.md");

// update the links in the wiki files first (and also add the header)
wikiFiles.forEach(file => {
    let content = fs.readFileSync(file, "utf8");
    let oldContent = content;
    // get all instances of (?:../)*README.md
    const matches = [...content.matchAll(/\(((?:[\w\.]*[\\\/])*)README\.md\)/g)];
    // resolve the matches and check them against the README.md paths in the readmeFiles array
    if (matches) {
        matches.forEach(match => {
            const dir = match[1] || "";
            match = match[0];
            // resolve the match to an absolute path
            const resolved = path.resolve(process.cwd(), path.dirname(file), match.replace(/^\(/, "").replace(/\)$/, ""));
            // check if the resolved path is in the readmeFiles array
            if (readmeFiles.includes(resolved)) {
                // if it is, update the content
                // first replace the filename in the match
                let newName = path.basename(path.dirname(resolved))
                if( newName === "docs")
                    newName = "API"
                newName = newName.replaceAll(" ", "%20")
                const newMatch = match.replace(/^\(/, "").replace(/\)$/, "").replace("README", newName);
                // then replace the match in the content
                let safeMatch = `(?<![\\/])${ dir.replaceAll(/[\\\/]/g, "[\\/]").replaceAll(/\./g,"\\.") }README\\.md`;
                safeMatchR = new RegExp(safeMatch, "g");
                content = content.replaceAll(safeMatchR, newMatch);
            }
        });
    }

    let parent = path.basename(path.dirname(file))
    const child = path.basename(file).replace(".md", "")
    let title = child;

    if( parent === "docs" ){
        title = "API";
        content = content
            .replace(/## Documents/g, "## Additional Documents")
            // [README](other/spec/spec.md) with [Overview](other/spec/spec.md)
            .replace(/(?<=\[.*)[\\](?=.*\])/g, "/")
            .replace(/## Modules/g, "## Other Modules Defined in This Library")
    }

    const isIndex = title.toUpperCase() === "README" || title.toUpperCase() === "INDEX"
    if( isIndex ){
        title = parent;
        parent = path.basename(path.dirname(path.dirname(file)))
    }
    let sidebar_label = title === "API" ? "Table of Contents" : null;

    let position;

    // Rename titles as needed
    switch( title ){
        case "API":
            sidebar_label = "Table of Contents";

            content = content
                .replace(/## Documents/g, "## Additional Documents")
                // [README](other/spec/spec.md) with [Overview](other/spec/spec.md)
                .replace(/(?<=\[.*)[\\](?=.*\])/g, "/")
                //.replace(/\[spec\/README\]\(([^)]+)\)/g, "[spec/Overview]($1)")
                .replace(/## Modules/g, "## Other Modules Defined in This Library")

            // grab all non-empty lines between Documents and Modules
            let match = oldContent.match(/## Additional Documents([\s\S]*?)## Other Modules Defined in This Library/);
            if( match ){
                // split the match into lines
                let lines = match[1].split("\n");
                // split the link into the link text and the link
                lines = lines.map(line => line.match(/\[(.*?)\]\((.*?)\)/));
                const links = lines.map(line => line ? {text: line[1], link: line[2]} : null).filter(Boolean);
                // resolve the links against `file`'s directory
                links.forEach(link => {
                    link.resolved = path.resolve(path.dirname(file), link.link);
                });
                // get the titles from the yaml frontmatter of the resolved links
                links.forEach(link => {
                    let childContent = fs.readFileSync(link.resolved, "utf8");
                    if( childContent ){
                        let header = childContent.match(/^---[\r\n]+([\s\S]*?)[\r\n]+---/);
                        if( header ){
                            let yaml = YAML.parse(header[1]);
                            if( yaml.pub_title || yaml.title ){
                                let path = link.text.split("/");
                                path.pop();
                                path.push(yaml.pub_title || yaml.title);
                                link.text = path.join("/");
                            }
                        }
                    }
                });
                
                const newDocumentsContent = links.map(link => `[${link.text}](${link.link})`).join("\n");
                content = content.replace(/## Additional Documents([\s\S]*?)## Other Modules Defined in This Library/, `## Additional Documents\n\n${newDocumentsContent}\n\n## Other Modules Defined in This Library`);
            }
            break;
        default: null;
    }

    // check if the file has a YAML header
    let header = content.match(/^---[\r\n]+([\s\S]*?)[\r\n]+---/);
    let yaml = {};

    if( header ){
        yaml = Object.assign({},YAML.parse(header[1]));
    }
    if( yaml.pub_title ){ // workaround for how typedoc handles anchor links
        yaml.title = yaml.pub_title
    } else if( !yaml.title && title )
        yaml.title = title;
    if( !yaml.sidebar_label && sidebar_label )
        yaml.sidebar_label = sidebar_label;
    if( !yaml.sidebar_position && position )
        yaml.sidebar_position = position;

    console.log( file, header, yaml )

    yaml.last_update = {
        date: new Date().toLocaleDateString(),
        author: "Automation"
    }

    header = `---\n${ YAML.stringify(yaml) }\n---\n`;
    
    content = content.replace(/^---[\r\n]+([\s\S]*?)[\r\n]+---/, "");
    content = `${header}${content}`;

    // generate anchor links
    // for each header line, add a docusaurus anchor link

    content = content.replaceAll(/^(#+) ([^\{\}\r\n]+)$/gm, (match, level, header, offset, string, groups) => {
        const anchor = header.toLowerCase().replace(/[\s]/g, "-").replace(/[^a-z0-9\-]/g, "");
        return `${level} ${header} {#${anchor}}`;
    })

    // write the new content to the file
    fs.writeFileSync(file, content);
});

// rename the README.md files
readmeFiles.forEach(file => {
    let newPath;
    if( path.basename(path.dirname(file)) === "docs") {
        newPath = path.join(path.dirname(file), "API.md");
    } else {
        newPath = path.join(path.dirname(file), `${path.basename(path.dirname(file))}.md`);
    }
    console.log(`Renaming ${file} to ${newPath}`);
    fs.renameSync(file, newPath);
})

execSync("npx copy-folder test/serve pub/build/static", {stdio: "inherit"} )
execSync("npx mkdirp pub/build/src/pages", {stdio: "inherit"} )
fs.renameSync("pub/build/static/index.html", "pub/build/static/playground.html")
execSync("npx copy-folder pub/src pub/build/src", {stdio: "inherit"} )

process.chdir("pub/build")
execSync("npx docusaurus build", {stdio: "inherit"} )