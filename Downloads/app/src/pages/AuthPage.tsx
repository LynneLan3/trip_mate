import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { signUpWithEmail, signInWithEmail, getSession, createUserProfile } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ClipboardList, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [redirectMessage, setRedirectMessage] = useState('');

  useEffect(() => {
    // 检查是否有邀请参数：来自 redirect（如 /quiz/xxx?from=yyy）或单独 from
    const redirect = searchParams.get('redirect');
    const fromUserId = searchParams.get('from');
    const hasQuizRedirect = redirect?.includes('/quiz/');
    if (fromUserId || hasQuizRedirect) {
      setRedirectMessage('朋友邀请你参与旅行风格测试，请先登录或注册');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 防止重复提交
    if (loading) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        console.log('Attempting login with email:', email);
        const { error } = await signInWithEmail(email, password);
        console.log('Login result:', { error: error ? 'failed' : 'success' });
        
        if (error) {
          console.error('Login error details:', error);
          const errorMessage = (error as any).message || '登录失败';
          const errorName = (error as any).name || '';
          if (errorMessage.includes('Invalid login') || errorMessage.includes('Invalid API') || errorMessage.includes('Unauthorized')) {
            toast.error('邮箱或密码错误');
          } else if (errorMessage.includes('credentials')) {
            toast.error('配置错误，请联系管理员');
          } else if (
            errorMessage.includes('Failed to fetch') ||
            errorName.includes('AuthRetryableFetchError') ||
            errorMessage.includes('timeout') ||
            errorMessage.includes('TIMED_OUT')
          ) {
            toast.error('网络超时或无法连接，请检查网络后重试。若在中国大陆可尝试使用 VPN。');
          } else {
            toast.error(errorMessage);
          }
        } else {
          toast.success('登录成功！');
          const redirectTo = searchParams.get('redirect');
          if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
            window.location.href = redirectTo;
          } else {
            window.location.href = '/';
          }
        }
      } else {
        console.log('Attempting signup with email:', email);
        const { data: signUpData, error } = await signUpWithEmail(email, password);
        console.log('Signup result:', { error: error ? 'failed' : 'success', hasUser: !!signUpData?.user, hasSession: !!signUpData?.session });
        
        if (error) {
          console.error('Signup error details:', error);
          const errorMessage = (error as any).message || '注册失败';
          const errorName = (error as any).name || '';
          if (errorMessage.includes('already registered')) {
            toast.error('该邮箱已注册');
          } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
            toast.error('注册过于频繁，请1分钟后再试');
          } else if (errorMessage.includes('credentials')) {
            toast.error('配置错误，请联系管理员');
          } else if (
            errorMessage.includes('Failed to fetch') ||
            errorName.includes('AuthRetryableFetchError') ||
            errorMessage.includes('timeout') ||
            errorMessage.includes('TIMED_OUT')
          ) {
            toast.error('网络超时或无法连接，请检查网络后重试。若在中国大陆可尝试使用 VPN。');
          } else {
            toast.error(errorMessage);
          }
        } else if (signUpData?.session) {
          // 未开启邮箱确认时：直接有 session，立即写 profile 并跳转
          const redirectTo = searchParams.get('redirect');
          toast.success(redirectTo?.includes('/quiz/') ? '注册成功！正在跳转到问卷…' : '注册成功！正在跳转…');
          try {
            await createUserProfile(signUpData.session.user.id, email);
          } catch (_) {
            // 忽略 profile 创建失败，由 App 或 Profile 页兜底
          }
          if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
            window.location.href = redirectTo;
          } else {
            window.location.href = '/profile';
          }
        } else if (signUpData?.user) {
          // 开启了邮箱确认：user 存在但 session 为 null，需用户点击邮件链接后才会有 session
          toast.success('注册成功！请查收邮件并点击链接完成验证，验证后可登录。');
          // 不跳转，避免被 App 因无 session 重定向回 /auth
        } else {
          // 极少数情况：无 error 但无 user/session，短暂轮询 session 后决定
          toast.success('注册请求已提交…');
          const redirectTo = searchParams.get('redirect');
          const waitForSession = async (retries = 15) => {
            for (let i = 0; i < retries; i++) {
              const result = await getSession();
              const session = result?.data?.session;
              if (session?.user) {
                try {
                  await createUserProfile(session.user.id, email);
                } catch (_) {}
                if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
                  window.location.href = redirectTo;
                } else {
                  window.location.href = '/profile';
                }
                return;
              }
              await new Promise((r) => setTimeout(r, 300));
            }
            toast.info('若已开启邮箱验证，请查收邮件完成验证后登录。');
          };
          waitForSession();
        }
      }
    } catch (error) {
      console.error('Auth operation failed:', error);
      toast.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <ClipboardList className="w-10 h-10 text-[#2D5A27]" />
          <h1 className="text-3xl font-bold text-[#2D5A27]">驴友匹配</h1>
        </div>

        <Card className="shadow-xl border-0">
        <CardHeader className="text-center">
          {redirectMessage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">{redirectMessage}</p>
            </div>
          )}
          <CardTitle className="text-2xl text-[#2C3E50]">
            {isLogin ? '欢迎回来' : '创建账号'}
          </CardTitle>
          <CardDescription className="text-gray-500">
            {isLogin 
              ? '登录后继续探索你的旅行风格' 
              : '注册后发现志同道合的旅行伙伴'}
          </CardDescription>
        </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="至少6位密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#2D5A27] hover:bg-[#234a1f] text-white"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isLogin ? '登录' : '注册'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#2D5A27] hover:underline text-sm"
                disabled={loading}
              >
                {isLogin 
                  ? '还没有账号？立即注册' 
                  : '已有账号？立即登录'}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          完成测试，发现你的旅行风格，找到志同道合的伙伴
        </p>
      </div>
    </div>
  );
}
