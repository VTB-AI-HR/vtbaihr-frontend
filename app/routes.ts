import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"),
    route("createVacancy", "routes/createVacancy.tsx"),
    route("vacancies", "routes/vacancies.tsx"),
    route("questions/:id", "routes/questions.tsx"),
    route("apply/:id", "routes/apply.tsx"),
    route("rejected", "routes/rejected.tsx"),
    route("vacancy/:vacancy_id/interview/:interview_id", "routes/interview.tsx"),
    route("vacancy/:vacancy_id", "routes/vacancy.tsx"),
    route("vacancy/:vacancy_id/interviewDetails/:interview_id", "routes/interviewDetails.tsx"),
    route("thankyou", "routes/thankyou.tsx"),
    route("resumeScreening/:vacancy_id?", "routes/resumeScreening.tsx"),
] satisfies RouteConfig;
