var mongoose = require('mongoose');
var validator = require('validator');

var UrlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
    validate: {
      validator: validator.isURL,
      message: '{VALUE} is not a url'
    }
  },
  short_url_index: {
    type: Number,
    required: true
  },
  short_url: {
    type: String,
    required: true
  }
});

var Url = mongoose.model('Url', UrlSchema);

module.exports = {Url};
