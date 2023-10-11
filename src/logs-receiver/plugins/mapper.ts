import BasePlugin from "../../common/tools/Plugins/BasePlugin";
import Scopes from "../../common/tools/Plugins/Scopes";

export default class Logger extends BasePlugin {

    async setup() {
        this.logger.info(`Mapping enabled for ${Object.keys(this.config.mapping).length} server(s)`);
        for (const ip in this.config.mapping) {
            this.logger.info(`Mapped ${ip} to ${this.config.mapping[ip]}`);
        }
    }

    async validateConfig(): Promise<boolean> {
        return true;
    }

    get name() {
        return "Mapper";
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

        app.hook('on logs received', (message: any) => {
            if (message.serverIp in this.config.mapping) {
                message.serverIp = this.config.mapping[message.serverIp];
            }
        })
    }
}
