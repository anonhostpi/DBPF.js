const IGNORED = [
    '{','}',
    '[',']',
]

function splitKeyValue(line) {
    let inQuotes = false;
    let currentQuote = '';
    let escapeNext = false;
    let colonIndex = -1;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (escapeNext) {
            escapeNext = false;
            continue;
        }

        if (char === '\\') {
            escapeNext = true;
            continue;
        }

        if (char === '"' || char === "'") {
            if (!inQuotes) {
                inQuotes = true;
                currentQuote = char;
            } else if (currentQuote === char) {
                inQuotes = false;
                currentQuote = '';
            }
        }

        if (char === ':' && !inQuotes) {
            colonIndex = i;
            break;
        }
    }

    if (colonIndex === -1) {
        return { key: '', value: line };
    }

    const key = line.slice(0, colonIndex);
    const value = line.slice(colonIndex + 1);

    return { key, value };
}

function splitCommaDelimited(line) {
    let inQuotes = false;
    let currentQuote = '';
    let escapeNext = false;
    let lastComma = -1;
    let values = [];

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (escapeNext) {
            escapeNext = false;
            continue;
        }

        if (char === '\\') {
            escapeNext = true;
            continue;
        }

        if (char === '"' || char === "'") {
            if (!inQuotes) {
                inQuotes = true;
                currentQuote = char;
            } else if (currentQuote === char) {
                inQuotes = false;
                currentQuote = '';
            }
        }

        if (char === ',' && !inQuotes) {
            values.push(line.slice(lastComma + 1, i));
            lastComma = i;
        }
    }

    values.push(line.slice(lastComma + 1));

    return values;
}

function alignJSON( obj, arrays = false, maxlength = 80 ){
    var json = JSON.stringify( obj, null, 4 );
    // get the longest line
    var lines = json.split('\n');
    var longest = lines
        .filter( line => line.trim().length > 0 )
        .filter( line => !IGNORED.some( char => line.includes(char) ) )
        .filter( line => {
            let { value } = splitKeyValue(line);
            return value.trim().length > 0;
        })
        .map( line => {
            let { key } = splitKeyValue(line);
            return key
        })
        .reduce( (a,b) => {
            return a.length > b.length ? a : b
        });

    var minimum_value_start = longest.length + 2;

    lines = lines.map((
        line,
        index,
        lines
    ) => {
        if( line.trim().length === 0 )
            return line;
        // check if line has ignored characters
        var ignore = IGNORED.some( char => line.includes(char) );
        if( ignore )
            return line;
        let {
            key,
            value
        } = splitKeyValue(line);

        if( key.trim().length ){
            value = value.trim();
            const separator = ': ';
            const padding = minimum_value_start - key.length - separator.length;
            if( padding > 0 )
                return key + separator + ' '.repeat(padding) + value;
            else
                return key + separator + value;
    
        } else if( arrays ) {
            value = value.trim();
            return ' '.repeat(minimum_value_start) + value;
        } else {
            const firstvalue = value;
            // get the rest of the array
            let values = [ firstvalue ];
            while( true ){
                let next = lines[index + values.length];
                if( !next )
                    break;
                if( next.trim().length === 0 )
                    continue;
                if( IGNORED.some( char => next.includes(char) ) )
                    break;
                let { key, value } = splitKeyValue(next);
                if( key.trim().length )
                    break;

                values.push( value.trim() );
            }

            lines.splice( index + 1, values.length - 1 );

            return values.join(' ');
        }
    });

    const longest_nonarray_line = lines
        .filter( line => !IGNORED.some( char => line.includes(char) ) )
        .filter( line => {
            let { key } = splitKeyValue(line);
            return key.trim().length > 0;
        })
        .reduce( (a,b) => {
            return a.length > b.length ? a : b
        });
    const max_linelength = Math.min( maxlength, longest_nonarray_line.length );
    
    // break up long array lines (comma delimited)
    lines = lines.map((
        line,
        index,
    )=>{
        if( line.trim().length === 0 )
            return line;
        // check if line has ignored characters
        var ignore = IGNORED.some( char => line.includes(char) );
        if( ignore )
            return line;
        let {
            key,
            value
        } = splitKeyValue(line);

        if( key.trim().length )
            return line;
        else {
            // get the rest of the array
            let values = splitCommaDelimited(value);
            if( values.length === 1 )
                return line;
            let firstvalue = values[0];
            const padding = firstvalue.length - firstvalue.trim().length;
            const separator = ', ';

            let newlines = [];
            while( true ){
                const newline = [ values.shift().trim() ];
                while( values.length ){
                    let next = values.shift();
                    let trimmed = next.trim();
                    const currentlinelength = (' '.repeat( padding ) + newline.join(separator)).length;
                    if( currentlinelength + trimmed.length + separator.length < max_linelength ){
                        newline.push( trimmed );
                    } else {
                        values.unshift( next );
                        break;
                    }
                }
                newlines.push( ' '.repeat( padding ) + newline.join(separator) );
                if( values.length === 0 )
                    break;
            }

            return newlines.join(',\n');
        }
    })

    return lines
        .filter( line => line.trim().length > 0 )
        .join('\n');
}

module.exports = {
    alignJSON,
    splitKeyValue,
    splitCommaDelimited,
}