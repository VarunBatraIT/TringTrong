var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var argv = require('minimist')(process.argv.slice(2));
argv['c'] = argv['c'] || false
if (argv['c'] && parseInt(argv['c']) <= numCPUs) {
    numCPUs = argv['c'] || numCPUs
}
var fs = require('fs');
var localConfig = JSON.parse(fs.readFileSync('config.json', 'utf8'));

var database = localConfig.database;

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died, restarting');
        cluster.fork();
    });
} else {
    var express = require('express')
    var app = express()

    var storageInit = function () {
        if (typeof global.mongoose == 'undefined') {
            global.mongoose = mongoose = require('mongoose');
            global.mongoose.connect('mongodb://localhost/' + database);
            global.Tt = global.mongoose.model('Tt', {
                id: {type: String, index: true},
                data: Object,
                date: { type: Date, default: Date.now }
            });
        }
    }
    var save = function (id, data) {

        storageInit()

        var Ti = global.Tt

        var geo = new Ti({ id: id, data: data, date: global.timeNow });
        geo.save(function (err) {
            if (err) {
                console.log(err);
            }
            console.log('Id saved ' + id);
        });

    }

    var retrive = function (id) {
        storageInit()

        var Ti = global.Tt
        var allEntries = new Array();
        Ti.find({id: id}, function (err, entries) {
            if (err) return res.send(err);
            for (var x = 0; x < entries.length; x++) {
                entry = {
                    id: entries[x].id,
                    data: entries[x].data,
                    date: entries[x].date
                }
                allEntries.push(entry);
            }
            global.res.send(allEntries)
        }, function () {
            global.res.send({})
        })
    }
    var trong = function (id) {
        return retrive(id);
    }

    var tring = function (id, async) {
        var req = global.req;
        var res = global.res;
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//        var ip = '122.161.114.15'
        if (!async) {
            //Declaring it twice for performance reasons
            var geoip = require('geoip-lite');
            var geo = geoip.lookup(ip);
            setTimeout(function () {
                console.log('Direct Lookup')
                save(id, {
                    'geo': geo
                })
            }, 0);
            return ({id: id, data: {geo: geo}, date: global.timeNow});
        } else {
            setTimeout(function () {
                console.log('Delayed Lookup')
                //Declaring it twice for performance reasons
                var geoip = require('geoip-lite');
                var geo = geoip.lookup(ip);
                save(id, {
                    'geo': geo
                })
            }, 0);
        }
        return {};
    }
    app.get('/', function (req, res) {
        res.send('Alive!')
    })

    var post = function (req, res) {
        global.timeNow = new Date().toISOString();
        global.req = req;
        global.res = res;
        var async = req.query['async'] == "false" ? false : true
        tring(req.params["id"], async)
    }
    var get = function (req, res) {
        global.req = req;
        global.res = res;
        trong(req.params["id"])
    }
    // JSONP Based
    app.get('/set/:id', function (req, res) {
        res.send(post(req, res));
    })

    app.get('/get/:id', function (req, res) {
        get(req, res);
    })

    // REST Based
    app.get('/geo/:id', function (req, res) {
        get(req, res);
    })

    app.post('/geo/:id', function (req, res) {
        res.send(post(req, res));
    })


    var server = app.listen(3000, function () {
        var host = server.address().address
        var port = server.address().port
        console.log('App listening at http://%s:%s', host, port)

    })
}
