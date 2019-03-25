"use strict";

const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const async = require('async');
const im = require('imagemagick');

const File = require('./File');
const config = require('./config');

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
        const files = Object.keys(this.files).map((sizeKb) => {
            const file = this.files[sizeKb];
            return {
                ...file.toJSON(),
                id: sizeKb,
                url: Image.getUrl(this.hash, sizeKb, file.name)
            }
        }).sort(function (a, b) {
            return a.size - b.size;
        });

        return {
            hash: this.hash,
            originalName: this.originalName,
            url,
            files
        }
    }

    convert(from, sizeKb, callback) {

        if (!this.hash)
            return callback(new Error('no hash'));

        const dirPath = path.join(config.dirFilePath, this.hash);
        const filename = path.join(sizeKb + 'kb_' + this.originalName); //WARNING: check Tree.loadHash regex

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
            // hash: ['convert',  (res, cb) =>  file.getHash(cb, true)],
            size: ['convert', (res, cb) => file.getSize(cb, true)],
        }, (err) => {
            if (err)
                callback(err);
            else {
                this.files[sizeKb] = (file);
                callback(null, file)
            }
        })
    }

}


module.exports = Image;