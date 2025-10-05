import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Workspace from '../models/Workspace.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};

    if (userId) {
      query.$or = [
        { ownerId: userId },
        { 'collaborators.userId': userId }
      ];
    }

    const workspaces = await Workspace.find(query).sort({ updatedAt: -1 });
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:workspaceId', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ workspaceId: req.params.workspaceId });
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const workspaceId = uuidv4();
    const workspace = new Workspace({
      ...req.body,
      workspaceId
    });
    await workspace.save();
    res.status(201).json(workspace);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:workspaceId', async (req, res) => {
  try {
    const workspace = await Workspace.findOneAndUpdate(
      { workspaceId: req.params.workspaceId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    res.json(workspace);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:workspaceId/collaborators', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ workspaceId: req.params.workspaceId });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const { userId, username } = req.body;

    const alreadyCollaborator = workspace.collaborators.some(
      collab => collab.userId === userId
    );

    if (alreadyCollaborator) {
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    workspace.collaborators.push({ userId, username });
    await workspace.save();

    res.json(workspace);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:workspaceId/collaborators/:userId', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ workspaceId: req.params.workspaceId });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    workspace.collaborators = workspace.collaborators.filter(
      collab => collab.userId !== req.params.userId
    );

    await workspace.save();
    res.json(workspace);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:workspaceId/snippets', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ workspaceId: req.params.workspaceId });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    workspace.snippets.push(req.body);
    await workspace.save();

    res.json(workspace);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:workspaceId/snippets/:snippetId', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ workspaceId: req.params.workspaceId });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    workspace.snippets = workspace.snippets.filter(
      snippet => snippet._id.toString() !== req.params.snippetId
    );

    await workspace.save();
    res.json(workspace);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:workspaceId', async (req, res) => {
  try {
    const { userId } = req.query;
    const workspace = await Workspace.findOne({ workspaceId: req.params.workspaceId });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (workspace.ownerId !== userId) {
      return res.status(403).json({ error: 'Only the workspace owner can delete this workspace' });
    }

    await Workspace.findOneAndDelete({ workspaceId: req.params.workspaceId });
    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
