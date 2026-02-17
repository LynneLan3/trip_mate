import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, ClipboardList, ArrowRight, Plus } from 'lucide-react';

interface QuizWithCount {
  id: string;
  title: string;
  description: string;
  question_count: number;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // 获取问卷列表和题目数量
        const { data, error } = await supabase
          .from('quizzes')
          .select(`
            id,
            title,
            description,
            quiz_questions(count)
          `);

        if (error) throw error;

        const formattedData = (data || []).map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          question_count: quiz.quiz_questions?.[0]?.count || 0,
        }));

        setQuizzes(formattedData);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        toast.error('加载问卷失败');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D5A27]" />
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-20">
        <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl text-gray-600 mb-2">暂无可用问卷</h2>
        <p className="text-gray-400">敬请期待更多精彩内容</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 欢迎区域 - 磨玻璃卡片 */}
      <div className="text-center py-12 glass rounded-3xl animate-scale-in shadow-2xl">
        <h1 className="text-4xl font-bold text-[#2C3E50] mb-4 tracking-tight">
          ✨ 发现你的旅行风格
        </h1>
        <p className="text-gray-700 max-w-2xl mx-auto text-lg leading-relaxed mb-6">
          完成性格测试，了解你的旅行偏好，找到志同道合的驴友
        </p>
        <Button
          onClick={() => navigate('/create-quiz')}
          className="bg-gradient-to-r from-[#2D5A27] to-[#234a1f] hover:from-[#234a1f] hover:to-[#1a3515] text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          创建自定义问卷
        </Button>
      </div>

      {/* 问卷列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz, index) => (
          <Card 
            key={quiz.id} 
            className="glass-card border-0 shadow-xl group shine-effect overflow-hidden"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#2D5A27]/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="w-5 h-5 text-[#2D5A27]" />
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {quiz.question_count} 道题目
                </span>
              </div>
              <CardTitle className="text-xl text-[#2C3E50] group-hover:text-[#2D5A27] transition-all duration-300 font-bold">
                {quiz.title}
              </CardTitle>
              <CardDescription className="text-gray-600 line-clamp-2 leading-relaxed">
                {quiz.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={`/quiz/${quiz.id}`}>
                <Button 
                  className="w-full bg-[#2D5A27] hover:bg-[#234a1f] text-white group/btn shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  开始答题
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-2 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 说明区域 */}
      <div className="glass rounded-3xl p-8 shadow-2xl mt-8 animate-fade-in-up">
        <h3 className="text-2xl font-bold text-[#2C3E50] mb-6 text-center">📋 如何使用</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/40 transition-all duration-300 hover:scale-105 cursor-default">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#234a1f] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-lg">
              1
            </div>
            <div>
              <h4 className="font-bold text-[#2C3E50] mb-2 text-lg">完成测试</h4>
              <p className="text-sm text-gray-700 leading-relaxed">回答10道题目，发现你的旅行风格</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/40 transition-all duration-300 hover:scale-105 cursor-default">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#234a1f] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-lg">
              2
            </div>
            <div>
              <h4 className="font-bold text-[#2C3E50] mb-2 text-lg">分享链接</h4>
              <p className="text-sm text-gray-700 leading-relaxed">生成专属链接，邀请朋友参与</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/40 transition-all duration-300 hover:scale-105 cursor-default">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#234a1f] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-lg">
              3
            </div>
            <div>
              <h4 className="font-bold text-[#2C3E50] mb-2 text-lg">双向确认</h4>
              <p className="text-sm text-gray-700 leading-relaxed">双方同意后，即可查看联系方式</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
