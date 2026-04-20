const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tenantController');

/**
 * @openapi
 * /api/tenants:
 *   get:
 *     summary: List all tenants
 *     tags: [Tenant]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated tenant list
 *   post:
 *     summary: Create a tenant
 *     tags: [Tenant]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Created tenant
 *       409:
 *         description: Duplicate tenant name
 */
router.get('/', ctrl.list);
router.post('/', ctrl.create);

/**
 * @openapi
 * /api/tenants/{id}:
 *   get:
 *     summary: Get tenant by ID
 *     tags: [Tenant]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tenant details
 *   put:
 *     summary: Update a tenant
 *     tags: [Tenant]
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
 *               status: { type: string, enum: [Active, Inactive] }
 *     responses:
 *       200:
 *         description: Updated tenant
 *   delete:
 *     summary: Delete a tenant
 *     tags: [Tenant]
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
