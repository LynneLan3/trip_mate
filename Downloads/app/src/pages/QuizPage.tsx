import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2, ChevronRight } from 'lucide-react';

interface QuestionWithOptions {
  question_code: string;
  question_text: string;
  display_order: number;
  options: {
    id: string;
    option_text: string;
    score: number;
  }[];
}

interface QuizData {
  id: string;
  title: string;
  scoring_rules: {
    rules: {
      min: number;
      max: number;
      tag: string;
      description: string;
    }[];
  };
}

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromUserId = searchParams.get('from');

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<{nickname?: string, fromUserId: string} | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) return;

      try {
        // 如果是受邀答题，获取邀请人信息
        if (fromUserId) {
          const { data: fromUserProfile } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('id', fromUserId)
            .single();
          
          if (fromUserProfile) {
            setInviteInfo({
              nickname: (fromUserProfile as any).nickname,
              fromUserId
            });
          }
        }

        // 获取问卷信息
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('id, title, scoring_rules')
          .eq('id', quizId)
          .single();

        if (quizError) throw quizError;
        setQuiz(quizData);

        // 获取题目和选项
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select(`
            display_order,
            questions:question_code (
              question_code,
              question_text
            )
          `)
          .eq('quiz_id', quizId)
          .order('display_order');

        // 获取每个问题的选项
        const questionCodes = (questionsData as any[])?.map(q => q.questions.question_code) || [];
        console.log('Question codes from nested structure:', questionCodes);
        
        const { data: optionsData, error: optionsError } = await supabase
          .from('options')
          .select('id, question_code, option_text, score')
          .in('question_code', questionCodes)
          .order('display_order');

        console.log('Options data:', optionsData);
        console.log('Options error:', optionsError);

        if (optionsError) throw optionsError;

        if (questionsError) throw questionsError;
        console.log('Questions data:', questionsData);

        const formattedQuestions = (questionsData || []).map((q: any) => {
          const questionOptions = (optionsData || []).filter((opt: any) => {
            console.log('Matching option:', opt.question_code, 'with question:', q.questions.question_code);
            return opt.question_code === q.questions.question_code;
          });
          console.log('Question', q.questions.question_code, 'has', questionOptions.length, 'options');
          return {
            question_code: q.questions.question_code,
            question_text: q.questions.question_text,
            display_order: q.display_order,
            options: questionOptions,
          };
        });

        console.log('Quiz questions loaded:', formattedQuestions.length);
        console.log('Sample question:', formattedQuestions[0]);

        setQuestions(formattedQuestions);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error('加载问卷失败');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNext = async () => {
    if (!selectedOption) {
      toast.error('请选择一个选项');
      return;
    }

    const currentQuestion = questions[currentIndex];
    const newAnswers = { ...answers, [currentQuestion.question_code]: selectedOption };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      // 进入下一题
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption('');
      }, 300);
    } else {
      // 提交答案
      await submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: Record<string, string>) => {
    if (!quiz || !quizId) return;

    setSubmitting(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error('请先登录');
        return;
      }

      // 计算总分
      let totalScore = 0;
      Object.entries(finalAnswers).forEach(([questionCode, optionId]) => {
        const question = questions.find(q => q.question_code === questionCode);
        const option = question?.options.find(o => o.id === optionId);
        if (option) {
          totalScore += option.score;
        }
      });

      // 匹配标签
      const matchedRule = quiz.scoring_rules.rules.find(
        rule => totalScore >= rule.min && totalScore <= rule.max
      );
      const tag = matchedRule?.tag || '未知类型';

      // 保存答题结果：先尝试 (user_id, quiz_id) 唯一约束，不兼容时回退为仅 user_id
      const row = {
        user_id: user.id,
        quiz_id: quizId,
        score: totalScore,
        tag: tag,
        answers: finalAnswers as any,
        created_at: new Date().toISOString(),
      } as any;

      let resultData: { id: string } | null = null;
      let resultError = await (async () => {
        const { data, error } = await supabase
          .from('quiz_results')
          .upsert(row, { onConflict: 'user_id,quiz_id' })
          .select('id')
          .single();
        resultData = data;
        return error;
      })();

      if (resultError) {
        const msg = (resultError as any).message || '';
        const needUserOnly =
          msg.includes('unique') && msg.includes('conflict') ||
          msg.includes('no unique') ||
          msg.includes('ON CONFLICT') ||
          (resultError as any).code === '42710' ||
          (resultError as any).code === '42P10';
        if (needUserOnly) {
          const fallback = await supabase
            .from('quiz_results')
            .upsert(row, { onConflict: 'user_id' })
            .select('id')
            .single();
          if (fallback.error) throw fallback.error;
          resultData = fallback.data;
        } else {
          throw resultError;
        }
      }

      // 如果是受邀答题，创建匹配记录（只创建一条，避免重复）
      if (fromUserId && fromUserId !== user.id) {
        const { error: matchError } = await supabase
          .from('matches')
          .insert({
            requester_id: fromUserId,
            receiver_id: user.id,
            quiz_id: quizId,
            requester_agreed: false,
            receiver_agreed: false,
            status: 'pending',
          } as any);

        if (matchError && !matchError.message.includes('unique constraint') && !matchError.message.includes('duplicate')) {
          toast.warning('答题已保存，但匹配记录创建失败。请在「我的匹配」中查看，或联系管理员检查数据库权限。');
        }
      }

      toast.success('答题完成！');
      // 如果是受邀答题，跳转时携带from参数
      console.log('🔍 [QuizPage调试] fromUserId:', fromUserId);
      console.log('🔍 [QuizPage调试] resultData:', resultData);
      const resultPath = fromUserId 
        ? `/result/${(resultData as any)?.id}?from=${fromUserId}`
        : `/result/${(resultData as any)?.id}`;
      console.log('🔍 [QuizPage调试] 跳转路径:', resultPath);
      navigate(resultPath);
    } catch (error: any) {
      const msg = error?.message || String(error);
      toast.error(msg ? `提交失败：${msg.slice(0, 80)}${msg.length > 80 ? '…' : ''}` : '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D5A27]" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">问卷暂无题目</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="max-w-2xl mx-auto">
      {/* 邀请提示 */}
      {inviteInfo && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold">👋</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">
                {inviteInfo.nickname || '朋友'} 邀请你参与测试
              </h3>
              <p className="text-blue-700 text-sm">
                完成测试后你们可以看到彼此的匹配度
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 进度条 */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>题目 {currentIndex + 1} / {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* 题目卡片 */}
      <Card className="shadow-xl border-0">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold text-[#2C3E50] mb-6">
            {currentQuestion.question_text}
          </h2>

          <RadioGroup 
            value={selectedOption} 
            onValueChange={handleOptionSelect}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                className={`
                  flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer
                  transition-all duration-200
                  ${selectedOption === option.id 
                    ? 'border-[#2D5A27] bg-[#2D5A27]/5' 
                    : 'border-gray-100 hover:border-[#2D5A27]/30 hover:bg-gray-50'
                  }
                `}
              >
                <RadioGroupItem 
                  value={option.id} 
                  id={option.id}
                  className="border-[#2D5A27] text-[#2D5A27]"
                />
                <Label 
                  htmlFor={option.id} 
                  className="flex-1 cursor-pointer font-normal"
                >
                  {option.option_text}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <Button
            onClick={handleNext}
            disabled={!selectedOption || submitting}
            className="w-full mt-8 h-12 bg-[#2D5A27] hover:bg-[#234a1f] text-white"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLastQuestion ? '完成答题' : '下一题'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
