export type ModuleKey = "work-assigned" | "incidents";
export type ModuleIconName =
  | "alert-triangle"
  | "briefcase"
  | "check-square"
  | "grid"
  | "list"
  | "tool";

export interface ModuleViewModel {
  id: string;
  key: ModuleKey | null;
  title: string;
  description: string;
  iconName: ModuleIconName;
  children?: ModuleViewModel[];
}
