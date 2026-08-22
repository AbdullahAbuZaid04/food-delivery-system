import CustomerGuard from "@components/customer/CustomerGuard";

export default function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen bg-cream text-cocoa">
      <CustomerGuard>{children}</CustomerGuard>
    </div>
  );
}
