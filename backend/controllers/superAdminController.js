const Tenant = require('../models/Tenant');
const asyncHandler = require('express-async-handler');
const { generateTenantDBConnection } = require('../config/db');

// @desc    Get all tenants
// @route   GET /api/super-admin/tenants
// @access  Private/SuperAdmin
exports.getTenants = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status } = req.query;
  
  const query = {};
  
  if (search) {
    query.$or = [
      { companyName: { $regex: search, $options: 'i' } },
      { domain: { $regex: search, $options: 'i' } },
      { contactEmail: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status) {
    query['subscription.status'] = status;
  }
  
  const [tenants, count] = await Promise.all([
    Tenant.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v'),
    Tenant.countDocuments(query)
  ]);
  
  res.json({
    success: true,
    count: tenants.length,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: tenants
  });
});

// @desc    Get single tenant
// @route   GET /api/super-admin/tenants/:id
// @access  Private/SuperAdmin
exports.getTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id).select('-__v');
  
  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: 'Tenant not found'
    });
  }
  
  res.json({
    success: true,
    data: tenant
  });
});

// @desc    Create new tenant
// @route   POST /api/super-admin/tenants
// @access  Private/SuperAdmin
exports.createTenant = asyncHandler(async (req, res) => {
  const { companyName, domain, contactEmail, subscription } = req.body;
  
  // Check if domain is already taken
  const existingTenant = await Tenant.findOne({ 
    $or: [
      { domain },
      { 'subscription.stripeCustomerId': subscription?.stripeCustomerId }
    ]
  });
  
  if (existingTenant) {
    return res.status(400).json({
      success: false,
      message: 'Domain or customer ID already in use'
    });
  }
  
  // Create tenant
  const tenant = await Tenant.create({
    companyName,
    domain,
    contactEmail,
    subscription: {
      plan: subscription?.plan || 'free',
      status: subscription?.status || 'trial',
      trialEnds: subscription?.trialEnds || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
      ...subscription
    },
    isActive: true,
    isVerified: true
  });
  
  // Create tenant database
  try {
    await generateTenantDBConnection(tenant._id);
  } catch (error) {
    console.error('Error creating tenant database:', error);
    await Tenant.findByIdAndDelete(tenant._id);
    throw new Error('Failed to initialize tenant database');
  }
  
  res.status(201).json({
    success: true,
    data: tenant
  });
});

// @desc    Update tenant
// @route   PUT /api/super-admin/tenants/:id
// @access  Private/SuperAdmin
exports.updateTenant = asyncHandler(async (req, res) => {
  const { subscription, ...updateData } = req.body;
  
  const tenant = await Tenant.findById(req.params.id);
  
  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: 'Tenant not found'
    });
  }
  
  // Update subscription if provided
  if (subscription) {
    tenant.subscription = {
      ...tenant.subscription.toObject(),
      ...subscription
    };
  }
  
  // Update other fields
  Object.assign(tenant, updateData);
  
  await tenant.save();
  
  res.json({
    success: true,
    data: tenant
  });
});

// @desc    Delete tenant
// @route   DELETE /api/super-admin/tenants/:id
// @access  Private/SuperAdmin
exports.deleteTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  
  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: 'Tenant not found'
    });
  }
  
  // In a real app, you might want to archive instead of delete
  await tenant.remove();
  
  // Here you would also want to handle:
  // 1. Deleting the tenant's database
  // 2. Cleaning up any cloud resources
  // 3. Handling any billing-related cleanup
  
  res.json({
    success: true,
    data: {}
  });
});

// @desc    Suspend tenant
// @route   PUT /api/super-admin/tenants/:id/suspend
// @access  Private/SuperAdmin
exports.suspendTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  
  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: 'Tenant not found'
    });
  }
  
  tenant.isActive = false;
  tenant.subscription.status = 'suspended';
  await tenant.save();
  
  // Here you would also want to:
  // 1. Notify the tenant
  // 2. Log the suspension
  
  res.json({
    success: true,
    data: tenant
  });
});

// @desc    Reactivate tenant
// @route   PUT /api/super-admin/tenants/:id/reactivate
// @access  Private/SuperAdmin
exports.reactivateTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  
  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: 'Tenant not found'
    });
  }
  
  tenant.isActive = true;
  tenant.subscription.status = 'active';
  await tenant.save();
  
  // Here you would also want to:
  // 1. Notify the tenant
  // 2. Log the reactivation
  
  res.json({
    success: true,
    data: tenant
  });
});

// @desc    Get tenant statistics
// @route   GET /api/super-admin/stats
// @access  Private/SuperAdmin
exports.getStats = asyncHandler(async (req, res) => {
  const [
    totalTenants,
    activeTenants,
    trialTenants,
    payingTenants,
    suspendedTenants
  ] = await Promise.all([
    Tenant.countDocuments(),
    Tenant.countDocuments({ isActive: true }),
    Tenant.countDocuments({ 'subscription.status': 'trial' }),
    Tenant.countDocuments({ 
      'subscription.status': 'active',
      'subscription.plan': { $ne: 'free' } 
    }),
    Tenant.countDocuments({ 'subscription.status': 'suspended' })
  ]);
  
  // Get recent signups (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentSignups = await Tenant.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });
  
  // Get plans distribution
  const plans = await Tenant.aggregate([
    { $group: { _id: '$subscription.plan', count: { $sum: 1 } } }
  ]);
  
  res.json({
    success: true,
    data: {
      totalTenants,
      activeTenants,
      trialTenants,
      payingTenants,
      suspendedTenants,
      recentSignups,
      plans
    }
  });
});
