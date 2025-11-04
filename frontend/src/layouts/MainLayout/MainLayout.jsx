import { Header, Footer } from "../../components";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import "./MainLayout.css";

function MainLayout({ children }) {
    const { sessionType, switchSessionType } = useAuth();

    // Tự động chuyển đổi session type khi vào trang thường
    useEffect(() => {
        if (sessionType !== "user") {
            switchSessionType("user");
        }
    }, [sessionType, switchSessionType]);

    return (
        <div className="wrapper">
            <Header />
            <main className="content">{children}</main>
            <Footer />
        </div>
    );
}
export default MainLayout;
