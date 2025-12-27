declare module 'connect-sqlite3' {
    import { Store, Session } from 'express-session';

    interface SQLiteStoreOptions {
        table?: string;
        db?: string;
        dir?: string;
        concurrentResult?: boolean;
    }

    interface SQLiteStore extends Store {
        new(options?: SQLiteStoreOptions): SQLiteStore;
    }

    export default function connect(session: any): SQLiteStore;
}
