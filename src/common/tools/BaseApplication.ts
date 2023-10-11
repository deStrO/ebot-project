import { Hookable } from 'hookable'
import {createLogger, Logger} from './CreateLogger';
import PluginManager from './Plugins/PluginManager';

export default abstract class BaseApplication extends Hookable {
    config: any;
    logger: Logger;
    plugins: PluginManager;

    constructor(config: any) {
        super();

        this.config = config;
        this.logger = createLogger(this.config.logger.name, this.config.logger.level ?? 'debug');
        this.plugins = new PluginManager(this);
    }
}
