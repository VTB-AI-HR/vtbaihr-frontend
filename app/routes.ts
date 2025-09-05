import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"),
    route("createVacancy", "routes/createVacancy.tsx"),
    route("vacancies", "routes/vacancies.tsx"),
    route("criteria/:id", "routes/criteria.tsx"),
    route("questions/:id", "routes/questions.tsx"),
    route("apply/:id", "routes/apply.tsx"),
    route("rejected", "routes/rejected.tsx"),
    route("interview/:interviewId", "routes/interview.tsx"),
] satisfies RouteConfig;
