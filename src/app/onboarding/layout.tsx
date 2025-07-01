export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted flex h-screen flex-col items-center justify-center">
      {children}
    </div>
  );
}
