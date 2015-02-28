var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var argv = require('minimist')(process.argv.slice(2));
argv['c'] = argv['c'] || false
if (argv['c'] && parseInt(argv['c']) <= numCPUs) {
    numCPUs = argv['c'] || numCPUs
}
var database = 'test'
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
                id: String,
                data: Object
            });
        }
    }
    var save = function (id, data) {

        storageInit()

        var Ti = global.Tt

        var geo = new Ti({ id: id, data: data });
        geo.save(function (err) {
            if (err) {
                console.log(err);
            }
            console.log('Id saved ' + id);
        });

    }

    var get = function (id) {
        storageInit()

        var Ti = global.Tt
        var allEntries = new Array();
        Ti.find({id: id}, function (err, entries) {
            if (err) return res.send(err);
            for (var x = 0; x < entries.length; x++) {
                entry = {
                    id: entries[x].id,
                    data: entries[x].data
                }
                allEntries.push(entry);
            }
            global.res.send(allEntries)
        }, function () {
            global.res.send({})
        })
    }

    var tring = function (id, async) {
        var req = global.req;
        var res = global.res;
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//        var ip = '122.161.114.15'
        if (!async) {
            var geoip = require('geoip-lite');
            var geo = geoip.lookup(ip);
            setTimeout(function () {
                console.log('Direct Lookup')
                save(id, {
                    'geo': geo
                })
            }, 0);
            return ({id: id, data: geo});
        } else {
            setTimeout(function () {
                console.log('Delayed Lookup')
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

    app.get('/set/:id', function (req, res) {
        global.req = req;
        global.res = res;
        var async = req.query['async'] == "false" ? false : true
        res.send(tring(req.params["id"], async));
    })

    app.get('/get/:id', function (req, res) {
        global.req = req;
        global.res = res;
        get(req.params["id"])
    })

    var server = app.listen(3000, function () {
        var host = server.address().address
        var port = server.address().port
        console.log('App listening at http://%s:%s', host, port)

    })
}
