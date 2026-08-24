import type {
  AuthSession,
} from "@/src/features/auth/domain/auth.types";
import { createAuthenticatedHeaders } from "@/src/features/auth/data/authenticated-headers";
import type {
  ModuleIconName,
  ModuleKey,
  ModuleViewModel,
} from "@/src/features/modules/domain/module.types";
import { executeJsonRequest } from "@/src/utils/api-client";

const API_BASE_URL = "http://34.100.253.156/fom-api";
const ROLE_COMPONENT_PAGE_LIMIT = 500;

const MOBILE_MODULE_KEYS: Readonly<Record<string, ModuleKey>> = {
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

interface RoleComponentDto {
  id: string;
  componentName: string;
  moduleName: string;
  componentType: string;
  description: string | null;
  routeLink: string | null;
  icon: string | null;
  orderNo: number;
  availableActions: string[];
  assignedActions: string[];
  hasAccess: boolean;
  children: RoleComponentDto[];
}

interface RoleComponentResponseDto {
  status: string;
  data: RoleComponentDto[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isNullableString = (value: unknown): value is string | null =>
  typeof value === "string" || value === null;

const isRoleComponentDto = (value: unknown): value is RoleComponentDto =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.componentName === "string" &&
  typeof value.moduleName === "string" &&
  typeof value.componentType === "string" &&
  isNullableString(value.description) &&
  isNullableString(value.routeLink) &&
  isNullableString(value.icon) &&
  typeof value.orderNo === "number" &&
  isStringArray(value.availableActions) &&
  isStringArray(value.assignedActions) &&
  typeof value.hasAccess === "boolean" &&
  Array.isArray(value.children) &&
  value.children.every(isRoleComponentDto);

const isRoleComponentResponseDto = (
  value: unknown,
): value is RoleComponentResponseDto =>
  isRecord(value) &&
  typeof value.status === "string" &&
  Array.isArray(value.data) &&
  value.data.every(isRoleComponentDto);

const flattenComponents = (
  components: readonly RoleComponentDto[],
): RoleComponentDto[] =>
  components.flatMap((component) => [
    component,
    ...flattenComponents(component.children),
  ]);

const getModuleKey = (component: RoleComponentDto): ModuleKey | null =>
  MOBILE_MODULE_KEYS[component.componentName.trim().toLocaleLowerCase()] ?? null;

const getModuleIcon = (
  component: RoleComponentDto,
  moduleKey: ModuleKey | null,
): ModuleIconName => {
  const backendIcon = component.icon
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
  component: RoleComponentDto,
  moduleKey: ModuleKey | null,
): ModuleViewModel => ({
  id: component.id,
  key: moduleKey,
  title: component.componentName,
  description: component.description?.trim() || component.moduleName,
  iconName: getModuleIcon(component, moduleKey),
});

export class ModuleRepository {
  async getPermittedModules(session: AuthSession): Promise<ModuleViewModel[]> {
    const { response, body } = await executeJsonRequest({
      url: API_BASE_URL + "/roleComponent/search-roleComponent",
      method: "POST",
      headers: {
        ...createAuthenticatedHeaders(session),
        "Content-Type": "application/json",
      },
      body: {
        page: 1,
        limit: ROLE_COMPONENT_PAGE_LIMIT,
        filters: { roleId: session.user.roleId },
      },
    });
    if (!response.ok) {
      throw new Error("Module access could not be loaded.");
    }
    if (!isRoleComponentResponseDto(body)) {
      throw new Error("The module access response was incomplete.");
    }

    return flattenComponents(body.data)
      .filter(
        (component) =>
          component.hasAccess || component.assignedActions.length > 0,
      )
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
