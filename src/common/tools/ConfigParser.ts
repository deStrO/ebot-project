import Ajv from 'ajv';
import * as yaml from 'yaml';
import * as fs from 'fs';

export default class ConfigParser {
    ajv: Ajv;
    errors: any;

    constructor() {
        this.ajv = new Ajv();
    }

    parse(configFile: string, schemaFile: string) {
        let config: any = null;
        if (configFile.endsWith('.json')) {
            config = JSON.parse(fs.readFileSync(configFile).toString());
        } else if (configFile.endsWith('.yaml') || configFile.endsWith('.yml')) {
            config = yaml.parse(fs.readFileSync(configFile).toString());
        } else {
            throw new Error(`${configFile} extension not supported`);
        }

        const schema = JSON.parse(fs.readFileSync(schemaFile).toString());

        const validate = this.ajv.compile(schema);
        if (validate(config)) {
            return config;
        }

        this.errors = validate.errors;
        return null;
    }
}
