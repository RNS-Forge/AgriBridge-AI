import { db } from '../../../database/index.js';
import { users, tenants, roles, userRoles } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
export class AuthRepository {
    async findUserByEmail(email) {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return result[0] || null;
    }
    async findUserById(id) {
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return result[0] || null;
    }
    async createUser(userData) {
        const [newUser] = await db.insert(users).values(userData).returning();
        return newUser;
    }
    async updateUser(id, updateData) {
        const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
        return updatedUser;
    }
    async createTenant(tenantData) {
        const [newTenant] = await db.insert(tenants).values(tenantData).returning();
        return newTenant;
    }
    async findTenantById(id) {
        const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
        return result[0] || null;
    }
    async findRoleByName(name) {
        const result = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
        return result[0] || null;
    }
    async createRole(roleData) {
        const [newRole] = await db.insert(roles).values(roleData).returning();
        return newRole;
    }
    async assignRoleToUser(userId, roleId) {
        await db.insert(userRoles).values({ userId, roleId }).onConflictDoNothing();
    }
    async getUserRoles(userId) {
        const result = await db
            .select({ roleName: roles.name })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(eq(userRoles.userId, userId));
        return result.map((r) => r.roleName);
    }
}
