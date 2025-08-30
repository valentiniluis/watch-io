const mongoose = require('mongoose');

const MovieType = {
  id: {
    required: true,
    type: Number
  },
  title: String,
  poster_path: String,
  vote_average: Number,
  release_date: String,
  onWatchlist: Boolean,
  isLiked: Boolean,
  selectionCount: Number,
  isNotInterested: Boolean
}


const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  movies: {
    required: true,
    default: [],
    type: [MovieType]
  }
});


export default mongoose.model('User', userSchema);
