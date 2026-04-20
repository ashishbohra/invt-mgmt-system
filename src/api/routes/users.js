const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');

/**
 * @openapi
 * /api/users/enums:
 *   get:
 *     summary: Get available roles and portals
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of valid roles and portals
 */
router.get('/enums', ctrl.enums);

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Create a user (public — no auth required)
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, roles, portals]
 *             properties:
 *               tenant_id: { type: integer, nullable: true, example: 1, description: Optional — null for admin users }
 *               name: { type: string, example: John Doe }
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: Passw0rd@1 }
 *               roles:
 *                 type: array
 *                 items: { type: string, enum: [SuperAdmin, Admin, Manager, User, Viewer] }
 *                 example: [Admin]
 *               portals:
 *                 type: array
 *                 items: { type: string, enum: [AdminPortal, UserPortal] }
 *                 example: [AdminPortal, UserPortal]
 *     responses:
 *       200:
 *         description: Created user
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists for this tenant
 */
router.post('/', ctrl.create);

// --- Protected routes below ---

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List users (active only, tenant-scoped)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
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
 *         description: Paginated user list
 *       401:
 *         description: Authentication required
 */
router.get('/', authenticate, ctrl.list);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User details
 *   put:
 *     summary: Update a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
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
 *               tenant_id: { type: integer, nullable: true, description: Assign tenant from UI }
 *               name: { type: string }
 *               email: { type: string }
 *               roles:
 *                 type: array
 *                 items: { type: string, enum: [SuperAdmin, Admin, Manager, User, Viewer] }
 *               portals:
 *                 type: array
 *                 items: { type: string, enum: [AdminPortal, UserPortal] }
 *     responses:
 *       200:
 *         description: Updated user
 *   delete:
 *     summary: Soft delete a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User soft deleted
 * /api/users/{id}/password:
 *   patch:
 *     summary: Change user password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
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
 *             required: [password]
 *             properties:
 *               password: { type: string, example: NewPassw0rd@1 }
 *     responses:
 *       200:
 *         description: Password updated
 */
router.get('/:id', authenticate, ctrl.getById);
router.put('/:id', authenticate, ctrl.update);
router.delete('/:id', authenticate, ctrl.delete);
router.patch('/:id/password', authenticate, ctrl.changePassword);

module.exports = router;
