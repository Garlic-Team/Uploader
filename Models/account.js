const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    username: { type: String, required: true },
    secret: { type: String, required: true },
    fakeLink: { type: String, required: true, default: "https://upload.garlic-team.tk" },
    embedTitle: { type: String, required: true, default: "Garlic Uploader" },
    embedDescription: { type: String, required: true, default: "Garlic Uploader Desc {date}" },
    embedColor: { type: String, required: true, default: "#eb4034"}
})

module.exports = mongoose.model('account', schema)