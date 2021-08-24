const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/noderest', {useNewUrlParser:true}, { useUnifiedTopology: true }, {useFindAndModify: false});
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

module.exports = mongoose; 