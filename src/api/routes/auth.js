const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');

/**
 * @openapi
 * /api/auth/admin/login:
 *   post:
 *     summary: Admin portal login (tenant_id = null users only)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@example.com }
 *               password: { type: string, example: Passw0rd@1 }
 *     responses:
 *       200:
 *         description: Admin login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/admin/login', ctrl.adminLogin);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: User portal login (tenant-scoped users)
 *     tags: [Auth]
 *     description: Tenant resolved from X-Tenant-Name header or origin port
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: user@example.com }
 *               password: { type: string, example: Passw0rd@1 }
 *     responses:
 *       200:
 *         description: User login successful
 *       400:
 *         description: Tenant context required
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', ctrl.userLogin);

module.exports = router;
