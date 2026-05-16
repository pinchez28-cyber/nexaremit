export function createAuditEvent({ action, user, status, metadata = {} }) {
  return {
    id: `audit_${Date.now()}`,
    action,
    status,
    userId: user?.id || "anonymous",
    metadata,
    createdAt: new Date().toISOString()
  };
}
