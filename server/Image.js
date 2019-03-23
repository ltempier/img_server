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
        // let files = [];
        // for (const key in this.files) {
        //     const jsonFile = this.files[key].toJSON();
        //     jsonFile.url = Image.getUrl(this.hash, key);
        //     jsonFile.key = key;
        //     files.push(jsonFile)
        // }
        // files = files.sort((f1, f2) => f1.size - f2.size);

        return {
            hash: this.hash,
            originalName: this.originalName,
            files: this.files,
            url: Image.getUrl(this.hash)
        }
    }

    convert(from, params, callback) {

        if (!this.hash)
            return callback(new Error('no hash'));

        const dirPath = path.join(config.dirFilePath, this.hash);
        const filename = path.join(params.kb + 'kb_' + this.originalName);

        const filepath = path.join(dirPath, filename);

        const file = new File({
            name: filename,
            path: filepath,
            mimetype: 'image/jpeg',
            size: params.kb * 1000
        });

        async.auto({
            mkdir: (cb) => fs.ensureDir(dirPath, cb),
            convert: ['mkdir', (res, cb) => {
                const exist = fs.existsSync(filepath);
                if (exist)
                    return cb(null, false);

                im.convert([
                        from.path,
                        '-define', 'jpeg:extent=' + params.kb + 'kb',
                        filepath
                    ],
                    (err) => {
                        if (err)
                            cb(err);
                        else {
                            // console.log('resize', from.name, 'size (Mb):', (from.size / 1000000).toFixed(2), '->', (params.kb / 1000000).toFixed(2));
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
                this.files[params.kb] = (file);
                callback(null, file)
            }
        })
    }

}


module.exports = Image;