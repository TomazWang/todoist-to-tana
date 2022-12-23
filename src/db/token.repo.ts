import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb';

type Data = {
    todoistToken?: string;
    tanaToken?: string;
};

let db: Low<Data>;

async function initDb() {
    // File path
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const file = join(__dirname, 'db.ttt');

    const adapter = new JSONFile<Data>(file);
    db = new Low(adapter);

    await db.read();

    db.data ||= {};
    await db.write();
}


async function setTodoistToken(token: string) {
    console.log('> set token');

    if (token) {
        if (db.data) {
            db.data.todoistToken = token;
            console.log('Todoist token has been set');
            await db.write();
            return;
        } else {
            console.log('db issue');
        }
    } else {
        console.log('Todoist token cannot be empty');
    }
}

async function getTodoistToken(): Promise<string|undefined> {
    await db.read()
    return db.data?.todoistToken;
}



async function setTanaToken(token: string) {
    console.log('> set token');

    if (token) {
        if (db.data) {
            db.data.tanaToken = token;
            console.log('Tana token has been set');
            await db.write();
            return;
        } else {
            console.log('db issue');
        }
    } else {
        console.log('Tana token cannot be empty');
    }
}

async function getTanaToken(): Promise<string|undefined> {
    await db.read()
    return db.data?.tanaToken;
}

export const tokenRepo = {
    initDb,
    getTodoistToken,
    setTodoistToken,
    getTanaToken,
    setTanaToken
}