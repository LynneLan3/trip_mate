import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Save, ArrowLeft, Globe, Lock } from 'lucide-react';

interface QuestionData {
  id: string;
  question_text: string;
  options: OptionData[];
}

interface OptionData {
  id: string;
  option_text: string;
  score: number;
}

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false); // 默认隐私
  const [questions, setQuestions] = useState<QuestionData[]>([
    {
      id: '1',
      question_text: '',
      options: [
        { id: '1-1', option_text: '', score: 1 },
        { id: '1-2', option_text: '', score: 2 },
      ]
    }
  ]);

  const addQuestion = () => {
    if (questions.length >= 10) {
      toast.error('最多只能添加10道题目');
      return;
    }
    const newId = (questions.length + 1).toString();
    setQuestions([...questions, {
      id: newId,
      question_text: '',
      options: [
        { id: `${newId}-1`, option_text: '', score: 1 },
        { id: `${newId}-2`, option_text: '', score: 2 },
      ]
    }]);
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length <= 1) {
      toast.error('至少需要保留1道题目');
      return;
    }
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, text: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, question_text: text } : q
    ));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        if (q.options.length >= 6) {
          toast.error('每道题最多6个选项');
          return q;
        }
        const newOptionId = `${questionId}-${q.options.length + 1}`;
        return {
          ...q,
          options: [...q.options, { 
            id: newOptionId, 
            option_text: '', 
            score: q.options.length + 1 
          }]
        };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        if (q.options.length <= 2) {
          toast.error('每道题至少需要2个选项');
          return q;
        }
        return { ...q, options: q.options.filter(o => o.id !== optionId) };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(o => 
            o.id === optionId ? { ...o, option_text: text } : o
          )
        };
      }
      return q;
    }));
  };

  const updateOptionScore = (questionId: string, optionId: string, score: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(o => 
            o.id === optionId ? { ...o, score } : o
          )
        };
      }
      return q;
    }));
  };

  const validateForm = () => {
    if (!quizTitle.trim()) {
      toast.error('请输入问卷名称');
      return false;
    }
    if (!quizDescription.trim()) {
      toast.error('请输入问卷简介');
      return false;
    }
    if (questions.length === 0) {
      toast.error('至少需要1道题目');
      return false;
    }

    for (const q of questions) {
      if (!q.question_text.trim()) {
        toast.error('请填写所有题目内容');
        return false;
      }
      if (q.options.length < 2) {
        toast.error('每道题至少需要2个选项');
        return false;
      }
      for (const o of q.options) {
        if (!o.option_text.trim()) {
          toast.error('请填写所有选项内容');
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error('请先登录');
        navigate('/auth');
        return;
      }

      // 计算评分规则（根据题目总分）
      const maxScore = questions.reduce((sum, q) => {
        const maxOptionScore = Math.max(...q.options.map(o => o.score));
        return sum + maxOptionScore;
      }, 0);

      const scoringRules = {
        rules: [
          { min: 0, max: Math.floor(maxScore * 0.3), tag: '初级型', description: '刚开始探索这个领域' },
          { min: Math.floor(maxScore * 0.3) + 1, max: Math.floor(maxScore * 0.7), tag: '进阶型', description: '对该领域有一定了解' },
          { min: Math.floor(maxScore * 0.7) + 1, max: maxScore, tag: '专家型', description: '在该领域经验丰富' },
        ]
      };

      // 1. 创建问卷
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: quizTitle,
          description: quizDescription,
          scoring_rules: scoringRules,
          is_public: isPublic,
          creator_id: user.id,
        } as any)
        .select('id')
        .single();

      if (quizError) throw quizError;
      const quizId = (quizData as any)?.id;
      if (!quizId) throw new Error('创建问卷失败');

      // 2. 批量创建题目和选项
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionCode = `custom_${quizId}_q${i + 1}`;

        // 创建题目
        const { error: questionError } = await supabase
          .from('questions')
          .insert({
            question_code: questionCode,
            question_text: question.question_text,
            category: 'custom',
          } as any);

        if (questionError) throw questionError;

        // 创建选项
        const optionsToInsert = question.options.map((opt, idx) => ({
          question_code: questionCode,
          option_text: opt.option_text,
          score: opt.score,
          display_order: idx + 1,
        }));

        const { error: optionsError } = await supabase
          .from('options')
          .insert(optionsToInsert as any);

        if (optionsError) throw optionsError;

        // 关联问卷和题目
        const { error: linkError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: quizId,
            question_code: questionCode,
            display_order: i + 1,
          } as any);

        if (linkError) throw linkError;
      }

      toast.success('问卷创建成功！');
      navigate('/my-quizzes');
    } catch (error: any) {
      console.error('创建问卷失败:', error);
      toast.error(error.message || '创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* 标题栏 */}
      <div className="flex items-center justify-between glass rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/my-quizzes')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-3xl font-bold text-[#2C3E50]">📝 创建问卷</h1>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#2D5A27] hover:bg-[#234a1f] text-white"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              保存问卷
            </>
          )}
        </Button>
      </div>

      {/* 问卷基本信息 */}
      <Card className="glass-card border-0 shadow-xl">
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">问卷名称 *</Label>
            <Input
              id="title"
              placeholder="例如：旅行风格测试"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              maxLength={50}
            />
          </div>
          <div>
            <Label htmlFor="description">问卷简介 *</Label>
            <Textarea
              id="description"
              placeholder="简单介绍这个问卷的用途..."
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              rows={3}
              maxLength={200}
            />
          </div>
          {/* 隐私/公开设置 */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-white/40">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="w-5 h-5 text-[#2D5A27]" />
              ) : (
                <Lock className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <p className="font-medium text-[#2C3E50]">
                  {isPublic ? '公开问卷' : '私密问卷'}
                </p>
                <p className="text-sm text-gray-500">
                  {isPublic ? '所有人可在首页看到并参与' : '仅通过链接邀请才能参与'}
                </p>
              </div>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </CardContent>
      </Card>

      {/* 题目列表 */}
      {questions.map((question, qIndex) => (
        <Card key={question.id} className="glass-card border-0 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>题目 {qIndex + 1}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeQuestion(question.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>题目内容 *</Label>
              <Textarea
                placeholder="请输入题目..."
                value={question.question_text}
                onChange={(e) => updateQuestion(question.id, e.target.value)}
                rows={2}
                maxLength={200}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>选项（{question.options.length}/6）</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(question.id)}
                  disabled={question.options.length >= 6}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加选项
                </Button>
              </div>

              {question.options.map((option, oIndex) => (
                <div key={option.id} className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-6">{String.fromCharCode(65 + oIndex)}.</span>
                  <Input
                    placeholder="选项内容"
                    value={option.option_text}
                    onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                    maxLength={100}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="分数"
                    value={option.score}
                    onChange={(e) => updateOptionScore(question.id, option.id, parseInt(e.target.value) || 1)}
                    min={1}
                    max={10}
                    className="w-20"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(question.id, option.id)}
                    disabled={question.options.length <= 2}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 添加题目按钮 */}
      <Button
        variant="outline"
        onClick={addQuestion}
        disabled={questions.length >= 10}
        className="w-full h-16 border-dashed border-2"
      >
        <Plus className="w-5 h-5 mr-2" />
        添加题目（{questions.length}/10）
      </Button>
    </div>
  );
}
