var mongoose = require('mongoose');

const MongoDB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/short_urls';

mongoose.Promise = global.Promise;
mongoose.connect(MongoDB_URI);

module.exports = {mongoose};
