import CDP from 'chrome-remote-interface';
import fs from 'node:fs';

const TARGET_URL = 'localhost:4000';
const CHECK_INTERVAL_MS = 5000;

let isConnected = false;
let client = null;
let isTryingToConnect = false;

/**
 * Attempts to connect to a Chrome tab matching the TARGET_URL.
 * Prints status messages only once per connection attempt.
 */
async function tryConnect() {
    if (isTryingToConnect || isConnected) {
        // Already trying to connect or connected, no need to repeat
        return;
    }

    isTryingToConnect = true;
    console.log(`Trying to connect to http://${TARGET_URL}`);

    try {
        const tabs = await CDP.List();
        const targetTab = tabs.find((tab) => tab.url.includes(TARGET_URL));

        if (!targetTab) {
            // Target tab not found, will try again later
            isTryingToConnect = false;
            return;
        }

        client = await CDP({ target: targetTab });
        isConnected = true;
        isTryingToConnect = false;
        console.log(`Connected to http://${TARGET_URL}`);

        const { Runtime } = client;
        await Runtime.enable();

        const logStream = fs.createWriteStream('console-logs.txt', { flags: 'a' });

        async function getObjectRecursive(Runtime, objectId) {
            const props = await Runtime.getProperties({ objectId, ownProperties: true });
            const result = {};

            for (const prop of props.result) {
                if (prop.enumerable && prop.value) {
                    if (prop.value.type === 'object' && prop.value.objectId) {
                        result[prop.name] = await getObjectRecursive(Runtime, prop.value.objectId);
                    } else {
                        result[prop.name] = prop.value.value;
                    }
                }
            }

            return result;
        }

        Runtime.consoleAPICalled(async ({ type, args }) => {
            const resolvedArgs = [];

            for (const arg of args) {
                if (arg.type === 'object' && arg.objectId) {
                    try {
                        const obj = await getObjectRecursive(Runtime, arg.objectId);
                        resolvedArgs.push(JSON.stringify(obj));
                    } catch {
                        resolvedArgs.push('[unserializable object]');
                    }
                } else if (arg.value !== undefined) {
                    resolvedArgs.push(String(arg.value));
                } else if (arg.description) {
                    resolvedArgs.push(arg.description);
                } else {
                    resolvedArgs.push('[unknown]');
                }
            }

            const message = resolvedArgs.join(' ');
            const timestamp = new Date().toISOString();
            logStream.write(`[${type}] ${timestamp} ${message}\n`);
        });

        client.on('disconnect', () => {
            console.log(`⚠️ Disconnected from http://${TARGET_URL}`);
            isConnected = false;
            client = null;
        });

        client.on('error', (err) => {
            console.error('CDP connection error:', err);
            isConnected = false;
            client = null;
        });
    } catch (error) {
        console.error('Connection attempt failed:', error.message);
        isTryingToConnect = false;
        isConnected = false;
        client = null;
    }
}

// Poll every 5 seconds and attempt connection if not connected
setInterval(() => {
    if (!isConnected) {
        tryConnect();
    }
}, CHECK_INTERVAL_MS);

// Initial connection attempt immediately on start
tryConnect();
