import * as fs from 'fs';
import * as path from 'path';
import {createLogger, Logger} from "../CreateLogger";
import {EventEmitter} from "events";
import BasePlugin from "./BasePlugin";
import Scopes from "./Scopes";
import BaseApplication from "../BaseApplication";

export default class PluginManager extends EventEmitter {
    logger: Logger;
    app: BaseApplication;
    plugins: Map<string, BasePlugin>

    constructor(app: any) {
        super();

        this.logger = createLogger('PluginManager', 'debug', app.logger);
        this.logger.debug('Starting plugin manager');
        this.app = app;
        this.plugins = new Map<string, BasePlugin>();
    }

    async registerPlugins(plugins: any[]) {
        if (!Array.isArray(plugins)) {
            return new Error("Plugins isn't an array");
        }

        for (const pluginConfig of plugins) {
            if ("config" in pluginConfig && "path" in pluginConfig) {
                this.logger.debug(`Trying to load ${pluginConfig.path}`);
                try {
                    if (!fs.existsSync(pluginConfig.path)) {
                        this.logger.debug(`${pluginConfig.path} seems to not exists`);
                        return;
                    }

                    const plugin = (await import(path.resolve(pluginConfig.path))).default;
                    this.logger.debug(`Loaded ${plugin.name} plugin, registering it`);
                    await this.registerPlugin(new plugin(this.app, pluginConfig.config) as BasePlugin);
                } catch (e: any) {
                    this.logger.error(`Error while loading ${pluginConfig.name} : ${e.message}`);
                }
            }
        }

        this.logger.debug("All plugins registered");
    }

    async registerPlugin(plugin: BasePlugin) {
        if (plugin.name in this.plugins) {
            return new Error('Plugin already registered');
        }

        if (!await plugin.validateConfig()) {
            this.logger.error(`Error while loading ${plugin.name} : configuration not valid`);
            return new Error('Configuration not valid');
        }

        this.plugins.set(plugin.name, plugin);
        this.on("listen", (scope: Scopes, object) => {
            if (plugin.scopes().indexOf(scope) !== -1) {
                this.logger.info(`Registering ${plugin.name} for ${scope} scope`);
                plugin.listen(scope, object);
            }
        });


        return await plugin.register(this.app);
    }
}

module.exports = PluginManager;
