const db = require('../modules/db');
const Router = require('express').Router;
const router = new Router();

async function getTable(req, res) {
    const page = parseInt(req.params.page) * 10 - 10;

    const tables = await db.query('SELECT * FROM tables ORDER BY id LIMIT 10 OFFSET $1', [page]);
    const allTables = await db.query('SELECT * FROM tables');

    if (tables.rows.length < 1) {
        res.json({ message: 'ничего нету', data: null });
        return;
    }
    res.json({ message: 'ok', data: tables.rows, totalCount: allTables.rows.length });
}

router.get('/table/:page', getTable);

module.exports = router;
