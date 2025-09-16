import config from "../config";
import Home from "../pages/Home/Home";
import NotFound from "../pages/404/404";

const routes = [
    { path: config.routes.home, page: Home },
    { path: config.routes.notFound, page: NotFound },
    // Catch-all route for undefined paths - must be last
    { path: "*", page: NotFound },
];

export default routes;
