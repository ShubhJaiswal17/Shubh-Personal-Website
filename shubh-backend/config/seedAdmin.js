'use strict';

const User = require('../models/User');

/**
 * seedAdmin — auto-create or promote the admin user from env vars.
 *
 * Called once on server startup, after connectDB().
 *
 * Behaviour:
 *   ADMIN_EMAIL + ADMIN_PASSWORD set → checks DB:
 *     • No user found        → creates admin with role 'admin' + all permissions true
 *     • User exists, not admin → promotes to admin + all permissions true
 *     • User exists, is admin  → skips (logs confirmation)
 *   Either env var missing → skips silently
 */
const ALL_PERMISSIONS = {
  managePosts:      true,
  manageCategories: true,
  manageProjects:   true,
  manageComments:   true,
  manageNewsletter: true,
  manageMessages:   true,
  viewAnalytics:    true,
  manageUsers:      true,
};

async function seedAdmin() {
  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name     = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    // No env vars → nothing to seed
    return;
  }

  try {
    const existing = await User.findOne({ email }).select('+password');

    if (!existing) {
      // Create new admin
      await User.create({
        name,
        email,
        password,
        role: 'admin',
        permissions: ALL_PERMISSIONS,
      });
      console.log(`✅ Admin seeded: ${email}`);
      return;
    }

    if (existing.role !== 'admin') {
      // Promote existing user to admin
      existing.role = 'admin';
      existing.permissions = ALL_PERMISSIONS;
      await existing.save({ validateBeforeSave: false });
      console.log(`✅ Existing user promoted to admin: ${email}`);
      return;
    }

    // Already an admin — ensure permissions are all true
    let needsUpdate = false;
    for (const [key, val] of Object.entries(ALL_PERMISSIONS)) {
      if (existing.permissions?.[key] !== val) {
        needsUpdate = true;
        break;
      }
    }
    if (needsUpdate) {
      existing.permissions = ALL_PERMISSIONS;
      await existing.save({ validateBeforeSave: false });
      console.log(`✅ Admin permissions synced: ${email}`);
    } else {
      console.log(`✅ Admin already exists: ${email}`);
    }
  } catch (err) {
    console.error('❌ Admin seed error:', err.message);
  }
}

module.exports = seedAdmin;
