import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

const MainLayout = () => {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main className="container mx-auto py-8">
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;
