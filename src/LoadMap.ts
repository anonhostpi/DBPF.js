export type RequestGUID = string;

export type GUIDArray = RequestGUID[] & {
    delete( request_id: RequestGUID ): void;
    generate(): RequestGUID;
}

export class LoadMap extends Map<URL, GUIDArray> {
    get( url: URL ){
        let requests = super.get( url );
        if( !requests ){
            requests = (()=>{
                const array: RequestGUID[] = [];

                (array as GUIDArray).delete = ( request_id: RequestGUID ) => {
                    array.splice( array.indexOf( request_id ), 1 );
                    if( array.length === 0 ){
                        this.delete( url );
                    }
                }
                (array as GUIDArray).generate = () => {
                    const request_id = crypto.randomUUID();
                    array.push( request_id );
                    return request_id;
                }

                return array as GUIDArray;
            })()
            super.set( url, requests );
        }
        return requests;
    }
}