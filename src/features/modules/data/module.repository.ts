import type {
  AuthRoleComponent,
  AuthSession,
} from "@/src/features/auth/domain/auth.types";
import type {
  ModuleIconName,
  ModuleKey,
  ModuleViewModel,
} from "@/src/features/modules/domain/module.types";

const MOBILE_MODULE_KEYS: Readonly<Record<string, ModuleKey>> = {
  incident: "incidents",
  "incident / sub incident type": "incidents",
  "work request": "work-assigned",
  "work assigned": "work-assigned",
  "view and report incidents": "incidents",
};

const FALLBACK_ICONS: Record<ModuleKey, ModuleIconName> = {
  "work-assigned": "check-square",
  incidents: "alert-triangle",
};
const DEFAULT_MODULE_ICON: ModuleIconName = "grid";

const BACKEND_ICON_MAP: Readonly<Record<string, ModuleIconName>> = {
  "alert-triangle": "alert-triangle",
  briefcase: "briefcase",
  "check-square": "check-square",
  cog: "tool",
  grid: "grid",
  list: "list",
  wrench: "tool",
};

const isPermittedHomeModule = (component: AuthRoleComponent): boolean => {
  const hasDirectAccess = component.hasAccess || component.permissions.length > 0;
  const hasChildAccess = component.children.some(child => isPermittedHomeModule(child));
  return hasDirectAccess || hasChildAccess;
};

const getModuleKey = (component: AuthRoleComponent): ModuleKey | null =>
  MOBILE_MODULE_KEYS[component.componentName.trim().toLocaleLowerCase()] ?? null;

const getModuleIcon = (
  component: AuthRoleComponent,
  moduleKey: ModuleKey | null,
): ModuleIconName => {
  const backendIcon = (component.mobileIcon ?? component.icon)
    ?.trim()
    .toLocaleLowerCase()
    .replace(/^pi\s+pi-/, "");
  if (!backendIcon) {
    return moduleKey ? FALLBACK_ICONS[moduleKey] : DEFAULT_MODULE_ICON;
  }
  return BACKEND_ICON_MAP[backendIcon] ??
    (moduleKey ? FALLBACK_ICONS[moduleKey] : DEFAULT_MODULE_ICON);
};

const mapComponentToModule = (
  component: AuthRoleComponent,
  moduleKey: ModuleKey | null,
): ModuleViewModel => ({
  id: component.id,
  key: moduleKey,
  title: component.componentName,
  description: component.description?.trim() || component.moduleName,
  iconName: getModuleIcon(component, moduleKey),
  children: component.children
    .filter(isPermittedHomeModule)
    .sort((a, b) => a.orderNo - b.orderNo)
    .map(child => mapComponentToModule(child, getModuleKey(child))),
});

export class ModuleRepository {
  async getPermittedModules(session: AuthSession): Promise<ModuleViewModel[]> {
    return session.roleComponents
      .filter(isPermittedHomeModule)
      .sort(
        (firstComponent, secondComponent) =>
          firstComponent.orderNo - secondComponent.orderNo,
      )
      .map((component) =>
        mapComponentToModule(component, getModuleKey(component)),
      );
  }
}

export const moduleRepository = new ModuleRepository();

