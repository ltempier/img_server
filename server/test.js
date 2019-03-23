"use strict";


const fs = require('fs-extra');
const Tree = require('./Tree');

//
// let db = new Database();
//
// db.find({}, function (err, res) {
//     console.log(JSON.stringify(res, null, 2))
// })
// // db.hashExist('lkjl', function (err, res) {
// //     console.log(err, res)
// // })


// const p = '/Users/laurent/Git/img_server/files/387b19e5962b819aba3f40b77f62adae32ccf153'
// for (var i = 0; i < 5000; i++) {
//     fs.copySync(p, p + i)
// }


let convert = "1400kb_IMG_4170.jpg".match(/^((\d*)kb)_/, 'g');
console.log(convert)

// let tree = new Tree();
// tree.load()
// console.log(JSON.stringify(tree.all(), null, 3))