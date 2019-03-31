const fs = require("fs-extra");
const path = require("path");

const config = require('./config');
const Image = require("./Image");
const File = require("./File");

let instance = null;

class Store {

    constructor() {
        if (instance)
            return instance;
        instance = this;

        this.images = {};
        this.load(true);
    }

    load(reset) {
        console.time('load');
        fs.ensureDirSync(config.dirFilePath);

        if (reset === true)
            this.images = {};

        fs.readdirSync(config.dirFilePath).forEach((hash) => {
            const stat = fs.statSync(path.join(config.dirFilePath, hash));
            if (stat.isDirectory())
                this.loadHash(hash)
        });

        console.timeEnd('load')
    }

    loadHash(hash) {

        let image = new Image({hash});
        const imageDirPath = path.join(config.dirFilePath, hash);

        if (fs.existsSync(imageDirPath)) {
            fs.readdirSync(imageDirPath).forEach((filename) => {
                const filepath = path.join(imageDirPath, filename);
                const stat = fs.statSync(filepath);
                if (stat.isFile()) {
                    if (!image.originalName)
                        image.originalName = filename.replace(/^\d+kb_/, '');
                    if (!image.timestamp)
                        image.timestamp = stat.ctimeMs;

                    let convert = filename.match(/^((\d*)kb)_/);

                    if (convert && convert.length === 3)
                        convert = convert[1];
                    else {
                        convert = "original";
                        image.originalName = filename;
                        image.timestamp = stat.ctimeMs
                    }

                    image.files[convert] = new File({
                        path: filepath,
                        filename: filename,
                        size: stat.size
                    })
                }
            });
        }

        if (Object.keys(image.files).length)
            this.images[hash] = image;
        else
            fs.removeSync(imageDirPath)
    }

    all(sortKey, factor) {
        let images = Object.values(this.images);
        if (sortKey)
            return images.sort(function (a, b) {
                try {
                    return (factor || 1) * (a[sortKey] - b[sortKey])
                } catch (e) {
                    return 0
                }
            });
        return images
    }

    get(hash) {
        return (this.images[hash] || null)
    }

    delete(hash, convert) {
        if (this.images[hash] && this.images[hash].files && this.images[hash].files[convert]) {
            fs.removeSync(this.images[hash].files[convert].path);
            this.loadHash(hash);
            return true
        }
        return false
    }
}


module.exports = Store;