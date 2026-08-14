import type { ModuleViewModel } from "@/src/features/modules/domain/module.types";

export interface ModuleRepository {
  getPermittedModules(userId: string): Promise<ModuleViewModel[]>;
}
