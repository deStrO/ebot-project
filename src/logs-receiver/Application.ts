import PluginManager from '../common/tools/Plugins/PluginManager';
import * as dgram from 'dgram';
import Scopes from '../common/tools/Plugins/Scopes';
import {Logger} from 'winston';
import {createServer} from "node:http";
import {
    createApp,
    eventHandler,
    toNodeListener,
    readBody,
    getHeader,
    createRouter,
    getHeaders,
    getRequestURL
} from "h3";
import BaseApplication from "../common/tools/BaseApplication";
import {Queue} from "./queues/queue.interface";

export default class Application extends BaseApplication {
    udpServer: dgram.Socket | null;
    httpServer: any;
    queues: Queue[];
    declare config: any;
    declare logger: Logger;
    declare plugins: PluginManager;

    constructor(config: any) {
        super(config);

        this.queues = [];
        this.config = config;
        this.udpServer = null;
        this.httpServer = null;
    }

    async setup() {
        this.logger.info('Set');
        try {
            await this.setupPlugins();
            await this.setupQueues();
            await this.setupHttpServer();
            await this.setupUdpServer();
            this.plugins.emit('listen', Scopes.APP, this);
            this.logger.info("Logs Receiver started");
        } catch (err) {
            this.logger.error(`Error while initializing core modules: ${err}`);
            process.exit();
        }

        this.hook('logs received', async (msg, from) => {
            const log = {msg, from};
            await this.callHook('logs before dispatch', log);
            await this.dispatch(log.from, log.msg);
            await this.callHook('logs after dispatch', log)
        })
    }

    async setupQueues() {
        for (const queueConfig of this.config.queues) {
            try {
                const queue: Queue = new ((await import('./queues/' + queueConfig.type)).default)();
                await queue.setup(queueConfig.config);
                this.queues.push(queue);
            } catch (e) {
                this.logger.error(`Failed to setup queue ${queueConfig.type}`)
                // @ts-ignore
                this.logger.error(e.message);
                process.exit();
            }
        }
    }

    async setupUdpServer() {
        return new Promise((resolve, reject) => {
            if (!this.config.udp.enabled) {
                return resolve(false);
            }

            const udpServer = dgram.createSocket('udp4');

            udpServer.once('error', (err) => {
                this.logger.error(`UDP server error:\n${err.stack}\nClosing the server`)
                udpServer.close();
                reject(err);
            });

            udpServer.on('message', (msg, rinfo) => {
                this.callHook("logs received", msg, rinfo.address + ":" + rinfo.port);
            });

            udpServer.once('listening', () => {
                const address = udpServer.address();
                this.logger.info(`UDP Server is listening to ${address.address}:${address.port}`);
                resolve(true);
            });

            udpServer.bind(this.config.udp.port, this.config.udp.ip);

            this.udpServer = udpServer;
        })
    }

    setupHttpServer() {
        return new Promise((resolve) => {
            const app = createApp();

            const ipRegex = /^\/((?:[0-9]{1,3}\.){3}[0-9]{1,3}:[0-9]+)$/;

            const router = createRouter()
            router.post('/**', eventHandler(async (event) => {
                const url = getRequestURL(event);

                let serverIp = getHeader(event, 'x-server-addr');
                if (ipRegex.test(url.pathname)) {
                    // @ts-ignore
                    serverIp = url.pathname.match(ipRegex)[1];
                }

                const message = {
                    lines: await readBody(event),
                    serverIp,
                    headers: getHeaders(event)
                }

                await this.callHook('on logs received', message)

                for (const line of message.lines.split("\n")) {
                    if (line.trim() === "")
                        continue;

                    try {
                        await this.callHook("logs received", line, message.serverIp);
                    } catch (e) {
                        console.log(e);
                    }
                }

                return 'ok';
            }))

            app.use(router);

            createServer(toNodeListener(app)).listen(this.config.http.port as number, this.config.http.ip, () => {
                this.logger.info(`HTTP Server is listening to ${this.config.http.ip}:${this.config.http.port}`);

                resolve(true);
            });
        })
    }

    async setupPlugins() {
        return await this.plugins.registerPlugins(this.config.plugins);
    }

    async dispatch(from: string, msg: string) {
        this.logger.debug(`[${from}] ${msg}`);
        for (const queue of this.queues) {
            queue.dispatch(from, msg);
        }

    }
}
