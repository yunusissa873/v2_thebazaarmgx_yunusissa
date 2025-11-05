import Sidebar from "./Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-netflix-black">
      <Sidebar />
      <main className="flex-1 p-6 text-white">{children}</main>
    </div>
  );
};

export default Layout;