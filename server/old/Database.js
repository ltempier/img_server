const Datastore = require('nedb');

let instance = null;

class Database extends Datastore {

    constructor() {
        if (instance) {
            // console.log('get Database.instance')
            return instance;
        }
        // console.log('create new Database() instance')

        super({filename: './.datastore', autoload: true});
        instance = this;
    }

    hashExist(hash, cb) {
        this.find(hash, function (err, docs) {
            if (err)
                cb(err);
            else
                cb(null, docs.length > 0)
        })
    }

}


module.exports = Database;

