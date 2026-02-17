// 数据库表类型定义

export interface Question {
  question_code: string;
  question_text: string;
  category: string;
  created_at: string;
}

export interface Option {
  id: string;
  question_code: string;
  option_text: string;
  score: number;
  display_order: number;
  created_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  scoring_rules: {
    rules: {
      min: number;
      max: number;
      tag: string;
      description: string;
    }[];
  };
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_code: string;
  display_order: number;
  created_at: string;
  question?: Question;
  options?: Option[];
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  tag: string;
  answers: Record<string, string>;
  created_at: string;
}

export interface Match {
  id: string;
  requester_id: string;
  receiver_id: string;
  quiz_id: string;
  requester_agreed: boolean;
  receiver_agreed: boolean;
  status: 'pending' | 'matched';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  nickname: string;
  bio: string;
  contact_info: string;
  avatar_url: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}
