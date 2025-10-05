import express from 'express';
import Snippet from '../models/Snippet.js';
import Workspace from '../models/Workspace.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const totalSnippets = await Snippet.countDocuments({ userId });
    const publicSnippets = await Snippet.countDocuments({ userId, isPublic: true });
    const privateSnippets = await Snippet.countDocuments({ userId, isPublic: false });

    const ownedWorkspaces = await Workspace.countDocuments({ ownerId: userId });
    const collaboratingWorkspaces = await Workspace.countDocuments({
      'collaborators.userId': userId
    });

    const recentSnippets = await Snippet.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentWorkspaces = await Workspace.find({
      $or: [
        { ownerId: userId },
        { 'collaborators.userId': userId }
      ]
    })
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalSnippets,
        publicSnippets,
        privateSnippets,
        ownedWorkspaces,
        collaboratingWorkspaces,
        totalWorkspaces: ownedWorkspaces + collaboratingWorkspaces
      },
      recentSnippets,
      recentWorkspaces
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
