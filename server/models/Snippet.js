import mongoose from 'mongoose';

const snippetSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  code: {
    type: String,
    required: true
  },
  lang: {
    type: String,
    required: true,
    default: 'javascript'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

snippetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Snippet = mongoose.model('Snippet', snippetSchema);

export default Snippet;
