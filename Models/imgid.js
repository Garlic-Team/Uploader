const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    id: { type: String, required: true },
    url: { type: String, required: true },
    user: { type: String, required: true },
    size: { type: String, required: true },
    date: { type: String, required: true },
    embedTitle: { type: String, required: true },
    embedDescription: { type: String, required: true },
    embedColor: { type: String, required: true }
})

module.exports = mongoose.model('imgid', schema)