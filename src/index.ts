import { Task, TodoistApi } from '@doist/todoist-api-typescript';
import { Command } from 'commander';
import { tokenRepo } from './db/token.repo.js';
import request from 'superagent';

let _api: TodoistApi;

await tokenRepo.initDb();

async function todoist(): Promise<TodoistApi> {
    if (_api != undefined) return _api;

    const token = await tokenRepo.getTodoistToken();

    if (!token || token.length === 0) {
        // console.log('Please set token: ttt config --todoist-token <TODOIST_API_TOKEN>');
        throw new Error('Please set token: ttt config --todoist-token <TODOIST_API_TOKEN>');
    }

    _api = new TodoistApi(token);
    return _api;
}

async function getProjects() {
    const api = await todoist();
    api.getProjects()
        .then((projects) => console.log(projects))
        .catch((error) => console.log(error));
}

async function getTasks(filter: string): Promise<Task[]> {
    const api = await todoist();
    return api.getTasks({ filter });
}

const app = new Command();

app.version('0.1.0');

app.command('config')
    .option('--todoist-token <token>')
    .option('--tana-token <token>')
    .option('-D', 'debug mode')
    .action(async (tokens) => {
        if (tokens.D) {
            console.log(JSON.stringify(tokens));
        }
        if (tokens.todoistToken) {
            await tokenRepo.setTodoistToken(tokens.todoistToken);
        }

        if (tokens.tanaToken) {
            await tokenRepo.setTanaToken(tokens.tanaToken);
        }

        if (!!!tokens.todoistToken && !!!tokens.tanaToken) {
            const tdt = await tokenRepo.getTodoistToken();
            const tnt = await tokenRepo.getTanaToken();

            console.log(`todoist api token = ${tdt}`);
            console.log(`default tana token = ${tnt}`);
        }
    });

app.command('pull')
    .option('--filter <todoist filter>', 'todoist filter query. default to "today | overdue"', 'today | overdue')
    .option('--tana-token <api token>', 'token to tana node')
    .option('-D', 'debug mode')
    .action(async (options) => {
        let tnt: string;

        if (!options.tanaToken) {
            const tntInDb = await tokenRepo.getTanaToken();
            if (!tntInDb) {
                throw new Error('Please set tana token by --tana-token');
            } else {
                tnt = tntInDb;
            }
        }

        const filter = options.filter;

        const tasks = await getTasks(filter);
        const calls = tasks
            .map((task) => `${task.content} (${task.url})`)
            .map((note) => {
                if (options.D) {
                    console.log(`tana token: ${tnt}`);
                    console.log(`note: ${note}`);
                }
                const encodedNote = encodeURIComponent(note);
                return request
                    .get(`https://europe-west1-tagr-prod.cloudfunctions.net/addToNode?note=${encodedNote}`)
                    .set({ Authorization: `Bearer ${tnt}`, Accept: 'application/json' });
            });

        Promise.all(calls);
    });

app.parse(process.argv);
