import { SidebarContent } from "./sidebar-content";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-[oklch(0.145_0_0_/_92%)] backdrop-blur-xl lg:block">
      <SidebarContent />
    </aside>
  );
}
