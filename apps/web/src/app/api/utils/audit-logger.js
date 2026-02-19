import sql from '@/app/api/utils/sql';

/**
 * Audit Logger - Track all belangrijke wijzigingen in de app
 * 
 * Gebruik:
 * await logAudit(session, 'CREATE', 'shift', shiftId, null, newShift, request);
 * await logAudit(session, 'UPDATE', 'employee', empId, oldData, newData, request);
 * await logAudit(session, 'DELETE', 'shift', shiftId, oldData, null, request);
 */

/**
 * Log een audit entry
 * 
 * @param {Object} session - Auth session object (from auth())
 * @param {string} action - 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'REJECT'
 * @param {string} entityType - 'shift', 'employee', 'swap', 'assignment', 'client', etc.
 * @param {string|number} entityId - ID van de entity
 * @param {Object|null} beforeData - Data voor wijziging (voor UPDATE/DELETE)
 * @param {Object|null} afterData - Data na wijziging (voor CREATE/UPDATE)
 * @param {Request} request - HTTP request object (voor IP en user agent)
 */
export async function logAudit(
  session,
  action,
  entityType,
  entityId,
  beforeData = null,
  afterData = null,
  request = null
) {
  try {
    // Skip audit logging if no session (shouldn't happen for authenticated actions)
    if (!session?.user?.id) {
      console.warn('[Audit] No session provided, skipping audit log');
      return;
    }

    // Get user role
    const userRoleRows = await sql`
      SELECT role FROM user_roles WHERE user_id = ${session.user.id} LIMIT 1
    `;
    const userRole = userRoleRows[0]?.role || 'unknown';

    // Extract IP and user agent from request
    let ipAddress = null;
    let userAgent = null;

    if (request) {
      // Try to get real IP (behind proxy)
      ipAddress =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';

      userAgent = request.headers.get('user-agent') || 'unknown';
    }

    // Build changes object for UPDATE actions
    let changes = null;
    if (action === 'UPDATE' && beforeData && afterData) {
      changes = {
        before: sanitizeData(beforeData),
        after: sanitizeData(afterData),
        diff: getDiff(beforeData, afterData)
      };
    } else if (action === 'CREATE' && afterData) {
      changes = {
        created: sanitizeData(afterData)
      };
    } else if (action === 'DELETE' && beforeData) {
      changes = {
        deleted: sanitizeData(beforeData)
      };
    }

    // Insert audit log
    await sql`
      INSERT INTO audit_logs (
        user_id,
        user_email,
        user_role,
        action,
        entity_type,
        entity_id,
        changes,
        ip_address,
        user_agent
      ) VALUES (
        ${session.user.id},
        ${session.user.email || 'unknown'},
        ${userRole},
        ${action},
        ${entityType},
        ${entityId?.toString() || null},
        ${changes ? JSON.stringify(changes) : null},
        ${ipAddress},
        ${userAgent}
      )
    `;

    console.log(`[Audit] ${action} ${entityType} ${entityId} by ${session.user.email}`);
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('[Audit] Failed to log audit entry:', error);
  }
}

/**
 * Sanitize data - verwijder gevoelige velden
 */
function sanitizeData(data) {
  if (!data || typeof data !== 'object') return data;

  const sensitive = ['password', 'password_hash', 'two_factor_secret', 'access_token', 'refresh_token'];
  const sanitized = { ...data };

  for (const key of sensitive) {
    if (key in sanitized) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Get diff tussen before en after data
 * Returns alleen de velden die gewijzigd zijn
 */
function getDiff(before, after) {
  if (!before || !after) return null;

  const diff = {};
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const beforeVal = before[key];
    const afterVal = after[key];

    // Skip if values are the same
    if (JSON.stringify(beforeVal) === JSON.stringify(afterVal)) {
      continue;
    }

    diff[key] = {
      from: beforeVal,
      to: afterVal
    };
  }

  return Object.keys(diff).length > 0 ? diff : null;
}

/**
 * Get audit logs voor een specifieke entity
 * 
 * @param {string} entityType - Type entity
 * @param {string|number} entityId - ID van entity
 * @param {number} limit - Max aantal logs (default 50)
 */
export async function getAuditLogs(entityType, entityId, limit = 50) {
  try {
    const logs = await sql`
      SELECT 
        id,
        user_email,
        user_role,
        action,
        entity_type,
        entity_id,
        changes,
        ip_address,
        timestamp
      FROM audit_logs
      WHERE entity_type = ${entityType}
        AND entity_id = ${entityId?.toString()}
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;

    return logs;
  } catch (error) {
    console.error('[Audit] Failed to get audit logs:', error);
    return [];
  }
}

/**
 * Get audit logs voor een user
 * 
 * @param {string} userId - User ID
 * @param {number} limit - Max aantal logs (default 100)
 */
export async function getUserAuditLogs(userId, limit = 100) {
  try {
    const logs = await sql`
      SELECT 
        id,
        user_email,
        action,
        entity_type,
        entity_id,
        changes,
        timestamp
      FROM audit_logs
      WHERE user_id = ${userId}
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;

    return logs;
  } catch (error) {
    console.error('[Audit] Failed to get user audit logs:', error);
    return [];
  }
}

/**
 * Get recent audit logs (voor admin dashboard)
 * 
 * @param {number} limit - Max aantal logs (default 100)
 * @param {string} action - Filter op action type (optional)
 */
export async function getRecentAuditLogs(limit = 100, action = null) {
  try {
    let query;

    if (action) {
      query = sql`
        SELECT 
          id,
          user_email,
          user_role,
          action,
          entity_type,
          entity_id,
          changes,
          timestamp
        FROM audit_logs
        WHERE action = ${action}
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT 
          id,
          user_email,
          user_role,
          action,
          entity_type,
          entity_id,
          changes,
          timestamp
        FROM audit_logs
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `;
    }

    const logs = await query;
    return logs;
  } catch (error) {
    console.error('[Audit] Failed to get recent audit logs:', error);
    return [];
  }
}

/**
 * Search audit logs
 * 
 * @param {Object} filters - Search filters
 * @param {string} filters.userId - Filter by user
 * @param {string} filters.action - Filter by action
 * @param {string} filters.entityType - Filter by entity type
 * @param {Date} filters.startDate - Filter by start date
 * @param {Date} filters.endDate - Filter by end date
 * @param {number} limit - Max results
 */
export async function searchAuditLogs(filters = {}, limit = 100) {
  try {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      values.push(filters.userId);
    }

    if (filters.action) {
      conditions.push(`action = $${paramIndex++}`);
      values.push(filters.action);
    }

    if (filters.entityType) {
      conditions.push(`entity_type = $${paramIndex++}`);
      values.push(filters.entityType);
    }

    if (filters.startDate) {
      conditions.push(`timestamp >= $${paramIndex++}`);
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      conditions.push(`timestamp <= $${paramIndex++}`);
      values.push(filters.endDate);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const query = `
      SELECT 
        id,
        user_email,
        user_role,
        action,
        entity_type,
        entity_id,
        changes,
        ip_address,
        timestamp
      FROM audit_logs
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${paramIndex}
    `;

    values.push(limit);

    const logs = await sql(query, values);
    return logs;
  } catch (error) {
    console.error('[Audit] Failed to search audit logs:', error);
    return [];
  }
}

export default {
  logAudit,
  getAuditLogs,
  getUserAuditLogs,
  getRecentAuditLogs,
  searchAuditLogs
};
