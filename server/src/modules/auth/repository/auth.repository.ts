import { db } from '../../../database/index.js';
import { users, tenants, roles, userRoles, permissions, rolePermissions } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export class AuthRepository {
  async findUserByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  async findUserById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async createUser(userData: typeof users.$inferInsert) {
    const [newUser] = await db.insert(users).values(userData).returning();
    return newUser;
  }

  async updateUser(id: string, updateData: Partial<typeof users.$inferInsert>) {
    const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  async createTenant(tenantData: typeof tenants.$inferInsert) {
    const [newTenant] = await db.insert(tenants).values(tenantData).returning();
    return newTenant;
  }

  async findTenantById(id: string) {
    const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
    return result[0] || null;
  }

  async findRoleByName(name: string) {
    const result = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
    return result[0] || null;
  }

  async createRole(roleData: typeof roles.$inferInsert) {
    const [newRole] = await db.insert(roles).values(roleData).returning();
    return newRole;
  }

  async assignRoleToUser(userId: string, roleId: string) {
    await db.insert(userRoles).values({ userId, roleId }).onConflictDoNothing();
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const result = await db
      .select({ roleName: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));
    return result.map((r) => r.roleName);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const result = await db
      .select({ permissionName: permissions.name })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(userRoles.userId, userId));
    return Array.from(new Set(result.map((r) => r.permissionName)));
  }
}
