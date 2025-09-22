import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Base function to create an audit log
 */
export const createAuditLog = async ({ userId, action, entity, entityId, details }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        action,
        entity,
        entityId,
        details,
      },
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
};

/**
 * Log CREATE / DELETE (or simple actions)
 */
export const logUserAction = async ({ reqUser, action, entity, target }) => {
  const actor = {
    id: reqUser?.id ?? null,
    name: reqUser?.name ?? "System",
    email: reqUser?.email ?? null,
  };

  const targetData = {
    id: target?.id ?? null,
    name: target?.name ?? null,
    email: target?.email ?? null,
  };

  let summary = "";
  if (action === "CREATE") {
    summary = `Created ${entity} (ID ${targetData.id})`;
  } else if (action === "DELETE") {
    summary = `Deleted ${entity} (ID ${targetData.id})`;
  } else {
    summary = `${action} ${entity} (ID ${targetData.id})`;
  }

  const details = {
    action,
    actor,
    target: targetData,
    message: `${actor.email || "System"} ${summary}`,
    summary,
  };

  return createAuditLog({
    userId: actor.id,
    action,
    entity,
    entityId: target?.id ?? null,
    details,
  });
};

/**
 * Log UPDATE with field-level diff
 */
export const logUpdateAction = async ({ reqUser, entity, entityId, oldData, newData }) => {
  const actor = {
    id: reqUser?.id ?? null,
    email: reqUser?.email ?? "System",
  };

  const changes = [];
  for (const key in newData) {
    if (newData[key] !== oldData[key]) {
      changes.push({
        field: key,
        old: oldData[key] ?? null,
        new: newData[key] ?? null,
      });
    }
  }

  const summary =
    changes.length > 0
      ? `Updated ${entity} (ID ${entityId})`
      : `Attempted update on ${entity} (ID ${entityId}), no changes`;

  const details = {
    action: "UPDATE",
    entity,
    entityId,
    actor,
    changes,
    message: `${actor.email || "System"} ${summary}`,
    summary,
  };

  return createAuditLog({
    userId: reqUser?.id ?? null,
    action: "UPDATE",
    entity,
    entityId,
    details,
  });
};
