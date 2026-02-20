import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { app } from "../../__create/index";

export const loader = ({ request }: LoaderFunctionArgs) => {
    return app.fetch(request);
};

export const action = ({ request }: ActionFunctionArgs) => {
    return app.fetch(request);
};
