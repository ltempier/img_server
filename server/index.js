"use strict";

process.env.PORT = process.env.PORT || 1337;
process.env.IP = process.env.IP || "0.0.0.0";

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const multer = require('multer');
const async = require('async');

const config = require('./config');

const File = require('./File');
const Image = require('./Image');
const Tree = require('./Tree');

const app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan(":date[iso] - :method :url :status - :response-time ms"));

app.use(express.static(path.resolve(__dirname, '..', 'client')));
app.use('/node_modules', express.static(path.resolve(__dirname, '..', 'node_modules')));

const upload = multer({
    dest: config.dirTmpPath
    // fileFilter: function (req, file, cb) {
    //     cb(null, true)
    // }
});

app.post('/images', upload.any(), function (req, res) {
    console.log('req.files:', req.files);

    req.files = req.files || [];

    const resizeParams = [
        {name: 'large', kb: 2000},
        {name: 'medium', kb: 1400},
        {name: 'small', kb: 800},
    ];

    let response = [];

    async.eachLimit(req.files, 1, function (file, nextFile) {

        const tmpFile = new File(file);
        const tree = new Tree();

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

                        async.eachLimit(resizeParams, 3, (params, nextSize) => {
                            if (tmpFile.size < params.kb * 1000)
                                return nextSize();

                            image.convert(tmpFile, params, nextSize)
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
        // console.log('post end', ...arguments);
        if (err)
            res.status(500).json(err);
        else if (req.files.length === 0)
            res.sendStatus(400);
        else {
            res.status(200).json(response)
        }
    })
});

app.get('/images/:hash', function (req, res) {

    const tree = new Tree();
    const image = tree.get(req.params.hash);

    if (image)
        res.download(image.files.original.path, image.originalName);
    else
        res.status(404).send('Not Found')
});

app.get('/images/:hash/:size', function (req, res) {
    const tree = new Tree();
    const image = tree.get(req.params.hash);
    if (image && image.files[req.params.size])
        res.redirect('/images/' + req.params.hash + '/' + req.params.size + '/' + image.files[req.params.size].name);
    else if (image)
        res.redirect('/images/' + req.params.hash);
    else
        res.status(404).send('Not Found')
});

app.get('/images/:hash/:size/:name', function (req, res) {
    const tree = new Tree();
    const image = tree.get(req.params.hash);

    if (image && image.files[req.params.size])
        res.download(image.files[req.params.size].path, image.originalName);
    else if (image)
        res.redirect('/images/' + req.params.hash);
    else
        res.status(404).send('Not Found')
});

const api = express.Router();
api.use(function (req, res, next) {
    next()
});

api.get(Image.getUrl(), function (req, res) {
    const tree = new Tree();
    const all = tree.all();
    if (all)
        res.status(200).json(all);
    else
        res.status(404).send('Not Found')
});

api.get(Image.getUrl(':hash'), function (req, res) {
    const tree = new Tree();
    const image = tree.get(req.params.hash);

    if (image)
        res.status(200).json(image);
    else
        res.status(404).send('Not Found')
});

app.use('/api', api);

app.listen(process.env.PORT, process.env.IP, function (err) {
    if (err)
        console.error(err);
    else {
        console.log('server start on', process.env.IP + ':' + process.env.PORT)
    }
});