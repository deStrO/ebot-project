import ConfigParser from './common/tools/ConfigParser';
import Application from './logs-receiver/Application';
import {program} from 'commander';

(async () => {
    program
        .name('eBot Log Receiver')
        .description('Application to receive and dispatch logs through defined queues')
        .version('4.0.0-beta')
        .argument('[configFile]', 'The config file to use (json or yaml)', 'configs/logs-receiver.json')
        .action(async (configFile: string) => {
            const configParser = new ConfigParser();
            const config = configParser.parse(configFile, __dirname+'/logs-receiver/config-schema.json');
            if (config) {
                const application = new Application(config);
                await application.setup();
            } else {
                console.error('Failed to parse the configuration file');
                console.log(configParser.errors.map((error: any) => error.message).join("\r\n"));
            }
        });

    program.parse();
})();


