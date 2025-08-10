import Navigation from "@/components/Navigation";
import AdminProjectsSection from "@/components/AdminProjectsSection";
import Footer from "@/components/Footer";

const Admin = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-20">
        <AdminProjectsSection />
      </div>
      <Footer />
    </div>
  );
};

export default Admin;