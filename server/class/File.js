"use strict";

const _ = require('lodash');
const async = require('async');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');


class File {

    constructor(file) {
        this.name = file.originalname || file.name || file.filename || null;
        this.path = file.path || null;
        this.mimetype = file.mimetype || null;
        this.size = file.size || null;
        this.hash = file.hash || null;
    }

    toJSON() {
        return {
            name: this.name,
            size: this.size
        }
    }

    moveTo(newPath, callback) {
        async.series([
            (cb) => fs.ensureDir(path.dirname(newPath), cb),
            (cb) => fs.move(this.path, newPath, {overwrite: true}, cb)
        ], (err) => {
            if (err)
                callback(err);
            else {
                this.path = newPath;
                callback(null, this)
            }
        })
    }

    getHash(callback, force) {

        if (this.hash && !(force === true))
            return callback(null, this.hash);

        const hash = crypto.createHash('sha1');
        const stream = fs.createReadStream(this.path);

        stream.on('data', function (data) {
            hash.update(data, 'utf8')
        });

        stream.on('error', function (error) {
            callback(error)
        });

        stream.on('end', () => {
            this.hash = hash.digest('hex');
            callback(null, this.hash)
        });
    }

    getSize(callback, force) {
        if (_.isFunction(callback))
            return callback(null, this.getSize(force));

        force = callback;

        if (this.size && !(force === true))
            return this.size;
        else {
            const stats = fs.statSync(this.path);
            this.size = stats.size;
            return this.size
        }
    }
}

module.exports = File;