/**
 * Admin Staff Management
 * Only super admins can create and manage staff accounts
 */

import { supabaseAdmin } from './client';
import { logAuditAction } from './admin';

export interface CreateStaffAccountData {
  email: string;
  full_name: string;
  role: 'admin' | 'moderator' | 'support' | 'analyst';
  permissions: string[];
  temporaryPassword?: string; // Will be generated if not provided
}

/**
 * Create a new admin staff account (Super Admin only)
 */
export async function createStaffAccount(
  data: CreateStaffAccountData,
  superAdminId: string
): Promise<{ data: any; error: any }> {
  try {
    // Verify super admin permission
    const { data: permissions } = await supabaseAdmin
      .from('admin_permissions')
      .select('permission')
      .eq('admin_id', superAdminId)
      .eq('permission', 'super_admin')
      .single();

    if (!permissions) {
      return {
        data: null,
        error: { message: 'Unauthorized. Super admin privileges required.' },
      };
    }

    // Generate temporary password if not provided
    const tempPassword = data.temporaryPassword || generateTemporaryPassword();

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email for staff accounts
      user_metadata: {
        full_name: data.full_name,
        role: 'admin', // All staff are admins
        staff_role: data.role,
      },
    });

    if (authError) {
      return { data: null, error: authError };
    }

    if (!authData.user) {
      return { data: null, error: { message: 'Failed to create user' } };
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        role: 'admin',
        is_verified: true,
      });

    if (profileError) {
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { data: null, error: profileError };
    }

    // Create admin permissions
    const permissionInserts = data.permissions.map(permission => ({
      admin_id: authData.user.id,
      permission,
      granted_by: superAdminId,
    }));

    const { error: permissionError } = await supabaseAdmin
      .from('admin_permissions')
      .insert(permissionInserts);

    if (permissionError) {
      console.error('Error creating permissions:', permissionError);
      // Don't fail the whole operation, but log it
    }

    // Log audit action
    await logAuditAction({
      admin_id: superAdminId,
      action: 'staff_account_created',
      resource_type: 'admin',
      resource_id: authData.user.id,
      changes: {
        email: data.email,
        role: data.role,
        permissions: data.permissions,
      },
    });

    return {
      data: {
        user: authData.user,
        temporaryPassword: tempPassword, // Return for secure transmission
      },
      error: null,
    };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * Update staff account permissions (Super Admin only)
 */
export async function updateStaffPermissions(
  staffId: string,
  permissions: string[],
  superAdminId: string
): Promise<{ data: any; error: any }> {
  try {
    // Verify super admin
    const { data: superAdminPerm } = await supabaseAdmin
      .from('admin_permissions')
      .select('permission')
      .eq('admin_id', superAdminId)
      .eq('permission', 'super_admin')
      .single();

    if (!superAdminPerm) {
      return {
        data: null,
        error: { message: 'Unauthorized. Super admin privileges required.' },
      };
    }

    // Delete existing permissions
    await supabaseAdmin
      .from('admin_permissions')
      .delete()
      .eq('admin_id', staffId);

    // Insert new permissions
    const permissionInserts = permissions.map(permission => ({
      admin_id: staffId,
      permission,
      granted_by: superAdminId,
    }));

    const { error } = await supabaseAdmin
      .from('admin_permissions')
      .insert(permissionInserts);

    if (error) {
      return { data: null, error };
    }

    await logAuditAction({
      admin_id: superAdminId,
      action: 'staff_permissions_updated',
      resource_type: 'admin',
      resource_id: staffId,
      changes: { permissions },
    });

    return { data: { success: true }, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * Deactivate staff account (Super Admin only)
 */
export async function deactivateStaffAccount(
  staffId: string,
  superAdminId: string,
  reason?: string
): Promise<{ data: any; error: any }> {
  try {
    // Verify super admin
    const { data: superAdminPerm } = await supabaseAdmin
      .from('admin_permissions')
      .select('permission')
      .eq('admin_id', superAdminId)
      .eq('permission', 'super_admin')
      .single();

    if (!superAdminPerm) {
      return {
        data: null,
        error: { message: 'Unauthorized. Super admin privileges required.' },
      };
    }

    // Disable auth user
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(staffId, {
      ban_duration: '876000h', // Effectively permanent (100 years)
    });

    if (authError) {
      return { data: null, error: authError };
    }

    await logAuditAction({
      admin_id: superAdminId,
      action: 'staff_account_deactivated',
      resource_type: 'admin',
      resource_id: staffId,
      changes: { reason },
    });

    return { data: { success: true }, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * Get all admin staff (Super Admin only)
 */
export async function getAdminStaff(superAdminId: string) {
  try {
    // Verify super admin
    const { data: superAdminPerm } = await supabaseAdmin
      .from('admin_permissions')
      .select('permission')
      .eq('admin_id', superAdminId)
      .eq('permission', 'super_admin')
      .single();

    if (!superAdminPerm) {
      return {
        data: null,
        error: { message: 'Unauthorized. Super admin privileges required.' },
      };
    }

    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    // Get permissions for each admin
    const staffWithPermissions = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: permissions } = await supabaseAdmin
          .from('admin_permissions')
          .select('permission')
          .eq('admin_id', profile.id);

        return {
          ...profile,
          permissions: permissions?.map(p => p.permission) || [],
          isSuperAdmin: permissions?.some(p => p.permission === 'super_admin') || false,
        };
      })
    );

    return { data: staffWithPermissions, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * Generate a secure temporary password
 */
function generateTemporaryPassword(): string {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => charset[byte % charset.length]).join('');
}

/**
 * Reset staff password (Super Admin only)
 */
export async function resetStaffPassword(
  staffId: string,
  superAdminId: string
): Promise<{ data: { temporaryPassword: string } | null; error: any }> {
  try {
    // Verify super admin
    const { data: superAdminPerm } = await supabaseAdmin
      .from('admin_permissions')
      .select('permission')
      .eq('admin_id', superAdminId)
      .eq('permission', 'super_admin')
      .single();

    if (!superAdminPerm) {
      return {
        data: null,
        error: { message: 'Unauthorized. Super admin privileges required.' },
      };
    }

    const tempPassword = generateTemporaryPassword();

    const { error } = await supabaseAdmin.auth.admin.updateUserById(staffId, {
      password: tempPassword,
    });

    if (error) {
      return { data: null, error };
    }

    await logAuditAction({
      admin_id: superAdminId,
      action: 'staff_password_reset',
      resource_type: 'admin',
      resource_id: staffId,
      changes: {},
    });

    return { data: { temporaryPassword: tempPassword }, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}


