import { Router } from 'express';
import { getAuth } from '@clerk/express';
import Water from '../models/Water.js';

const router = Router();

async function getOrCreateDoc(clerkId) {
  let doc = await Water.findOne({ clerkId });
  if (!doc) {
    doc = await Water.create({ clerkId });
  }
  return doc;
}

function requireAuth(req, res, next) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.auth = { userId };
  next();
}

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const doc = await getOrCreateDoc(req.auth.userId);
    res.json({ goal: doc.goal, ml: doc.ml, days: doc.days });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/day/:date', async (req, res) => {
  try {
    const doc = await getOrCreateDoc(req.auth.userId);
    const day = doc.days.find(d => d.date === req.params.date);
    res.json({ date: req.params.date, count: day ? day.count : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/day/:date', async (req, res) => {
  try {
    const { count } = req.body;
    const doc = await getOrCreateDoc(req.auth.userId);
    const idx = doc.days.findIndex(d => d.date === req.params.date);
    if (idx >= 0) {
      doc.days[idx].count = count;
    } else {
      doc.days.push({ date: req.params.date, count });
    }
    await doc.save();
    res.json({ date: req.params.date, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { goal, ml } = req.body;
    const doc = await getOrCreateDoc(req.auth.userId);
    if (goal !== undefined) doc.goal = goal;
    if (ml !== undefined) doc.ml = ml;
    await doc.save();
    res.json({ goal: doc.goal, ml: doc.ml });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
