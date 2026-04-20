const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: List orders for a tenant
 *     tags: [Order]
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
 *         description: Paginated order list with summary counts
 *   post:
 *     summary: Create an order
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tenant_id, product_id, quantity]
 *             properties:
 *               tenant_id: { type: integer }
 *               product_id: { type: integer }
 *               quantity: { type: integer }
 *     responses:
 *       200:
 *         description: Created order (status is Created or Pending based on inventory)
 */
router.get('/', ctrl.list);
router.post('/', ctrl.create);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Get order detail
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order detail with product and inventory info
 *   delete:
 *     summary: Delete an order
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 * /api/orders/{id}/confirm:
 *   patch:
 *     summary: Confirm an order (deducts inventory)
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Confirmed order
 *       400:
 *         description: Insufficient inventory
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Cancelled order
 */
router.get('/:id', ctrl.getById);
router.delete('/:id', ctrl.delete);
router.patch('/:id/confirm', ctrl.confirm);
router.patch('/:id/cancel', ctrl.cancel);

module.exports = router;
