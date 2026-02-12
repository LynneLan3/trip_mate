import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Copy, Share2, Check, MapPin, Users, Award } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface QuizResult {
  id: string;
  score: number;
  tag: string;
  quiz_id: string;
  user_id: string;
  answers: Record<string, string>;
  quizzes: {
    title: string;
    scoring_rules: {
      rules: {
        min: number;
        max: number;
        tag: string;
        description: string;
      }[];
    };
  };
}

interface MatchInfo {
  otherResult?: {
    score: number;
    tag: string;
    answers: Record<string, string>;
  };
  otherUser?: {
    id: string;
    nickname: string;
    avatar_url?: string;
    gender?: string;
    province?: string;
  };
  matchId?: string;
  matchPercent?: number;
  answerMatchPercent?: number;
}

export default function ResultPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    nickname: '',
    bio: '',
    contact_info: '',
  });
  const [hasProfile, setHasProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      if (!resultId) return;

      try {
        const user = await getCurrentUser();
        if (!user) {
          toast.error('请先登录');
          navigate('/auth');
          return;
        }

        // 获取from参数（从URL或sessionStorage）
        const fromParam = searchParams.get('from') || sessionStorage.getItem(`from_${resultId}`);
        console.log('🔍 [调试] from参数:', fromParam);
        console.log('🔍 [调试] URL参数:', searchParams.get('from'));
        console.log('🔍 [调试] sessionStorage:', sessionStorage.getItem(`from_${resultId}`));
        if (fromParam) {
          sessionStorage.setItem(`from_${resultId}`, fromParam);
        }

        // 获取答题结果
        const { data, error } = await supabase
          .from('quiz_results')
          .select(`
            id,
            score,
            tag,
            quiz_id,
            user_id,
            answers,
            quizzes:quiz_id (
              title,
              scoring_rules
            )
          `)
          .eq('id', resultId)
          .single();

        if (error) throw error;
        setResult(data as QuizResult);

        // 检查是否已有资料
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile({
            nickname: (profileData as any).nickname || '',
            bio: (profileData as any).bio || '',
            contact_info: (profileData as any).contact_info || '',
          });
          setHasProfile(true);
        }

        // 检查是否有匹配记录（双向匹配的情况）
        // 如果有fromParam，优先查找与该用户的匹配记录
        let matchData: any = null;
        
        if (fromParam) {
          console.log('🔍 [调试] 正在查找与分享人的匹配记录...');
          console.log('🔍 [调试] 当前用户ID:', user.id);
          console.log('🔍 [调试] 分享人ID:', fromParam);
          console.log('🔍 [调试] 问卷ID:', (data as any).quiz_id);
          
          // 优先查找与分享人的匹配记录 - 使用limit(1)避免多条记录错误
          const { data: specificMatches, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .or(`and(requester_id.eq.${fromParam},receiver_id.eq.${user.id}),and(requester_id.eq.${user.id},receiver_id.eq.${fromParam})`)
            .eq('quiz_id', (data as any).quiz_id)
            .limit(1);
          
          console.log('🔍 [调试] 匹配记录查询结果:', specificMatches);
          console.log('🔍 [调试] 匹配记录查询错误:', matchError);
          matchData = specificMatches && specificMatches.length > 0 ? specificMatches[0] : null;
        }

        // 如果没有找到特定匹配，查找任意匹配记录
        if (!matchData) {
          console.log('🔍 [调试] 未找到特定匹配，查找任意匹配记录...');
          const { data: anyMatches, error: anyMatchError } = await supabase
            .from('matches')
            .select('*')
            .or(`receiver_id.eq.${user.id},requester_id.eq.${user.id}`)
            .eq('quiz_id', (data as any).quiz_id)
            .limit(1);
          
          console.log('🔍 [调试] 任意匹配记录查询结果:', anyMatches);
          console.log('🔍 [调试] 任意匹配记录查询错误:', anyMatchError);
          matchData = anyMatches && anyMatches.length > 0 ? anyMatches[0] : null;
        }

        if (matchData) {
          console.log('✅ [调试] 找到匹配记录！', matchData);
          
          // 获取对方的答题结果和用户信息
          const otherUserId = matchData.requester_id === user.id 
            ? matchData.receiver_id 
            : matchData.requester_id;
          
          console.log('🔍 [调试] 对方用户ID:', otherUserId);
          
          // 获取对方的答题结果（包含详细答案）
          const { data: otherResult, error: resultError } = await supabase
            .from('quiz_results')
            .select('score, tag, answers')
            .eq('user_id', otherUserId)
            .eq('quiz_id', (data as any).quiz_id)
            .maybeSingle();

          console.log('🔍 [调试] 对方答题结果:', otherResult);
          console.log('🔍 [调试] 对方答题结果错误:', resultError);

          // 获取对方的用户信息
          const { data: otherUser, error: userError } = await supabase
            .from('profiles')
            .select('id, nickname, avatar_url, gender, province')
            .eq('id', otherUserId)
            .maybeSingle();

          console.log('🔍 [调试] 对方用户信息:', otherUser);
          console.log('🔍 [调试] 对方用户信息错误:', userError);

          if (otherResult && otherUser) {
            console.log('✅ [调试] 开始计算匹配度...');
            
            // 计算答案匹配度（按百分制）
            const myAnswers = (data as any).answers as Record<string, string>;
            const theirAnswers = (otherResult as any).answers as Record<string, string>;
            const totalQuestions = Object.keys(myAnswers).length;
            const matchingAnswers = Object.keys(myAnswers).filter(
              key => myAnswers[key] === theirAnswers[key]
            ).length;
            const answerMatchPercent = totalQuestions > 0 
              ? Math.round((matchingAnswers / totalQuestions) * 100) 
              : 0;

            console.log('🔍 [调试] 我的答案:', myAnswers);
            console.log('🔍 [调试] 对方答案:', theirAnswers);
            console.log('🔍 [调试] 总题目数:', totalQuestions);
            console.log('🔍 [调试] 相同答案数:', matchingAnswers);
            console.log('🔍 [调试] 答案匹配度:', answerMatchPercent + '%');

            // 计算风格匹配度（基于分数差异）
            const scoreDiff = Math.abs((otherResult as any).score - (data as any).score);
            const matchPercent = Math.max(0, 100 - scoreDiff);

            console.log('🔍 [调试] 风格匹配度:', matchPercent + '%');

            const matchInfoData = {
              otherResult: otherResult as any,
              otherUser: otherUser as any,
              matchId: matchData.id,
              matchPercent,
              answerMatchPercent,
            };
            
            console.log('✅ [调试] 最终匹配信息:', matchInfoData);
            setMatchInfo(matchInfoData);
          } else {
            console.log('❌ [调试] 缺少对方信息，无法显示匹配度');
            console.log('🔍 [调试] otherResult存在?', !!otherResult);
            console.log('🔍 [调试] otherUser存在?', !!otherUser);
          }
        } else {
          console.log('❌ [调试] 没有找到任何匹配记录');
        }
      } catch (error) {
        console.error('❌ [调试] 发生错误:', error);
        toast.error('加载结果失败');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId, navigate, searchParams]);

  // 调试信息显示组件（开发环境）
  const DebugInfo = () => {
    if (import.meta.env.MODE !== 'development') return null;
    
    const fromParam = searchParams.get('from') || sessionStorage.getItem(`from_${resultId}`);
    
    return (
      <Card className="mb-6 border-2 border-orange-500 bg-orange-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-orange-800 mb-2">🔧 调试信息面板</h3>
          <div className="text-sm space-y-1">
            <p><strong>from参数:</strong> {fromParam || '❌ 未找到'}</p>
            <p><strong>resultId:</strong> {resultId}</p>
            <p><strong>是否有匹配信息:</strong> {matchInfo ? '✅ 是' : '❌ 否'}</p>
            {matchInfo && (
              <>
                <p><strong>好友昵称:</strong> {matchInfo.otherUser?.nickname}</p>
                <p><strong>答案匹配度:</strong> {matchInfo.answerMatchPercent}%</p>
              </>
            )}
            <p className="text-xs text-orange-600 mt-2">
              💡 提示：按 F12 打开控制台查看详细日志
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleSaveProfile = async () => {
    if (!profile.nickname.trim()) {
      toast.error('请输入昵称');
      return;
    }

    setSaving(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error('请先登录');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nickname: profile.nickname,
          bio: profile.bio,
          contact_info: profile.contact_info,
        } as any);

      if (error) throw error;

      setHasProfile(true);
      toast.success('资料保存成功！');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (!result) return;

    const userId = result.user_id;
    const quizId = result.quiz_id;
    const shareUrl = `${window.location.origin}/quiz/${quizId}?from=${userId}`;

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('链接已复制到剪贴板');

    setTimeout(() => setCopied(false), 2000);
  };

  const getTagDescription = () => {
    if (!result) return '';
    const rule = result.quizzes.scoring_rules.rules.find(
      r => r.tag === result.tag
    );
    return rule?.description || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D5A27]" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">结果不存在</p>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/quiz/${result.quiz_id}?from=${result.user_id}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 调试信息面板 */}
      <DebugInfo />
      
      {/* 结果卡片 */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <div className="bg-gradient-to-br from-[#2D5A27] to-[#234a1f] p-8 text-white text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-lg opacity-90 mb-2">你的旅行风格是</h2>
          <h1 className="text-3xl font-bold mb-2">{result.tag}</h1>
          <p className="text-white/80">总分: {result.score}/100</p>
        </div>
        <CardContent className="p-6">
          <p className="text-gray-600 text-center leading-relaxed">
            {getTagDescription()}
          </p>
        </CardContent>
      </Card>

      {/* 好友信息和匹配度显示（受邀答题时） */}
      {matchInfo && matchInfo.otherUser && (
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-br from-[#2D5A27]/10 to-[#234a1f]/5 p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-[#2D5A27]" />
              <h3 className="text-lg font-semibold text-[#2C3E50]">与好友的匹配结果</h3>
            </div>
            
            {/* 好友信息卡片 */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
              <Avatar className="w-16 h-16 border-2 border-[#2D5A27]/20">
                {matchInfo.otherUser.avatar_url ? (
                  <AvatarImage 
                    src={matchInfo.otherUser.avatar_url} 
                    alt={matchInfo.otherUser.nickname}
                  />
                ) : (
                  <AvatarFallback className="bg-[#2D5A27]/10 text-[#2D5A27] text-xl font-bold">
                    {matchInfo.otherUser.nickname.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold text-[#2C3E50] text-lg">{matchInfo.otherUser.nickname}</h4>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  {matchInfo.otherUser.gender && (
                    <span>{matchInfo.otherUser.gender === 'male' ? '👨' : '👩'} {matchInfo.otherUser.gender === 'male' ? '男' : '女'}</span>
                  )}
                  {matchInfo.otherUser.province && (
                    <span>📍 {matchInfo.otherUser.province}</span>
                  )}
                </p>
                {matchInfo.otherResult && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-[#2D5A27]/10 rounded-full">
                    <MapPin className="w-3 h-3 text-[#2D5A27]" />
                    <span className="text-xs font-medium text-[#2D5A27]">{matchInfo.otherResult.tag}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* 答案匹配度（主要显示） */}
            <div className="mb-4">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-800 font-medium">答案匹配度</p>
                </div>
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {matchInfo.answerMatchPercent}
                  <span className="text-3xl">%</span>
                </div>
                <p className="text-sm text-blue-700">
                  你们有 <span className="font-semibold">{matchInfo.answerMatchPercent}%</span> 的答案相同
                </p>
              </div>
            </div>

            {/* 风格匹配度（次要显示） */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">风格相似度</span>
                </div>
                <span className="text-lg font-bold text-green-600">{matchInfo.matchPercent}%</span>
              </div>
              
              {matchInfo.otherResult && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-gray-600">TA 的得分</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{matchInfo.otherResult.score} 分</span>
                </div>
              )}
            </div>

            {/* 匹配度说明 */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                💡 <span className="font-medium">匹配度说明：</span>
                答案匹配度根据相同答案的题目数量计算，百分比越高说明你们的选择越相似！
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 个人信息表单 */}
      {!hasProfile ? (
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#2C3E50] mb-4">
              完善你的资料
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">昵称 *</Label>
                <Input
                  id="nickname"
                  placeholder="给自己起个名字"
                  value={profile.nickname}
                  onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">个人简介</Label>
                <Textarea
                  id="bio"
                  placeholder="简单介绍一下自己..."
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">联系方式</Label>
                <Input
                  id="contact"
                  placeholder="微信号 / 手机号（匹配后可见）"
                  value={profile.contact_info}
                  onChange={(e) => setProfile({ ...profile, contact_info: e.target.value })}
                />
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-[#2D5A27] hover:bg-[#234a1f] text-white"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : '保存并生成分享链接'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* 分享功能 */
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#2C3E50] mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              分享给朋友
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              分享链接给朋友，双方完成测试并同意后即可交换联系方式
            </p>
            
            {/* 二维码（桌面端显示） */}
            <div className="hidden md:flex justify-center mb-6">
              <div className="p-4 bg-white rounded-xl shadow-inner">
                <QRCodeSVG value={shareUrl} size={160} />
              </div>
            </div>

            {/* 复制链接按钮 */}
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full h-12 border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27]/10"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 mr-2" />
                  复制分享链接
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <Button
          onClick={() => navigate('/matches')}
          variant="outline"
          className="flex-1 h-12"
        >
          查看我的匹配
        </Button>
        <Button
          onClick={() => navigate('/')}
          className="flex-1 h-12 bg-[#2D5A27] hover:bg-[#234a1f] text-white"
        >
          返回首页
        </Button>
      </div>
    </div>
  );
}
