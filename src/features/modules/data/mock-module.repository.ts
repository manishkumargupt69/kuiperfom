import type { ModuleRepository } from "@/src/features/modules/data/module.repository";
import type {
  ModuleDto,
  ModuleViewModel,
  PermissionDto,
} from "@/src/features/modules/domain/module.types";

const MOCK_DELAY_MILLISECONDS = 400;

const MOCK_MODULES: readonly ModuleDto[] = [
  {
    key: "work-assigned",
    title: "Work assigned",
    description: "Review tasks, update progress, and attach field evidence.",
    permissionCode: "FOM_WORK_ASSIGNED_VIEW",
    displayOrder: 1,
  },
  {
    key: "incidents",
    title: "Incidents",
    description: "Report an incident and follow its current status.",
    permissionCode: "FOM_INCIDENTS_VIEW",
    displayOrder: 2,
  },
];

const MOCK_PERMISSIONS: readonly PermissionDto[] = [
  { code: "FOM_WORK_ASSIGNED_VIEW", canView: true },
  { code: "FOM_INCIDENTS_VIEW", canView: true },
];

const waitForMockResponse = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, MOCK_DELAY_MILLISECONDS);
  });
};

const hasViewPermission = (
  module: ModuleDto,
  permissions: readonly PermissionDto[],
): boolean =>
  permissions.some(
    (permission) =>
      permission.code === module.permissionCode && permission.canView,
  );

const mapModuleDtoToViewModel = (
  module: ModuleDto,
  index: number,
): ModuleViewModel => ({
  key: module.key,
  title: module.title,
  description: module.description,
  sequenceLabel: String(index + 1).padStart(2, "0"),
});

export class MockModuleRepository implements ModuleRepository {
  async getPermittedModules(_userId: string): Promise<ModuleViewModel[]> {
    await waitForMockResponse();
    return [...MOCK_MODULES]
      .filter((module) => hasViewPermission(module, MOCK_PERMISSIONS))
      .sort(
        (firstModule, secondModule) =>
          firstModule.displayOrder - secondModule.displayOrder,
      )
      .map(mapModuleDtoToViewModel);
  }
}

export const moduleRepository: ModuleRepository = new MockModuleRepository();
