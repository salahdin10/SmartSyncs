const { Router } = require("express");
const courses = Router();
const { CourseModel } = require("../db/courses");
const { getDownloadURL, ref } = require("firebase/storage");
const { Store } = require("../modules/firebase");
require("dotenv").config();

courses.get("/", async (req, res, next) => {
    var cards = await CourseModel.find({}).select({
        title: 1,
        stars: 1,
        time_in_house: 1,
        skill_level: 1,
        cost: 1,
        cover: 1,
    });
    if (!cards) cards = "There's no course to present";
    else {
        cards = await Promise.all(cards.map(async (course) => {
            const fileRef = ref(Store, course.cover);
            const downloadURL = await getDownloadURL(fileRef);
            return {
                ...course.toObject(),
                cover: downloadURL,
            };
        }));
    }
    res.render("courses", { cards: cards });
});
courses.get('/:id', async (req, res) => {
    
    if (!req.params.id) return res.redirect('/404')
    try {
        var card = await CourseModel.findById(req.params.id);
        if (!card) return res.redirect('/404')
        card.cover = await getDownloadURL(ref(Store, card.cover));
        res.render('single', { card });
    } catch (error) {
        return res.redirect('/404')
    }
})

module.exports = courses;
