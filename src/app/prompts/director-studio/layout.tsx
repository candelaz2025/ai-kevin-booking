export default function DirectorStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-[#07090E] text-slate-100 flex flex-col antialiased">
      {children}
    </div>
  );
}
