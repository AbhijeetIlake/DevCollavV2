import express from 'express';
import Snippet from '../models/Snippet.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { userId, isPublic } = req.query;
    let query = {};

    if (userId) {
      query.userId = userId;
    }

    if (isPublic === 'true') {
      query.isPublic = true;
    } else if (userId) {
      query.$or = [{ userId }, { isPublic: true }];
    }

    const snippets = await Snippet.find(query).sort({ updatedAt: -1 });
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json(snippet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const snippet = new Snippet(req.body);
    await snippet.save();
    res.status(201).json(snippet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json(snippet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    if (snippet.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this snippet' });
    }

    await Snippet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
