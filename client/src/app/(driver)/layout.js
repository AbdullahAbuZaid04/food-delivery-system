import DriverShell from "@components/driver/DriverShell";

export const metadata = {
  title: "وجبة | لوحة السائق",
  description:
    "لوحة تحكم سائق التوصيل على وجبة — الطلبات المخصصة لك، ومتابعة التوصيل وتحديث حالته.",
};

export default function DriverLayout({ children }) {
  return <DriverShell>{children}</DriverShell>;
}
