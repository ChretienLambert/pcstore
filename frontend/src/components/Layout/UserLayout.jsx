import Header from "../Common/Header";
import { Outlet } from "react-router-dom";
import Footer from "../Common/Footer";
const UserLayout = () => {
  return (
    <>
      {/*Header*/}
      <Header />
      {/*Main content*/}
      <main className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
      {/*Footer*/}
      <Footer />
    </>
  );
};

export default UserLayout;
