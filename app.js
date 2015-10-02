var dash_button = require('node-dash-button');
var Nightmare = require('nightmare');

var dashButtonMacAddress = 'dash button mac address';
var username = 'meh.com username';
var password = 'meh.com password';
var site = 'https://meh.com';

var dash = dash_button(dashButtonMacAddress);
var lastPress = new Date(0);

if (process.argv.indexOf('find') !== -1) {
    var pcap = require('pcap');
    var macAddresses = [];

    var int_array_to_hex = function(int_array) {
        var hex = '';

        for (var i in int_array) {
            var h = int_array[i].toString(16); // converting to hex

            if (h.length < 2) {
                h = '0' + h; //adding a 0 for non 2 digit numbers
            }

            if (i !== int_array.length) {
                hex += ':'; //adding a : for all but the last group
            }

            hex += h;
        }

        return hex.slice(1); //slice is to get rid of the leading :
    };

    console.log('Watching for ARP requests on your local network. Let this run for a minute, then press your Amazon Dash button and watch for a new MAC address.');

    pcap.createSession().on('packet', function(raw_packet) {
        var packet = pcap.decode.packet(raw_packet); //decodes the packet

        // ensures it is an arp packet
        if (packet.payload.ethertype === 2054) {
            var macAddress = packet.payload.payload.sender_ha.addr; //getting the hardware address of the possible dash
            macAddress = int_array_to_hex(macAddress);

            if (macAddresses.indexOf(macAddress) === -1) {
                macAddresses.push(macAddress);
                console.log('MAC address found: ', macAddress);
            }
        }
    });
} else {
    console.log('Listening for Amazon Dash button with MAC address ' + dashButtonMacAddress);
}

dash.on('detected', function (){
    if (Date.now() - lastPress > 5000) {
        lastPress = Date.now();
        console.log('dash button pressed');

        new Nightmare()
            .goto(site)
            .wait('.meh-button button')
            .screenshot('10.png')
            .click('.meh-button button')
            .wait('#user')
            .screenshot('20.png')
            .type('#user', username)
            .type('#password', password)
            .click('form button')
            .wait('.meh-button')
            .screenshot('30.png')
            .run(function(err, nightmare) {
                if (err) {
                    return console.log(err);
                }

                console.log('meh button clicked');
            });
    }
});
