# eBot Project

This is the new project that will host all new parts of eBot. 

This project is written in typescript.

This new system will use the same basis for all subprojects of eBot, for now only logs-receiver is available.

## Logs Receiver

This is the first step to the new eBot, it allow to receive the logs sent via CS2 by HTTP, and dispatching it to a queue of your choice.

For now, the only queue supported is redis, but feel free to add other queue system.

To run the logs-receiver, just do `ts-node src/logs-receiver pathToConfigFile.json`

## Configuration

The new system supports yaml and json as config file. You must create a config file in order to start the logs-receiver.

You can start multiple instance of logs-receiver with different config files.

## Plugins

The new eBot platform supports a new way to handle plugins, the plugins can modify and or just listen to events. For now `Logger` and `Mapper` are the two first officials plugins.

### Logger

This plugin allow to store the logs received by the servers into separated files or a single file.

### Mapper

This plugin allow to map the logs from a server to a specific IP.

# Development

This project require `yarn` and `typescript` to be started.

You can use `ts-node` to run on the fly the project to avoid building it each times.
