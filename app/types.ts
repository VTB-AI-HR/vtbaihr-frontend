export type SkillLevel = "junior" | "middle" | "senior";

export interface VacancyPayload {
  name: string;
  tags: string[];
  description: string;
  red_flags: string;
  skill_lvl: SkillLevel;
  question_response_time: number;
}

export interface VacancyResponse extends VacancyPayload {
  id: number;
  questions_type: string;
}
