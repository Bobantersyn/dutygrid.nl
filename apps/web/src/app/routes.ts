import { type RouteConfigEntry, route } from '@react-router/dev/routes';

const routes: RouteConfigEntry[] = [
	route("/", "./page.tsx"),
	route("/(app)/my-leave", "./(app)/my-leave/page.tsx"),
	route("/account/logout", "./account/logout/page.tsx"),
	route("/account/signin", "./account/signin/page.tsx"),
	route("/account/signup", "./account/signup/page.tsx"),
	route("/admin/settings", "./admin/settings/page.tsx"),
	route("/administratie", "./administratie/page.tsx"),
	route("/beschikbaarheid", "./beschikbaarheid/page.tsx"),
	route("/beschikbaarheid-overzicht", "./beschikbaarheid-overzicht/page.tsx"),
	route("/cao-management", "./cao-management/page.tsx"),
	route("/clients", "./clients/page.tsx"),
	route("/dev-login", "./dev-login/page.tsx"),
	route("/diensten-ruilen", "./diensten-ruilen/page.tsx"),
	route("/docs", "./docs/page.tsx"),
	route("/employees", "./employees/page.tsx"),
	route("/employees/[id]", "./employees/[id]/page.tsx"),
	route("/employees/new", "./employees/new/page.tsx"),
	route("/facturatie/uren", "./facturatie/uren/page.tsx"),
	route("/migrations", "./migrations/page.tsx"),
	route("/planning", "./planning/page.tsx"),
	route("/planning/edit/[id]", "./planning/edit/[id]/page.tsx"),
	route("/planning/new", "./planning/new/page.tsx"),
	route("/planning/reports", "./planning/reports/page.tsx"),
	route("/planning/v2", "./planning/v2/page.tsx"),
	route("/quick-login", "./quick-login/page.tsx"),
	route("/setup-role", "./setup-role/page.tsx"),
	route("/test-login", "./test-login/page.tsx"),
	route("/test-setup", "./test-setup/page.tsx"),
	route("/api/*", "./api.$.tsx"),
	route("*", "./__create/not-found.tsx")
];

export default routes;
