import { createClerkClient } from '@clerk/backend';
import { connectDB } from './db.js';
import Water from './models/Water.js';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});

async function getUserId(req) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  try {
    const { sub } = await clerkClient.verifyToken(token);
    return sub;
  } catch {
    return null;
  }
}

async function getOrCreateDoc(clerkId) {
  let doc = await Water.findOne({ clerkId });
  if (!doc) doc = await Water.create({ clerkId });
  return doc;
}

export default async function handler(req) {
  await connectDB();

  const url = new URL(req.url);
  const path = url.pathname;

  const userId = await getUserId(req);
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Accept CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // GET /api/water
    if (path === '/api/water' && req.method === 'GET') {
      const doc = await getOrCreateDoc(userId);
      return resJson({ goal: doc.goal, ml: doc.ml, days: doc.days });
    }

    // GET /api/water/day/:date
    const dayMatch = path.match(/^\/api\/water\/day\/(\d{4}-\d{2}-\d{2})$/);
    if (dayMatch && req.method === 'GET') {
      const date = dayMatch[1];
      const doc = await getOrCreateDoc(userId);
      const day = doc.days.find(d => d.date === date);
      return resJson({ date, count: day ? day.count : 0 });
    }

    // PUT /api/water/day/:date
    if (dayMatch && req.method === 'PUT') {
      const date = dayMatch[1];
      const { count } = await req.json();
      const doc = await getOrCreateDoc(userId);
      const idx = doc.days.findIndex(d => d.date === date);
      if (idx >= 0) doc.days[idx].count = count;
      else doc.days.push({ date, count });
      await doc.save();
      return resJson({ date, count });
    }

    // PUT /api/water/settings
    if (path === '/api/water/settings' && req.method === 'PUT') {
      const { goal, ml } = await req.json();
      const doc = await getOrCreateDoc(userId);
      if (goal !== undefined) doc.goal = goal;
      if (ml !== undefined) doc.ml = ml;
      await doc.save();
      return resJson({ goal: doc.goal, ml: doc.ml });
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

function resJson(data) {
  return Response.json(data, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}
