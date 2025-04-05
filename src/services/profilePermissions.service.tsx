export default class ProfilePermissionService {
  private static instance: ProfilePermissionService;
  private permissions: string[];

  constructor() {
    const userStorage = localStorage.getItem("user") || null;
    this.permissions =
      userStorage && JSON.parse(userStorage).canAccess
        ? JSON.parse(userStorage).canAccess.reduce((array: any, item: any) => {
            if (typeof item.permissions == "string") {
              item.permissions = JSON.parse(item.permissions);
            }

            Object.entries(item.permissions || []).forEach(([key, value]) =>
              array.push(`${item.module}-${key}:${value}`)
            );

            return array;
          }, [])
        : null;
  }

  public static getInstance(): ProfilePermissionService {
    if (!ProfilePermissionService.instance) {
      ProfilePermissionService.instance = new ProfilePermissionService();
    }

    return ProfilePermissionService.instance;
  }

  public hasPermission(permission: string|string[]): boolean {
    if (Array.isArray(permission)) {
      return permission.some((perm) => this.permissions.includes(perm));
    }
    return this.permissions.includes(permission);
  }
}
