import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Toaster } from '@/components/ui/sonner';

// 页面组件
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import MatchesPage from './pages/MatchesPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';

/** 未登录时跳转到登录页，并带上当前路径作为 redirect，以便登录后回到问卷等页面 */
function AuthRedirect() {
  const location = useLocation();
  const to = `/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`;
  return <Navigate to={to} replace />;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取当前用户并处理重定向
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      // 注册/登录成功后，确保新用户有 profile；若当前在登录页则跳转到资料页
      if (event === 'SIGNED_IN' && session?.user) {
        (async () => {
          try {
            const userId = session.user.id;
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', userId)
              .maybeSingle();

            if (profileError) throw profileError;

            if (!profileData) {
              const defaultNickname = (session.user.email || '').split('@')[0] || '新用户';
              const defaultAvatarUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
              await supabase.from('profiles').upsert(
                {
                  id: userId,
                  nickname: defaultNickname,
                  bio: '新用户，期待发现更多旅行伙伴！',
                  contact_info: null,
                  avatar_url: defaultAvatarUrl,
                  gender: 'female',
                } as any,
                { onConflict: 'id', ignoreDuplicates: true }
              );
            }

            // 仅当用户刚从登录/注册页进来时跳转：若有 redirect 则去问卷等目标页，否则去资料页
            if (window.location.pathname === '/auth') {
              const params = new URLSearchParams(window.location.search);
              const redirectTo = params.get('redirect');
              if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
                window.location.href = redirectTo;
              } else {
                window.location.href = '/profile';
              }
            }
          } catch (err) {
            console.error('Post-auth profile setup failed:', err);
            if (window.location.pathname === '/auth') {
              const params = new URLSearchParams(window.location.search);
              const redirectTo = params.get('redirect');
              if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
                window.location.href = redirectTo;
              } else {
                window.location.href = '/profile';
              }
            }
          }
        })();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5A27]"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/" element={user ? <Layout user={user} /> : <AuthRedirect />}>
          <Route index element={<HomePage />} />
          <Route path="quiz/:quizId" element={<QuizPage />} />
          <Route path="result/:resultId" element={<ResultPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
