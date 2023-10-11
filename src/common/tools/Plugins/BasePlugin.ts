import {createLogger, Logger} from '../CreateLogger';
import Scopes from "./Scopes";
import BaseApplication from "../BaseApplication";

export default abstract class BasePlugin {
    _logger: Logger;
    app: BaseApplication;
    config: any;

    constructor(app: BaseApplication, config: any) {
        this.app = app;
        this.config = config;
        this._logger = createLogger(`Plugins/${this.name}`, 'debug', this.app.logger);

    }

    get logger(): Logger {
        return this._logger;
    }

    get name() {
        return "unamed plugin";
    }

    get version() {
        return "1.0";
    }

    async register(app: BaseApplication) {
        this.app = app;

        return await this.setup();
    }

    abstract listen(scope: Scopes, app: any): void;

    abstract setup(): void;

    async validateConfig(): Promise<boolean> {
        return true
    }

    /**
     * Return list of scopes
     */
    scopes(): Scopes[] {
        return [];
    }
}
