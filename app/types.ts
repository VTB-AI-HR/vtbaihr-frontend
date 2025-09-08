// src/types.ts
export type SkillLevel = "junior" | "middle" | "senior";

export interface VacancyPayload {
  name: string;
  tags: string[];
  description: string;
  red_flags: string;
  skill_lvl: SkillLevel;
}


export interface VacancyResponse extends VacancyPayload {
  id: number;
}

export interface InterviewResult {
  id: number;
  vacancy_id: number;
  candidate_email: string;
  candidate_resume_fid: string;
  general_score: number;
  general_result: "next" | "rejected" | "maybe";
  general_recommendation: string;
  red_flag_score: number;
  hard_skill_score: number;
  soft_skill_score: number;
  logic_structure_score: number;
  accordance_xp_vacancy_score: number;
  accordance_skill_vacancy_score: number;
  accordance_xp_resume_score: number;
  accordance_skill_resume_score: number;
  strong_areas: string;
  weak_areas: string;
  created_at: string;
}

export interface CandidateAnswer {
  id: number;
  question_id: number;
  interview_id: number;
  response_time: number;
  message_ids: number[];
  llm_comment: string;
  score: number;
  created_at: string;
}

export interface InterviewMessage {
  id: number;
  interview_id: number;
  question_id: number;
  audio_fid: string;
  role: "assistant" | "user";
  text: string;
  created_at: string;
}

export interface InterviewResultDetails {
  candidate_answers: CandidateAnswer[];
  interview_messages: InterviewMessage[];
}

export interface CandidateEvaluation {
  id: number;
  vacancy_id: number;
  candidate_email: string;
  candidate_name?: string;
  candidate_phone: string;
  candidate_resume_fid: string;
  accordance_xp_vacancy_score: number;
  accordance_skill_vacancy_score: number;
  red_flag_score: number;
  hard_skill_score: number;
  soft_skill_score: number;
  logic_structure_score: number;
  accordance_xp_resume_score: number;
  accordance_skill_resume_score: number;
  strong_areas: string;
  weak_areas: string;
  general_score: number;
  general_result: 'next' | 'rejected' | 'in_process';
  message_to_candidate: string;
  message_to_hr: string;
  created_at: string;
}

export interface Question {
  id: number;
  vacancy_id: number;
  question: string;
  hint_for_evaluation: string;
  weight: number;
  question_type: string;
  response_time: number;
  created_at: string;
}