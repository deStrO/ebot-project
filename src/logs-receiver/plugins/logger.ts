import * as fs from 'fs';
import Ajv from 'ajv';
import BasePlugin from "../../common/tools/Plugins/BasePlugin";
import Scopes from "../../common/tools/Plugins/Scopes";

export default class Logger extends BasePlugin {

    async setup() {
        try {
            fs.mkdirSync(this.config.path, {
                recursive: true
            });
            this.logger.info(`Created directory ${this.config.path}`);
        } catch (e) {
            this.logger.error(`Failed to create directory ${this.config.path}`);
        }
    }

    async validateConfig(): Promise<boolean> {
        const schema = JSON.parse(fs.readFileSync(`${__dirname}/logger.schema.json`).toString());
        const ajv = new Ajv();
        const validate = ajv.compile(schema);

        return !!validate(this.config);
    }

    get name() {
        return "Logger";
    }

    get version() {
        return "1.0.0";
    }

    scopes() {
        return [Scopes.APP];
    }

    async listen(scope: Scopes, app: any) {
        if (scope !== Scopes.APP) {
            return;
        }

        this.logger.info(`Logger plugins will log all logs into "${this.config.path}"`);

        app.hook("logs received", (text: string, from: string) => {
            if (this.config.split) {
                fs.appendFileSync(this.config.path + '/' + from, text + "\r\n");
            } else {
                fs.appendFileSync(this.config.path, text + "\r\n");
            }
        });
    }
}
