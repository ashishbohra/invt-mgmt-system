const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventoryController');

/**
 * @openapi
 * /api/inventory:
 *   get:
 *     summary: List inventory for a tenant
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated inventory list with belowThreshold count
 */
router.get('/', ctrl.list);

/**
 * @openapi
 * /api/inventory/{id}:
 *   get:
 *     summary: Get inventory detail by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Inventory detail with product info
 *   patch:
 *     summary: Update stock level
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_inventory]
 *             properties:
 *               current_inventory: { type: integer }
 *     responses:
 *       200:
 *         description: Updated inventory
 *   delete:
 *     summary: Delete inventory record
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.get('/:id', ctrl.getById);
router.patch('/:id', ctrl.updateStock);
router.delete('/:id', ctrl.delete);

module.exports = router;
