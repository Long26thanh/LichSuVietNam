import { Header, Footer } from "../../components";
function MainLayout({ children }) {
    return (
        <div className="wrapper">
            <Header />
            <div className="content">{children}</div>
            <Footer />
        </div>
    );
}
export default MainLayout;
