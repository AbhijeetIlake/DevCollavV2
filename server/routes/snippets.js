import express from 'express';
import Snippet from '../models/Snippet.js';

const router = express.Router();

// GET /api/snippets
router.get('/', async (req, res) => {
  try {
    const { userId, isPublic } = req.query;
    let query = {};

    if (isPublic === 'true') {
      // Public filter: only public snippets
      query.isPublic = true;
    } else if (isPublic === 'false' && userId) {
      // Private filter: only current user's private snippets
      query.userId = userId;
      query.isPublic = false;
    } else if (userId) {
      // All filter: current user's private + all public
      query.$or = [{ userId }, { isPublic: true }];
    }

    const snippets = await Snippet.find(query).sort({ updatedAt: -1 });
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/snippets/:id
router.get('/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
    res.json(snippet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/snippets
router.post('/', async (req, res) => {
  try {
    const { userId, title, code, lang, isPublic, description = '', tags = [] } = req.body;

    if (!userId || !title || !code) {
      return res.status(400).json({ error: 'Missing required fields: userId, title, or code' });
    }

    const snippet = new Snippet({
      userId,
      title,
      description,
      code,
      lang: lang || 'javascript',
      isPublic: Boolean(isPublic),
      tags: Array.isArray(tags) ? tags : [],
    });

    await snippet.save();
    res.status(201).json(snippet);
  } catch (error) {
    console.error('Error saving snippet:', error);
    res.status(500).json({ error: 'Backend error while saving snippet' });
  }
});

// PUT /api/snippets/:id
router.put('/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
    res.json(snippet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/snippets/:id
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
    if (snippet.userId !== userId) return res.status(403).json({ error: 'Unauthorized to delete this snippet' });

    await Snippet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
