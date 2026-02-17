import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, User, Mail, MapPin, Save, Edit3, Camera } from 'lucide-react';

interface UserProfile {
  id: string;
  nickname: string;
  bio: string;
  contact_info: string;
  avatar_url: string;
  gender: string;
  province: string;
  created_at: string;
}

interface UserAccount {
  email: string;
  created_at: string;
}

// 默认头像 URL
const DEFAULT_AVATAR_URL = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
    contact_info: '',
    gender: 'female', // 默认选择女性
    province: '',
    avatar_url: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          toast.error('请先登录');
          return;
        }

        // 获取用户账号信息
        setAccount({
          email: user.email || '',
          created_at: user.created_at || '',
        });

        // 获取用户扩展资料
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single() as any;

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (profileData) {
          setProfile(profileData as UserProfile);
          const formDataFromProfile = {
            nickname: (profileData as any).nickname || '',
            bio: (profileData as any).bio || '',
            contact_info: (profileData as any).contact_info || '',
            gender: (profileData as any).gender || 'female', // 默认女性
            province: (profileData as any).province || '',
            avatar_url: (profileData as any).avatar_url || DEFAULT_AVATAR_URL,
          };
          setFormData(formDataFromProfile);
          
          // 如果必填项为空，自动进入编辑模式
          if (!formDataFromProfile.nickname || !formDataFromProfile.contact_info) {
            setEditing(true);
          }
        } else {
          // 如果没有资料，初始化表单（新用户）
          setFormData({
            nickname: '',
            bio: '',
            contact_info: '',
            gender: 'female', // 默认女性
            province: '',
            avatar_url: DEFAULT_AVATAR_URL, // 使用默认头像
          });
          // 新用户自动进入编辑模式
          setEditing(true);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('加载个人资料失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 头像上传处理
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    // 验证文件大小（最大 2MB）
    if (file.size > 2 * 1024 * 1024) {
      toast.error('图片大小不能超过 2MB');
      return;
    }

    setUploading(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error('请先登录');
        return;
      }

      // 生成唯一文件名
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 上传到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 获取公开 URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 更新表单数据
      setFormData({ ...formData, avatar_url: publicUrl });
      toast.success('头像上传成功！');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('头像上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nickname.trim()) {
      toast.error('请输入昵称');
      return;
    }

    // 联系方式必填验证
    if (!formData.contact_info?.trim()) {
      toast.error('请填写联系方式');
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
          nickname: formData.nickname,
          bio: formData.bio,
          contact_info: formData.contact_info,
          gender: formData.gender,
          province: formData.province,
          avatar_url: formData.avatar_url,
        } as any);

      if (error) throw error;

      // 更新本地状态
      const updatedProfile = {
        id: user.id,
        ...formData,
        created_at: profile?.created_at || new Date().toISOString(),
      };
      setProfile(updatedProfile);
      setEditing(false);
      toast.success('保存成功！正在跳转到问卷首页...');
      
      // 保存成功后跳转到问卷首页
      setTimeout(() => {
        window.location.href = '/';
      }, 800);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // 如果是新用户或必填项为空，不允许取消
    if (!profile || !profile.nickname || !profile.contact_info) {
      toast.error('请先完成必填项');
      return;
    }
    
    if (profile) {
      setFormData({
        nickname: profile.nickname || '',
        bio: profile.bio || '',
        contact_info: profile.contact_info || '',
        gender: profile.gender || 'female',
        province: profile.province || '',
        avatar_url: profile.avatar_url || DEFAULT_AVATAR_URL,
      });
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-3xl p-8 shadow-2xl animate-scale-in">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#2D5A27] border-t-transparent shadow-lg"></div>
            <p className="text-[#2D5A27] font-semibold text-lg">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="text-center glass rounded-3xl p-8 shadow-2xl animate-scale-in">
        <h1 className="text-4xl font-bold text-[#2C3E50] mb-3">👤 个人中心</h1>
        <p className="text-gray-700 text-lg">管理你的个人资料和联系方式</p>
        {editing && (!profile?.nickname || !profile?.contact_info) && (
          <div className="mt-6 p-4 glass rounded-2xl border-2 border-blue-200/50 max-w-2xl mx-auto shadow-lg">
            <p className="text-blue-800 font-medium">
              👋 欢迎！请完成必填项后即可开始问卷测试
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：基本信息卡片 */}
        <div className="lg:col-span-1">
          <Card className="glass-card border-0 shadow-2xl animate-fade-in-up">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                {/* 头像 */}
                <div className="flex justify-center">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 ring-4 ring-white/50 shadow-2xl">
                      <AvatarImage src={formData.avatar_url || DEFAULT_AVATAR_URL} alt="头像" />
                      <AvatarFallback className="bg-gradient-to-br from-[#2D5A27] to-[#234a1f] text-white text-3xl">
                        {formData.nickname.charAt(0).toUpperCase() || <User className="w-10 h-10" />}
                      </AvatarFallback>
                    </Avatar>
                    {editing && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="absolute inset-0 w-32 h-32 rounded-full bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          {uploading ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          ) : (
                            <Camera className="w-6 h-6 text-white" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {editing && (
                  <p className="text-xs text-gray-500">
                    点击头像上传（最大 2MB）
                  </p>
                )}

                {/* 昵称 */}
                <div>
                  <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">
                    {formData.nickname || '未设置昵称'}
                  </h2>
                  {formData.province && (
                    <p className="text-gray-600 flex items-center justify-center gap-2 font-medium">
                      <MapPin className="w-5 h-5" />
                      {formData.province}
                    </p>
                  )}
                </div>

                {/* 个人简介 */}
                {formData.bio && (
                  <p className="text-gray-700 text-base leading-relaxed">{formData.bio}</p>
                )}

                {/* 联系方式预览 */}
                {formData.contact_info && (
                  <div className="glass rounded-2xl p-4 text-left shadow-inner">
                    <p className="text-sm text-gray-600 mb-2 font-semibold">联系方式</p>
                    <p className="text-base font-medium text-[#2C3E50]">{formData.contact_info}</p>
                  </div>
                )}

                {/* 编辑按钮 */}
                {!editing && (
                  <Button
                    onClick={() => setEditing(true)}
                    className="w-full bg-gradient-to-r from-[#2D5A27] to-[#234a1f] hover:from-[#234a1f] hover:to-[#1a3515] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-12 text-base font-bold"
                  >
                    <Edit3 className="w-5 h-5 mr-2" />
                    编辑资料
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 账号信息 */}
          <Card className="glass-card border-0 mt-6 shadow-2xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-[#2C3E50] mb-5">📧 账号信息</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">邮箱</p>
                    <p className="text-sm font-medium">{account?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">注册时间</p>
                    <p className="text-sm font-medium">
                      {account?.created_at ? new Date(account.created_at).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：编辑表单 */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-0 shadow-2xl animate-fade-in-up">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-[#2C3E50] mb-8">✏️ 编辑个人资料</h3>
              
              <div className="space-y-6">
                {/* 基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nickname" className="text-sm font-bold text-gray-700">昵称</Label>
                    <Input
                      id="nickname"
                      placeholder="给自己起个名字"
                      value={formData.nickname}
                      onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                      disabled={!editing}
                      className="glass-input h-12"
                    />
                    <p className="text-xs text-red-600 font-semibold">* 必填项</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province" className="text-sm font-bold text-gray-700">所在地区</Label>
                    <Input
                      id="province"
                      placeholder="如：北京、上海等"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      disabled={!editing}
                      className="glass-input h-12"
                    />
                  </div>
                </div>

                {/* 性别选择 */}
                <div className="space-y-2">
                  <Label>性别</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        disabled={!editing}
                        className="mr-2"
                      />
                      男
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        disabled={!editing}
                        className="mr-2"
                      />
                      女
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="other"
                        checked={formData.gender === 'other'}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        disabled={!editing}
                        className="mr-2"
                      />
                      其他
                    </label>
                  </div>
                </div>

                {/* 联系方式 */}
                <div className="space-y-2">
                  <Label htmlFor="contact_info" className="text-sm font-bold text-gray-700">联系方式</Label>
                  <Input
                    id="contact_info"
                    placeholder="微信号 / 手机号 / QQ号（匹配成功后可见）"
                    value={formData.contact_info}
                    onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                    disabled={!editing}
                    required
                    className="glass-input h-12"
                  />
                  <p className="text-xs text-red-600 font-semibold">* 必填项，只有双方互相匹配成功后才会显示给对方</p>
                </div>

                {/* 个人简介 */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-bold text-gray-700">个人简介</Label>
                  <Textarea
                    id="bio"
                    placeholder="简单介绍一下自己，比如兴趣爱好、旅行经历等..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!editing}
                    rows={4}
                    className="glass-input resize-none"
                  />
                </div>

                {/* 操作按钮 */}
                {editing && (
                  <div className="flex gap-4 pt-4">
                    {profile?.nickname && profile?.contact_info && (
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="flex-1"
                      >
                        取消
                      </Button>
                    )}
                    <Button
                      onClick={handleSave}
                      disabled={saving || !formData.nickname.trim() || !formData.contact_info?.trim()}
                      className={`${profile?.nickname && profile?.contact_info ? 'flex-1' : 'w-full'} bg-gradient-to-r from-[#2D5A27] to-[#234a1f] hover:from-[#234a1f] hover:to-[#1a3515] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-14 text-base font-bold`}
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          保存并继续
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}