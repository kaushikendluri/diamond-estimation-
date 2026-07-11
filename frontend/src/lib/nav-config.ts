import {
  LayoutDashboard,
  ScanSearch,
  BarChart3,
  History,
  Settings,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview & key metrics",
  },
  {
    label: "Detection",
    href: "/detection",
    icon: ScanSearch,
    description: "Upload & analyze jewelry",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Trends & distributions",
  },
  {
    label: "History",
    href: "/history",
    icon: History,
    description: "Past uploads & reports",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Model & app preferences",
  },
  {
    label: "Help",
    href: "/help",
    icon: HelpCircle,
    description: "Guides & support",
  },
];
