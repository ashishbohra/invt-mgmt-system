const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: List products for a tenant
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, sku, category, status, created_at] }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [ASC, DESC] }
 *     responses:
 *       200:
 *         description: Paginated product list
 *   post:
 *     summary: Create a product
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tenant_id, name, sku, category, reorder_threshold, cost_per_unit]
 *             properties:
 *               tenant_id: { type: integer }
 *               name: { type: string }
 *               sku: { type: string }
 *               category: { type: string }
 *               reorder_threshold: { type: integer }
 *               cost_per_unit: { type: number }
 *     responses:
 *       200:
 *         description: Created product with inventory record
 */
router.get('/', ctrl.list);
router.post('/', ctrl.create);

/**
 * @openapi
 * /api/products/active/{tenantId}:
 *   get:
 *     summary: Get active products for a tenant (for order dropdown)
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of active products
 */
router.get('/active/:tenantId', ctrl.getActiveByTenant);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product details
 *   put:
 *     summary: Update a product
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               category: { type: string }
 *               reorder_threshold: { type: integer }
 *               cost_per_unit: { type: number }
 *               status: { type: string, enum: [Active, Inactive] }
 *     responses:
 *       200:
 *         description: Updated product
 *   delete:
 *     summary: Delete a product
 *     tags: [Product]
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
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
