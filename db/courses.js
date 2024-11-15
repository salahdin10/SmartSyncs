const { Schema, model} = require('mongoose');

const courseSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    stars: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    about: {
        type: String,
        required: true
    },
    skills: [String],
    cover: {
        type: String, // Assuming you'll store the file path
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    time_in_house: {
        type: Number,
        required: true
    },
    lectures: {
        type: Number,
        required: true
    },
    skill_level: {
        type: String,
        required: true,
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    deadline: {
        type: Date,
        required: true
    },
    certificate: {
        type: Boolean,
        required: true
    },
    youtube_link: {
        type: String,
        required: true,
    }
});

async function insertDocument(data) {
    try {
        const insertedData = await CourseModel.create(data);
        return insertedData;
    } catch (error) {
        console.error('Error inserting document:', error);
        throw error;
    }
}

const CourseModel = model('Course', courseSchema);

module.exports = {CourseModel, insertDocument};