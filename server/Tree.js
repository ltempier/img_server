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

        fs.readdirSync(imageDirPath).forEach((filename) => {

            const filepath = path.join(imageDirPath, filename);
            const stat = fs.statSync(filepath);
            if (stat.isFile()) {

                if (!image.originalName)
                    image.originalName = filename.replace(/^\d+kb_/, '');

                let convert = filename.match(/^((\d*)kb)_/);
                if (convert && convert.length === 3)
                    convert = convert[1];
                else
                    convert = "original";

                image.files[convert] = new File({
                    path: filepath,
                    filename: filename,
                    size: stat.size
                })
            }
        });

        this.images[hash] = image
    }

    appendImage(hash, image) {
        this.images[hash] = image
    }

    appendFile(hash, key, file) {
        this.images[hash].files[key] = file
    }

    all() {
        return Object.values(this.images)
    }

    get(hash) {
        return (this.images[hash] || null)
    }
}


module.exports = Store;