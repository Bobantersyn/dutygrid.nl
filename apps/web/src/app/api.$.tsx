import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { app } from "../../__create/index";

export const loader = ({ request }: LoaderFunctionArgs) => {
    console.log('!!! API LOADER CALLED:', request.url);
    return app.fetch(request);
};

export const action = ({ request }: ActionFunctionArgs) => {
    return app.fetch(request);
};
