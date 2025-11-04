import usersRoute from "./users.js";
import authRoute from "./auth.js";
import articlesRoute from "./articles.js";
import periodsRoute from "./periods.js";
import locationsRoute from "./locations.js";
import figuresRoute from "./figures.js";
import eventsRoute from "./events.js";
import previewRoute from "./preview.js";
import locationTypeRoute from "./locationtypes.js";
import uploadRoute from "./upload.js";
import commentsRoute from "./comments.js";
import viewsRoute from "./views.js";
import statsRoute from "./stats.js";

function routes(app) {
    app.get("/", (req, res) => {
        res.send("API is running...");
    });

    //API routes
    app.use("/api/auth", authRoute);
    app.use("/api/articles", articlesRoute);
    app.use("/api/users", usersRoute);
    app.use("/api/periods", periodsRoute);
    app.use("/api/locations", locationsRoute);
    app.use("/api/location-types", locationTypeRoute);
    app.use("/api/figures", figuresRoute);
    app.use("/api/events", eventsRoute);
    app.use("/api/preview", previewRoute);
    app.use("/api/upload", uploadRoute);
    app.use("/api/comments", commentsRoute);
    app.use("/api/views", viewsRoute);
    app.use("/api/stats", statsRoute);
}

export default routes;
