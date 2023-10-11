import {Queue} from "./queue.interface";
import {createClient, RedisClientOptions, RedisClientType} from 'redis';

enum RedisConfigurationMode {
    SERVER = 'server',
    CHANNEL = 'channel'
}

interface RedisConfiguration {
    connection: RedisClientOptions,
    mode: RedisConfigurationMode,
    channelName?: string
}

export default class RedisQueue implements Queue {
    declare client: RedisClientType;
    declare config: RedisConfiguration;

    async setup(config: RedisConfiguration) {
        /** @ts-ignore-next-line */
        this.client = createClient(config.connection);
        await this.client.connect();
        this.config = config;

        if (config.mode === RedisConfigurationMode.CHANNEL) {
            if (config.channelName === null) {
                throw new Error('Channel name is empty for redis');
            }
        }
    }

    async dispatch(serverIp: string, content: any) {
        // @ts-ignore
        await this.client.lPush(this.config.mode === RedisConfigurationMode.SERVER ? serverIp : this.config.channelName, this.config.mode === RedisConfigurationMode.CHANNEL ? serverIp+'---'+content : content);
    }
}
