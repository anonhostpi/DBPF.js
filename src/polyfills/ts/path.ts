export const resolve = (...paths: string[]) => {
    paths = paths.map( path => path.replace(/\\/g, '/') ).filter( path => path.length );
    return paths.join('/');
}
export const isAbsolute = (path: string) => /^[a-zA-Z]:[\\/]/.test(path);