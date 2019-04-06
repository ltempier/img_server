"use strict";

process.env.PORT = process.env.PORT || 1337;
process.env.IP = process.env.IP || "0.0.0.0";

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const multer = require('multer');
const async = require('async');
const urlLib = require('url');

const config = require('./config');

const File = require('./File');
const Image = require('./Image');
const Tree = require('./Tree');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan(":date[iso] - :method :url :status - :response-time ms"));

app.use(express.static(path.resolve(__dirname, '..', 'client-react', 'build')));

const upload = multer({
    dest: config.dirTmpPath,
    fileFilter: function (req, file, cb) {
        // TODO filter -> only image files
        cb(null, true)
    }
});


function noCorsOrigin(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}

function security(req, res, next) {
    // TODO auth logic
    next()
}

function checkRedirect(req, res, next) {
    try {
        req.query.redirect = parseInt(req.query.redirect || 0)
    } catch (e) {
        req.query.redirect = 0
    }

    if (req.query.redirect > 5)
        return res.status(500).send('Too many redirection');

    req.query.redirect += 1;
    next()
}

app.route('/images')
    .post(noCorsOrigin, security, upload.any(), function (req, res, next) {
        req.files = req.files || [];
        req.body.sizes = (req.body.sizes || "").split(",").map((size) => parseInt(size));
        next()
    }, function (req, res) {

        let response = [];
        const tree = new Tree();

        async.eachLimit(req.files, 2, function (file, nextFile) {
            const tmpFile = new File(file);
            async.auto({
                hash: function (cb) {
                    tmpFile.getHash(cb, true)
                },
                image: ['hash', function (results, callback) {
                    const image = new Image({
                        hash: results.hash,
                        name: tmpFile.name
                    });

                    async.series({
                        convert: function (cb) {
                            async.eachLimit(req.body.sizes, 3, (sizeKb, nextSize) => {
                                Image.convert(tmpFile, sizeKb, (err) => {
                                    if (err)
                                        console.log(err.message);
                                    nextSize()
                                })
                            }, cb)
                        },
                        move: function (cb) {
                            const dirPath = path.join(config.dirFilePath, results.hash);
                            const filepath = path.join(dirPath, tmpFile.name);
                            tmpFile.moveTo(filepath, (err, originalFile) => {
                                if (err)
                                    cb(err);
                                else {
                                    image.files["original"] = originalFile;
                                    cb()
                                }
                            })
                        },
                        save: function (cb) {
                            tree.loadHash(results.hash);
                            cb()
                        }
                    }, (err) => callback(err, image))
                }],
                end: ['hash', 'image', function (results, callback) {
                    response.push(tree.get(results.hash));
                    callback()
                }]
            }, nextFile)
        }, function (err) {
            if (err)
                res.status(500).json(err);
            else if (req.files.length === 0)
                res.sendStatus(400);
            else {
                res.status(200).json(response)
            }
        })
    })
    .get(function (req, res, next) {
        req.query = req.query || {};
        req.query.sortBy = req.query.sortBy || "timestamp";
        req.query.sort = req.query.sort || "desc";
        req.query.limit = parseInt(req.query.limit || 0);
        req.query.from = parseInt(req.query.from || 0);
        next()
    }, function (req, res) {
        const tree = new Tree();
        let all = tree.all(req.query.sortBy, req.query.sort === "asc" ? 1 : -1);
        if (all) {
            if (!isNaN(req.query.from) && req.query.from > 0)
                all = all.slice(req.query.from);
            if (!isNaN(req.query.limit) && req.query.limit > 0)
                all = all.slice(0, req.query.limit);
            res.status(200).json(all);
        }
        else
            res.status(404).send('Not Found')
    });

app.get('/images/:hash', noCorsOrigin, checkRedirect, function (req, res) {
    const tree = new Tree();
    const image = tree.get(req.params.hash);
    if (image)
        res.redirect(urlLib.format({
            pathname: '/images/' + req.params.hash + '/original/',
            query: req.query
        }));
    else
        res.status(404).send('Not Found')
});


app.route('/images/:hash/:size')
    .get(noCorsOrigin, checkRedirect, function (req, res) {
        const tree = new Tree();
        const image = tree.get(req.params.hash);
        if (image) {
            if (image.files[req.params.size])
                res.redirect(urlLib.format({
                    pathname: '/images/' + req.params.hash + '/' + req.params.size + '/' + image.files[req.params.size].name,
                    query: req.query
                }));
            else
                res.redirect(urlLib.format({
                    pathname: '/images/' + req.params.hash + '/original/' + image.originalName,
                    query: req.query
                }));
        }
        else
            res.status(404).send('Not Found')
    })
    .delete(security, function (req, res) {
        const tree = new Tree();
        const done = tree.delete(req.params.hash, req.params.size);
        if (done)
            res.status(200).send('done');
        else
            res.status(404).send('Not Found')
    });

app.get('/images/:hash/:size/:name', noCorsOrigin, checkRedirect, function (req, res) {
    const tree = new Tree();
    const image = tree.get(req.params.hash);

    if (image) {
        if (image.files[req.params.size])
            res.download(image.files[req.params.size].path, req.params.name);
        else
            res.redirect(urlLib.format({
                pathname: '/images/' + req.params.hash + '/original/' + image.originalName,
                query: req.query
            }));
    }
    else
        res.status(404).send('Not Found')
});

app.get('*', (req, res) => {
    console.log('*')
    res.sendFile(path.resolve(__dirname, '..', 'client-react', 'build', 'index.html'));
});

app.listen(process.env.PORT, process.env.IP, function (err) {
    if (err)
        console.error(err);
    else {
        console.log('server start on', process.env.IP + ':' + process.env.PORT)
    }
});