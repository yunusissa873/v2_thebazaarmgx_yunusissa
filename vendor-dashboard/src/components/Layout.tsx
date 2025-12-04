import Header from "./Header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-netflix-black">
      <Header />
      <main className="max-w-full mx-auto">{children}</main>
    </div>
  );
};

export default Layout;
