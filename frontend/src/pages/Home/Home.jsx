import config from "../../config";
import "./Home.css";

function Home() {
    return (
        <div className="home">
            <h1>Lịch Sử Việt Nam</h1>
            <p>Khám phá lịch sử hào hùng của dân tộc Việt Nam</p>

            <div className="demo-content">
                <h2>Nội dung trang chủ</h2>
                <p>
                    Đây là nội dung demo để kiểm tra việc header không che nội
                    dung trang.
                </p>
            </div>

            <div className="demo-content">
                <h2>Thêm nội dung</h2>
                <p>
                    Có thể thêm nhiều nội dung khác nhau ở đây như tin tức, sự
                    kiện lịch sử, nhân vật nổi tiếng...
                </p>
            </div>

            <div className="demo-content">
                <h2>Cuộn trang để test</h2>
                <p>
                    Header sẽ luôn ở vị trí cố định khi bạn cuộn trang và không
                    che nội dung.
                </p>
            </div>
        </div>
    );
}

export default Home;
