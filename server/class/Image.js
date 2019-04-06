"use strict";

const path = require('path');
const fs = require('fs-extra');
const async = require('async');
const im = require('imagemagick');

const File = require('./File');
const config = require('../config');

class Image {


    static getUrl() {
        return ['/images', ...arguments].join('/')
    }

    constructor(image) {
        this.hash = image.hash || null;
        this.originalName = image.originalname || image.name || image.filename || null;
        this.files = {};
    }

    toJSON() {

        const url = Image.getUrl(this.hash);
        const files = Object.keys(this.files).map((sizeName) => {
            const file = this.files[sizeName];
            return {
                ...file.toJSON(),
                id: sizeName,
                url: Image.getUrl(this.hash, sizeName)
            }
        }).sort(function (a, b) {
            return a.size - b.size;
        });

        return {
            hash: this.hash,
            originalName: this.originalName,
            originalUrl: url,
            files
        }
    }

    static convert(from, sizeKb, callback) {

        if (!from.hash)
            return callback(new Error('no hash'));

        if (from.size <= sizeKb * 1000)
            return callback();

        const dirPath = path.join(config.dirFilePath, from.hash);
        const filename = path.join(sizeKb + 'kb_' + from.name); //WARNING: check Tree.loadHash regex

        const filepath = path.join(dirPath, filename);

        const file = new File({
            name: filename,
            path: filepath,
            mimetype: 'image/jpeg',
            size: sizeKb * 1000
        });

        async.auto({
            mkdir: (cb) => fs.ensureDir(dirPath, cb),
            convert: ['mkdir', (res, cb) => {
                const exist = fs.existsSync(filepath);
                if (exist)
                    return cb(null, false);
                im.convert([
                        from.path,
                        '-define', 'jpeg:extent=' + sizeKb + 'kb',
                        filepath
                    ],
                    (err) => {
                        if (err)
                            cb(err);
                        else {
                            // console.log('resize', from.name, 'size (Mb):', (from.size / 1000000).toFixed(2), '->', (sizeKb / 1000000).toFixed(2));
                            cb(null, true);
                        }
                    })
            }],
            size: ['convert', (res, cb) => file.getSize(cb, true)],
            checkResult: ['size', (res, cb) => {
                const errorFactor = 1.2;
                if (res.convert && res.size > (errorFactor * sizeKb * 1000))
                    cb(new Error(`error resize file ${from.name} - ask ${sizeKb}kb get ${parseInt(res.size / 1000)}kb`));
                else
                    cb()
            }]
        }, (err) => {
            if (err)
                fs.removeSync(file.path);
            callback(err)
        })
    }
}

module.exports = Image;