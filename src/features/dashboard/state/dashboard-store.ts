import { create } from "zustand";
import type { ProjectViewModel } from "@/src/features/dashboard/domain/dashboard.types";

interface DashboardStore {
  selectedProject: ProjectViewModel | null;
  setSelectedProject: (project: ProjectViewModel | null) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
}));
