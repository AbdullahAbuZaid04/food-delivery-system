export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {children}
    </div>
  );
}
