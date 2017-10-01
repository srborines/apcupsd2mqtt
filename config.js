module.exports = require('yargs')
    .env('APCUPSD2MQTT')
    .usage('Usage: $0 [options]')
    .describe('mqtt-url', 'mqtt broker url.')
    .describe('name', 'topic prefix')
    .describe('ups-name', 'UPS Name. Is overwritten if apcupsd supplies a name')
    .describe('interval', 'Interval in seconds to poll apcaccess')
    .describe('verbosity', 'possible values: "error", "warn", "info", "debug"')
    .alias({
        h: 'help',
        i: 'interval',
        m: 'mqtt-url',
        n: 'name',
        u: 'ups-name',
        v: 'verbosity'
    })
    .default({
        interval: 10,
        mqttUrl: 'mqtt://127.0.0.1',
        name: 'ups',
        upsName: 'ups',
        verbosity: 'info'
    })
    .version()
    .help('help')
    .argv;
