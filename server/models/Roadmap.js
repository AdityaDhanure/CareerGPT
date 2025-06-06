import mongoose from 'mongoose';

const RoadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId || String, 
    ref: 'User' 
  },
  title: String,
  content: String,
  createdAt: { 
    type: Date, 
    default: Date.now
  },

  versions: [{
    title: String,
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }],
});

export default mongoose.model('Roadmap', RoadmapSchema);
