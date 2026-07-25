const express = require('express');
const router = express.Router();
const db = require('./db');

const TABLE_MAP = {
  'mess_messes': 'messes',
  'mess_users': 'users',
  'mess_meals': 'meals',
  'mess_expenses': 'expenses',
  'mess_payments': 'payments',
  'mess_manager_terms': 'manager_terms',
  'mess_cook_bills': 'cook_bills'
};

const KV_KEYS = ['mess_settings', 'mess_meal_settings', 'mess_current_user', 'mess_app_initialized', 'mess_theme', 'mess_language'];

// GET all data on initial load
router.get('/sync', async (req, res) => {
  try {
    const result = {};
    
    // Fetch from all tables
    for (const [key, table] of Object.entries(TABLE_MAP)) {
      const { rows } = await db.query(`SELECT data FROM ${table}`);
      result[key] = rows.map(r => r.data);
    }
    
    // Fetch from KV store
    const { rows: kvRows } = await db.query(`SELECT key, value FROM kv_store`);
    for (const row of kvRows) {
      result[row.key] = row.value;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// POST to sync specific data key (array or object)
router.post('/sync/:key', async (req, res) => {
  const { key } = req.params;
  const data = req.body;

  try {
    if (TABLE_MAP[key]) {
      const table = TABLE_MAP[key];
      const items = Array.isArray(data) ? data : [];
      
      // 1. Upsert all items
      const promises = items.map(item => {
        if (!item.id) return Promise.resolve();
        return db.query(`
          INSERT INTO ${table} (id, data)
          VALUES ($1, $2)
          ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
        `, [item.id, item]);
      });
      await Promise.all(promises);

      // 2. Delete items that are no longer in the array
      const ids = items.map(i => i.id).filter(Boolean);
      if (ids.length > 0) {
        // Construct parameterized query for NOT IN ($1, $2, ...)
        const params = ids.map((_, i) => `$${i + 1}`).join(',');
        await db.query(`DELETE FROM ${table} WHERE id NOT IN (${params})`, ids);
      } else {
        // If array is empty, delete all rows in the table
        await db.query(`DELETE FROM ${table}`);
      }
      
      res.json({ success: true });
    } else if (KV_KEYS.includes(key) || key.startsWith('mess_')) {
      // For any singleton objects, save them to kv_store
      await db.query(`
        INSERT INTO kv_store (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `, [key, data]);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid key' });
    }
  } catch (error) {
    console.error(`Error syncing ${key}:`, error);
    res.status(500).json({ error: 'Failed to sync data' });
  }
});

module.exports = router;
