import config from "@/config";
import * as Pages from "@/pages";
import AdminLayout from "@/layouts/AdminLayout/AdminLayout";

const routes = [
    { path: config.routes.notFound, page: Pages.NotFound },
    { path: config.routes.home, page: Pages.Home },
    { path: config.routes.register, page: Pages.Register },
    { path: config.routes.login, page: Pages.Login, layout: null },
    { path: config.routes.profile, page: Pages.Profile },
    { path: config.routes.timeline, page: Pages.TimeLine },
    { path: config.routes.periodDetail, page: Pages.PeriodDetail },
    { path: config.routes.locations, page: Pages.Location },
    { path: config.routes.locationDetail, page: Pages.LocationDetail },
    { path: config.routes.characters, page: Pages.Figure },
    { path: config.routes.figureDetail, page: Pages.FigureDetail },
    { path: config.routes.events, page: Pages.Event },
    { path: config.routes.eventDetail, page: Pages.EventDetail },
    // Admin routes
    { path: config.routes.admin, page: Pages.Admin, layout: null },
    { path: config.routes.adminLogin, page: Pages.Admin, layout: null },
    {
        path: config.routes.adminDashboard,
        page: Pages.AdminDashboard,
        layout: AdminLayout,
    },
    {
        path: config.routes.adminUsers,
        page: Pages.AdminUsers,
        layout: AdminLayout,
    },
    {
        path: config.routes.adminEvents,
        page: Pages.AdminEvents,
        layout: AdminLayout,
    },
    {
        path: config.routes.adminFigures,
        page: Pages.AdminFigures,
        layout: AdminLayout,
    },
    {
        path: config.routes.adminLocations,
        page: Pages.AdminLocations,
        layout: AdminLayout,
    },
    {
        path: config.routes.adminPeriods,
        page: Pages.AdminPeriods,
        layout: AdminLayout,
    },
    {
        path: config.routes.adminProfile,
        page: Pages.AdminProfile,
        layout: AdminLayout,
    },
];

export default routes;
