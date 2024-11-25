const { Router } = require("express");
const formidable = require("formidable");
const { insertDocument, CourseModel } = require("../db/courses");
const { uploadBytes, ref } = require("firebase/storage");
const admin = Router();
const fs = require('fs');
const { Store } = require("../modules/firebase");
const path = require("path");
const User = require("../db/user");
require('dotenv').config();

admin.use(async (req, res, next) => {
    const validEmails = process.env.ValidEmails.split(' ');
    if (!req.user) return res.redirect('/404');
    var user = await User.findById(req.user.id);
    if (!validEmails.includes(user.email)) return res.redirect('/404');
    next();
})

admin.get('/', async (req, res, next) => {
    var cards = await CourseModel.find({}).select({
        title: 1,
    });
    res.render('admin', {cards});
});
admin.post('/delete', async (req, res, next) => {
    if (Object.values(req.body).length == 0) return res.send("nothing to delete!");
    Object.values(req.body).forEach(async v => {
        await CourseModel.findByIdAndDelete(v);
    });
    res.send("deleting is done!");
});
admin.post('/', async (req, res, next) => {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
        for (const key in fields) {
            fields[key] = fields[key][0];
        }
        for (const key in files) {
            fields['cover'] = 'cover/' + files[key][0].newFilename + path.extname(files[key][0].originalFilename);
            await uploadBytes(ref(Store, fields['cover']), fs.readFileSync(files[key][0].filepath));
        }
        insertDocument(fields)
        res.redirect('/admin')
    });
});

module.exports = admin