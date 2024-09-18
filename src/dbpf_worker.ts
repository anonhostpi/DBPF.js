import * as Comlink from 'comlink';

/**
 * ReaderController
 * 
 * This class is responsible for managing the DBPF readers on this thread.
 */
class ReaderController {
    /**
     * List of blob or file URLs that this controller is currently responsible for.
     */
    urls: URL[] = [];
}