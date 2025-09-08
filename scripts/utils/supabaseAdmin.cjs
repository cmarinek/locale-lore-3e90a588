#!/usr/bin/env node

/**
 * Supabase Admin Client Utilities
 * 
 * This module provides admin-level access to Supabase with service role key
 * for seeding operations, user management, and storage operations.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

let adminClient = null;

/**
 * Get or create admin Supabase client with service role key
 * @returns {Object} Supabase admin client
 */
function getAdminClient() {
  if (!adminClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is required');
    }

    if (!supabaseServiceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    }

    adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Admin Supabase client initialized');
  }

  return adminClient;
}

/**
 * Get user ID by email address using admin privileges
 * @param {string} email - User email address
 * @returns {Promise<string|null>} User ID or null if not found
 */
async function getUserIdByEmail(email) {
  const client = getAdminClient();

  try {
    // Try using auth.admin.getUserByEmail if available
    if (client.auth.admin && client.auth.admin.getUserByEmail) {
      const { data, error } = await client.auth.admin.getUserByEmail(email);
      
      if (error) {
        console.warn(`⚠️  Could not get user by email using admin method: ${error.message}`);
        return null;
      }
      
      return data?.user?.id || null;
    }

    // Fallback: List users with pagination and filter by email
    console.log('📄 Using pagination method to find user by email...');
    
    let page = 1;
    const perPage = 1000;
    
    while (true) {
      const { data, error } = await client.auth.admin.listUsers({
        page,
        perPage
      });

      if (error) {
        console.error(`❌ Error listing users (page ${page}): ${error.message}`);
        return null;
      }

      if (!data.users || data.users.length === 0) {
        break;
      }

      // Find user with matching email
      const user = data.users.find(u => u.email === email);
      if (user) {
        return user.id;
      }

      // If we got less than perPage results, we've reached the end
      if (data.users.length < perPage) {
        break;
      }

      page++;
    }

    return null;

  } catch (error) {
    console.error(`❌ Error getting user by email: ${error.message}`);
    return null;
  }
}

/**
 * Storage passthrough methods using admin client
 */
const storage = {
  /**
   * Upload file to storage bucket
   * @param {string} bucketName - Storage bucket name
   * @param {string} path - File path in bucket
   * @param {Buffer|File} file - File data to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async upload(bucketName, path, file, options = {}) {
    const client = getAdminClient();
    return await client.storage.from(bucketName).upload(path, file, options);
  },

  /**
   * Download file from storage bucket
   * @param {string} bucketName - Storage bucket name
   * @param {string} path - File path in bucket
   * @returns {Promise<Object>} Download result
   */
  async download(bucketName, path) {
    const client = getAdminClient();
    return await client.storage.from(bucketName).download(path);
  },

  /**
   * Get public URL for file
   * @param {string} bucketName - Storage bucket name
   * @param {string} path - File path in bucket
   * @returns {Object} Public URL result
   */
  getPublicUrl(bucketName, path) {
    const client = getAdminClient();
    return client.storage.from(bucketName).getPublicUrl(path);
  },

  /**
   * List files in storage bucket
   * @param {string} bucketName - Storage bucket name
   * @param {string} path - Directory path to list (optional)
   * @param {Object} options - List options
   * @returns {Promise<Object>} List result
   */
  async list(bucketName, path = '', options = {}) {
    const client = getAdminClient();
    return await client.storage.from(bucketName).list(path, options);
  },

  /**
   * Delete file from storage bucket
   * @param {string} bucketName - Storage bucket name
   * @param {Array<string>} paths - File paths to delete
   * @returns {Promise<Object>} Delete result
   */
  async remove(bucketName, paths) {
    const client = getAdminClient();
    return await client.storage.from(bucketName).remove(paths);
  },

  /**
   * Copy file within storage
   * @param {string} bucketName - Storage bucket name
   * @param {string} fromPath - Source path
   * @param {string} toPath - Destination path
   * @returns {Promise<Object>} Copy result
   */
  async copy(bucketName, fromPath, toPath) {
    const client = getAdminClient();
    return await client.storage.from(bucketName).copy(fromPath, toPath);
  }
};

module.exports = {
  getAdminClient,
  getUserIdByEmail,
  storage
};