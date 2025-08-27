import rolesData from "../mock/roles.json";

export const roleService = {
  getRoles: () => {
    return Promise.resolve(rolesData.roles);
  },
  getPermissions: () => {
    return Promise.resolve(rolesData.permissions);
  },
  addRole: (role) => {
    rolesData.roles.push({ ...role, id: Date.now() });
    return Promise.resolve(role);
  },
  updateRole: (id, updated) => {
    const index = rolesData.roles.findIndex((r) => r.id === id);
    if (index !== -1) {
      rolesData.roles[index] = { ...rolesData.roles[index], ...updated };
    }
    return Promise.resolve(rolesData.roles[index]);
  },
  deleteRole: (id) => {
    rolesData.roles = rolesData.roles.filter((r) => r.id !== id);
    return Promise.resolve(true);
  },
};
