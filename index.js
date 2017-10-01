const exec = require('child_process').exec;
const Mqtt = require('mqtt');
const log = require('yalm');
const pkg = require('./package.json');
const config = require('./config.js');

log.setLevel(config.verbosity);
log.info(pkg.name + ' version ' + pkg.version + ' starting');

const mqtt = Mqtt.connect(config.url);

mqtt.on('connect', () => {
    log.info('mqtt connected to', config.url);
});

mqtt.on('close', () => {
    log.warn('mqtt connection closed');
});

const datapoints = ['upsname', 'serialno', 'status', 'linev', 'linefreq', 'loadpct', 'battv', 'bcharge'];
const curvalues = {}; // Holds current values
let devicename = config.upsName;

function executeCmd(cmd, callback) {
    exec(cmd, (err, stdout, stderror) => {
        if (err) {
            callback(err);
        } else if (stderror) {
            callback(stderror);
        } else if (stdout) {
            callback(null, stdout);
        } else {
            callback(null, null);
        }
    });
}

function poll() {
    executeCmd('apcaccess', (err, response) => {
        if (err) {
            log.error(err);
        } else {
            log.debug(response);
            const lines = response.trim().split('\n');

            // Loop over every line
            lines.forEach(line => {
                // Assign values
                let [label, value] = line.split(' : ');

                label = label.toLowerCase();
                // Remove surrounding spaces
                label = label.replace(/(^\s+|\s+$)/g, '');
                // If found as wanted value, store it
                if (datapoints.indexOf(label) !== -1) {
                    value = value.replace(/(^\s+|\s+$)/g, '');
                    if (label === 'upsname') {
                        devicename = value;
                    }
                    // Check if value is known, if not store and publish value
                    if (curvalues[label] !== value) {
                        curvalues[label] = value;
                        log.debug(value + ' changed!');
                        // Publish value
                        mqtt.publish(config.name + '/status/' + devicename + '/' + label, value, {retain: true});
                    }
                }
            });
        }
        log.debug(curvalues);
        setTimeout(poll, config.interval);
    });
}

poll();
