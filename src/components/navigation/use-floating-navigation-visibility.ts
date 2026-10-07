import { usePathname } from "expo-router";

import { useOptionalAppNavigation } from "@/src/components/navigation/AppNavigationContext";

const ROOT_TABS = new Set(["dashboard", "city-list", "incidents", "profile"]);

export const useFloatingNavigationVisibility = (): boolean => {
  const pathname = usePathname();
  const navigation = useOptionalAppNavigation();
  const segments = pathname.split("/").filter((segment) => segment && !segment.startsWith("("));
  const [screen, child, grandchild] = segments;

  if (!screen || !navigation || navigation.isFloatingBarHidden) return false;
  if (segments.length === 1 && ROOT_TABS.has(screen)) return false;
  if (screen === "mpin-setup" || screen === "incidents" && child) return false;
  if (screen === "work-assigned" && child && !grandchild) return false;
  if (screen === "audit-work-items" && child) return false;
  return true;
};
