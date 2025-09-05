import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"),
    route("e", "routes/createVacancy.tsx"),
    route("vacancies", "routes/vacancies.tsx"),
    route("criteria/:id", "routes/criteria.tsx"),
    route("questions/:id", "routes/questions.tsx"),
] satisfies RouteConfig;
