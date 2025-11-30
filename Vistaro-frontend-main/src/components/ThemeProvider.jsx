export default function ThemeProvider({ children }) {
  return (
    <div className="text-white bg-slate-950 min-h-screen">
      {children}
    </div>
  );
}