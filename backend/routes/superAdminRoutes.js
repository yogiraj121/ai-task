const express = require('express');
const router = express.Router();
const {
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  suspendTenant,
  reactivateTenant,
  getStats
} = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and only accessible by super admins
router.use(protect);
router.use(authorize('super_admin'));

// Tenant management routes
router.route('/tenants')
  .get(getTenants)
  .post(createTenant);

router.route('/tenants/:id')
  .get(getTenant)
  .put(updateTenant)
  .delete(deleteTenant);

router.put('/tenants/:id/suspend', suspendTenant);
router.put('/tenants/:id/reactivate', reactivateTenant);

// Stats and analytics
router.get('/stats', getStats);

module.exports = router;
