import OwnerShell from "@components/owner/OwnerShell";

export const metadata = {
  title: "وجبة | لوحة المالك",
  description:
    "لوحة تحكم مالك المطعم على وجبة — إدارة الطلبات، المنيو، التقييمات، وإعدادات المطعم.",
};

export default function OwnerLayout({ children }) {
  return <OwnerShell>{children}</OwnerShell>;
}
