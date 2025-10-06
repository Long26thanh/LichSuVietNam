import usersRoute from "./users.js";
import authRoute from "./auth.js";
import periodsRoute from "./periods.js";
import locationsRoute from "./locations.js";
import figuresRoute from "./figures.js";
import eventsRoute from "./events.js";

function routes(app) {
    app.get("/", (req, res) => {
        res.send("API is running...");
    });

    //API routes
    app.use("/api/auth", authRoute);
    app.use("/api/users", usersRoute);
    app.use("/api/periods", periodsRoute);
    app.use("/api/locations", locationsRoute);
    app.use("/api/figures", figuresRoute);
    app.use("/api/events", eventsRoute);
}

export default routes;
