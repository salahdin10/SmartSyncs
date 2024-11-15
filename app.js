const express = require('express');
const path = require('path');
const admin = require('./routers/admin');
const { default: mongoose } = require('mongoose');
const { env } = require('process');
const login = require('./routers/login');
const signup = require('./routers/signup');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { log } = require('console');
const User = require('./db/user');
const courses = require('./routers/courses');
const { CourseModel } = require('./db/courses');
const { getDownloadURL, ref } = require('firebase/storage');
const { Store } = require('./modules/firebase');
const app = express();
require('dotenv').config();

app.use(express.json())
app.use(express.static(__dirname  + 'public'))
app.use(express.urlencoded())
app.use(cookieParser(process.env.Cookie));

app.set('view engine', 'ejs');
app.set("views",__dirname + "/views");

mongoose.connect(env?.DB_LINK, { dbName: "SmartSync" }).then(() => console.log('the database is ready'));

app.use((req, res, next) => {
    const token = req.cookies.authToken;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SEC);
            req.user = decoded;
        } catch (err) {
            next();
        }
    }
    next();
});

app.get('/', async (req, res, next) => {
    var cards = await CourseModel.find({}).select({
        title: 1,
        stars: 1,
        time_in_house: 1,
        skill_level: 1,
        cost: 1,
        cover: 1,
    }).limit(8);
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
    res.render("index", { cards: cards });
});
app.get('/index', (req, res, next) => {
    res.redirect('/')
});
app.get('/about', (req, res, next) => {
    res.render('about')
});
app.get('/contact', (req, res, next) => {
    res.render('contact')
});
app.get('/user', async (req, res, next) => {
    var message = req.query.message || '';
    if (req.user) {
        var user = await User.findById(req.user.id).select({username: 1, email: 1});
        if(!user) {
            res.redirect('/login')
            return 0;
        }
        var { username, email} = user
        res.render('user', { username, email, message})
    } else {
        res.redirect('/login')
    }
});
app.use('/courses', courses);
app.use('/login', login);
app.use('/admin', admin);
app.use('/signup', signup);


app.get('/404', (req, res, next) => {
    res.render('404');
});
app.use((req, res, next) => {
    res.redirect('/404');
});

module.exports = app;