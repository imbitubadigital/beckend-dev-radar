const mongoosse = require('mongoose');

const PointSchema = new mongoosse.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true,
    },
    coordinates: {
        type: [Number],
        required: true,
    }
});

module.exports = PointSchema;