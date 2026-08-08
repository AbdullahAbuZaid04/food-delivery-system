import AdminShell from "@components/admin/AdminShell";

export const metadata = {
  title: "وجبة | لوحة الإدارة",
  description:
    "لوحة تحكم إدارة المنصة على وجبة — إدارة المستخدمين والمطاعم على المنصة.",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
