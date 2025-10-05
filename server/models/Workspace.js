import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
  workspaceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  ownerId: {
    type: String,
    required: true,
    index: true
  },
  ownerName: {
    type: String,
    required: true
  },
  collaborators: [{
    userId: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  snippets: [{
    title: {
      type: String,
      required: true
    },
    code: {
      type: String,
      default: ''
    },
    lang: {
      type: String,
      default: 'javascript'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
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

workspaceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

workspaceSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

export default Workspace;
