"use client";

import { ActionIcon, Avatar, SideNav } from "@lobehub/ui";
import {
  HomeIcon,
  Settings2Icon,
  FolderIcon,
  CompassIcon,
  CreditCardIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Flexbox } from "react-layout-kit";
// import { AppHeader } from "./dashboard-header";
import { UserButton, useUser } from "@clerk/nextjs";

const DashboardUI = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  // Define navigation items
  const navItems = [
    { icon: HomeIcon, path: "/dashboard", label: "Dashboard" },
    { icon: FolderIcon, path: "/files", label: "Files" },
    { icon: CompassIcon, path: "/knowledge-base", label: "Knowledge Base" },
    { icon: CreditCardIcon, path: "/billing", label: "Billing" },
  ];

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  // Get current page label
  const getCurrentLabel = () => {
    const matchedNav = navItems.find((item) => isActive(item.path));
    if (matchedNav) return matchedNav.label;
    if (pathname === "/settings" || pathname?.startsWith("/settings/")) {
      return "Settings";
    }
    return "Dashboard";
  };

  return (
    <Flexbox horizontal height="100vh" width="100vw">
      <SideNav
        avatar={
          user ? (
            <Avatar avatar={<UserButton />} bordered size={32} />
          ) : (
            <Avatar avatar="😀" background="#fee064" bordered size={32} />
          )
        }
        topActions={
          <>
            {navItems.map((item) => (
              <ActionIcon
                key={item.path}
                active={isActive(item.path)}
                icon={<item.icon size={20} />}
                onClick={() => router.push(item.path)}
                size="large"
                title={item.label}
              />
            ))}
          </>
        }
        bottomActions={
          <ActionIcon
            icon={Settings2Icon}
            size="large"
            active={pathname === "/settings"}
            onClick={() => router.push("/settings")}
            title="Settings"
          />
        }
      />
      <Flexbox flex={1} style={{ overflow: "hidden" }}>
        {/* <AppHeader extraLabel={getCurrentLabel()} /> */}
        <Flexbox
          flex={1}
          style={{
            height: "calc(100vh - 100px)",
            overflow: "auto",
          }}
        >
          {children}
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};

export default DashboardUI;