import { HugeiconsIcon } from "@hugeicons/react"
import {
  Analytics02Icon,
  Book02Icon,
  HelpCircleIcon,
  Invoice02Icon,
  Settings02Icon,
  Shield02Icon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import type {
  NavDocument,
  NavItem,
  UserProfile,
} from "@/components/layout/types"

export const userNavMain: NavItem[] = [
  {
    title: "nav.dashboard",
    url: "/dashboard",
    icon: <HugeiconsIcon icon={Analytics02Icon} strokeWidth={2} className="size-4" />,
  },
  {
    title: "nav.myThesis",
    url: "/thesis",
    icon: <HugeiconsIcon icon={Book02Icon} strokeWidth={2} className="size-4" />,
  },
  {
    title: "Langganan",
    url: "/my-subscription",
    icon: <HugeiconsIcon icon={Invoice02Icon} strokeWidth={2} className="size-4" />,
  },
  {
    title: "nav.profile",
    url: "/profil",
    icon: <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-4" />,
  },
  {
    title: "nav.guide",
    url: "/bantuan",
    icon: <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} className="size-4" />,
  },
]

export const adminNavMain: NavItem[] = [
  {
    title: "nav.adminDashboard",
    url: "/admin",
    icon: <HugeiconsIcon icon={Analytics02Icon} strokeWidth={2} className="size-4" />,
  },
  {
    title: "nav.adminUsers",
    url: "/admin/users",
    icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="size-4" />,
  },
  {
    title: "nav.adminRoles",
    url: "/admin/roles",
    icon: <HugeiconsIcon icon={Shield02Icon} strokeWidth={2} className="size-4" />,
  },
  {
    title: "nav.adminPlans",
    url: "/admin/plans",
    icon: <HugeiconsIcon icon={Invoice02Icon} strokeWidth={2} className="size-4" />,
  },
  {
    title: "nav.adminTheses",
    url: "/admin/theses",
    icon: <HugeiconsIcon icon={Book02Icon} strokeWidth={2} className="size-4" />,
  },
]

export const defaultNavMain: NavItem[] = userNavMain

export const defaultDocuments: NavDocument[] = []

export const defaultNavSecondary: NavItem[] = [
  {
    title: "nav.secondary.settings",
    url: "/pengaturan",
    icon: <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} className="size-4" />,
  },
]

export const defaultUser: UserProfile = {
  name: "Pengguna Thesio",
  email: "pengguna@thesio.id",
  avatar: "",
}
