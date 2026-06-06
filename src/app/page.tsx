'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Link2, 
  Video, 
  Image, 
  Music, 
  Radio, 
  Settings, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  ExternalLink,
  FolderDown
} from 'lucide-react';
import { toast } from 'sonner';

// 解析结果类型定义
interface ParseResult {
  id: string;
  platform: 'douyin' | 'tiktok';
  type: 'video' | 'images' | 'audio' | 'live';
  title: string;
  author: string;
  authorId: string;
  coverUrl: string;
  duration?: number;
  resolution?: string;
  downloadUrl: string;
  createTime: string;
  likes: number;
  shares: number;
  comments: number;
}

// 下载任务类型
interface DownloadTask {
  id: string;
  result: ParseResult;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

export default function Home() {
  const [inputUrl, setInputUrl] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResults, setParseResults] = useState<ParseResult[]>([]);
  const [downloadTasks, setDownloadTasks] = useState<DownloadTask[]>([]);
  const [activeTab, setActiveTab] = useState('parse');

  // 平台检测
  const detectPlatform = (url: string): 'douyin' | 'tiktok' | null => {
    if (url.includes('douyin.com') || url.includes('iesdouyin.com')) {
      return 'douyin';
    }
    if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) {
      return 'tiktok';
    }
    return null;
  };

  // 解析链接
  const handleParse = async () => {
    if (!inputUrl.trim()) {
      toast.error('请输入链接地址');
      return;
    }

    const platform = detectPlatform(inputUrl);
    if (!platform) {
      toast.error('无法识别的链接格式，请输入抖音或TikTok链接');
      return;
    }

    setIsParsing(true);
    
    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl, platform }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '解析失败');
      }

      setParseResults(prev => [data.result, ...prev]);
      toast.success('解析成功！');
      setInputUrl('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '解析失败，请检查链接';
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  };

  // 下载单个资源
  const handleDownload = async (result: ParseResult) => {
    const task: DownloadTask = {
      id: `${result.id}-${Date.now()}`,
      result,
      status: 'downloading',
      progress: 0,
    };

    setDownloadTasks(prev => [task, ...prev]);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: result.downloadUrl, 
          filename: `${result.author}_${result.title}_${result.id}`,
          type: result.type
        }),
      });

      if (!response.ok) {
        throw new Error('下载失败');
      }

      // 获取文件blob并触发下载
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.author}_${result.title}_${result.id}.${result.type === 'video' ? 'mp4' : result.type === 'audio' ? 'mp3' : 'zip'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadTasks(prev => 
        prev.map(t => t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t)
      );
      toast.success('下载完成！');
    } catch (error) {
      setDownloadTasks(prev => 
        prev.map(t => t.id === task.id ? { ...t, status: 'failed', error: '下载失败' } : t)
      );
      toast.error('下载失败');
    }
  };

  // 批量下载
  const handleBatchDownload = async () => {
    for (const result of parseResults) {
      await handleDownload(result);
    }
  };

  // 复制链接
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('链接已复制');
  };

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'images': return <Image className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'live': return <Radio className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  // 格式化时长
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* 顶部导航 */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">DouK-Downloader</span>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                v1.0
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-slate-400 border-slate-700">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" />
                  抖音
                </span>
              </Badge>
              <Badge variant="outline" className="text-slate-400 border-slate-700">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" />
                  TikTok
                </span>
              </Badge>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 链接输入区域 */}
        <Card className="bg-slate-900/50 border-slate-800/50 mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-500" />
              粘贴链接解析
            </CardTitle>
            <CardDescription className="text-slate-400">
              支持抖音、TikTok视频、图集、音频链接，自动识别平台和资源类型
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="粘贴抖音或TikTok链接..."
                className="flex-1 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <Button
                onClick={handleParse}
                disabled={isParsing}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6"
              >
                {isParsing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                解析
              </Button>
            </div>
            
            {/* 快捷提示 */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-slate-500 border-slate-700 cursor-default">
                支持: 视频链接
              </Badge>
              <Badge variant="outline" className="text-slate-500 border-slate-700 cursor-default">
                支持: 图集链接
              </Badge>
              <Badge variant="outline" className="text-slate-500 border-slate-700 cursor-default">
                支持: 账号主页
              </Badge>
              <Badge variant="outline" className="text-slate-500 border-slate-700 cursor-default">
                支持: 合集链接
              </Badge>
              <Badge variant="outline" className="text-slate-500 border-slate-700 cursor-default">
                支持: 直播链接
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 标签页切换 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700/50">
            <TabsTrigger 
              value="parse" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-400"
            >
              解析结果 ({parseResults.length})
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-400"
            >
              下载任务 ({downloadTasks.length})
            </TabsTrigger>
            <TabsTrigger 
              value="batch" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-400"
            >
              批量采集
            </TabsTrigger>
          </TabsList>

          {/* 解析结果列表 */}
          <TabsContent value="parse" className="space-y-4">
            {parseResults.length === 0 ? (
              <Card className="bg-slate-900/30 border-slate-800/30">
                <CardContent className="py-12 text-center">
                  <div className="text-slate-500 flex flex-col items-center gap-3">
                    <Video className="w-12 h-12 opacity-30" />
                    <p>暂无解析结果</p>
                    <p className="text-sm">粘贴链接后点击解析按钮开始</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* 批量下载按钮 */}
                {parseResults.length > 1 && (
                  <Button
                    onClick={handleBatchDownload}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <FolderDown className="w-4 h-4 mr-2" />
                    一键下载全部 ({parseResults.length})
                  </Button>
                )}
                
                {/* 结果卡片网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {parseResults.map((result) => (
                    <Card 
                      key={result.id} 
                      className="bg-slate-900/50 border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/70 transition-all duration-200 group"
                    >
                      {/* 封面图 */}
                      <div className="relative aspect-video bg-slate-800 overflow-hidden rounded-t-lg">
                        <img 
                          src={result.coverUrl} 
                          alt={result.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* 类型标识 */}
                        <div className="absolute top-2 left-2 flex gap-1.5">
                          <Badge className="bg-black/70 text-white border-0">
                            {getTypeIcon(result.type)}
                            {result.type === 'video' ? '视频' : result.type === 'images' ? '图集' : result.type === 'audio' ? '音频' : '直播'}
                          </Badge>
                          {result.resolution && (
                            <Badge className="bg-black/70 text-white border-0">
                              {result.resolution}
                            </Badge>
                          )}
                        </div>
                        {/* 时长 */}
                        {result.duration && (
                          <div className="absolute bottom-2 right-2">
                            <Badge className="bg-black/70 text-white border-0">
                              {formatDuration(result.duration)}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        {/* 标题 */}
                        <h3 className="text-white font-medium line-clamp-2 mb-2 text-sm">
                          {result.title}
                        </h3>
                        
                        {/* 作者信息 */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="text-slate-400 text-xs">@{result.author}</div>
                          <Badge variant="outline" className="text-xs border-slate-700 text-slate-500">
                            {result.platform === 'douyin' ? '抖音' : 'TikTok'}
                          </Badge>
                        </div>
                        
                        {/* 统计数据 */}
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                          <span>❤ {formatNumber(result.likes)}</span>
                          <span>💬 {formatNumber(result.comments)}</span>
                          <span>↗ {formatNumber(result.shares)}</span>
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleDownload(result)}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                            下载
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyLink(result.downloadUrl)}
                            className="border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* 下载任务列表 */}
          <TabsContent value="tasks" className="space-y-4">
            {downloadTasks.length === 0 ? (
              <Card className="bg-slate-900/30 border-slate-800/30">
                <CardContent className="py-12 text-center">
                  <div className="text-slate-500 flex flex-col items-center gap-3">
                    <FolderDown className="w-12 h-12 opacity-30" />
                    <p>暂无下载任务</p>
                    <p className="text-sm">点击解析结果中的下载按钮开始</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {downloadTasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className="bg-slate-900/50 border-slate-800/50"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* 状态图标 */}
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                          {task.status === 'downloading' && (
                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                          )}
                          {task.status === 'completed' && (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          )}
                          {task.status === 'failed' && (
                            <XCircle className="w-6 h-6 text-red-500" />
                          )}
                          {task.status === 'pending' && (
                            <div className="w-6 h-6 rounded-full bg-slate-600" />
                          )}
                        </div>
                        
                        {/* 任务信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white text-sm truncate">{task.result.title}</h4>
                            <Badge variant="outline" className="text-xs border-slate-700 text-slate-500">
                              @{task.result.author}
                            </Badge>
                          </div>
                          
                          {/* 进度条 */}
                          {task.status === 'downloading' && (
                            <Progress value={task.progress} className="h-2 bg-slate-800" />
                          )}
                          
                          {/* 状态文字 */}
                          <div className="text-xs text-slate-500 mt-1">
                            {task.status === 'downloading' && `下载中... ${task.progress}%`}
                            {task.status === 'completed' && '下载完成'}
                            {task.status === 'failed' && (task.error || '下载失败')}
                            {task.status === 'pending' && '等待下载'}
                          </div>
                        </div>
                        
                        {/* 重试按钮 */}
                        {task.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(task.result)}
                            className="border-slate-700 text-slate-400 hover:text-white"
                          >
                            重试
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 批量采集 */}
          <TabsContent value="batch" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FolderDown className="w-5 h-5 text-green-500" />
                  批量采集配置
                </CardTitle>
                <CardDescription className="text-slate-400">
                  输入账号主页链接或合集链接，批量采集所有作品
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 账号作品采集 */}
                  <div className="p-4 rounded-lg bg-slate-800/30 border-slate-700/30">
                    <h4 className="text-white mb-2 flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-500" />
                      账号作品采集
                    </h4>
                    <Input
                      placeholder="输入账号主页链接..."
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      支持采集账号的发布作品、喜欢作品、收藏作品
                    </p>
                  </div>
                  
                  {/* 合集采集 */}
                  <div className="p-4 rounded-lg bg-slate-800/30 border-slate-700/30">
                    <h4 className="text-white mb-2 flex items-center gap-2">
                      <FolderDown className="w-4 h-4 text-green-500" />
                      合集/合辑采集
                    </h4>
                    <Input
                      placeholder="输入合集链接..."
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      支持抖音合集、TikTok合辑批量下载
                    </p>
                  </div>
                </div>
                
                {/* 高级参数配置 */}
                <div className="p-4 rounded-lg bg-slate-800/30 border-slate-700/30">
                  <h4 className="text-white mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-400" />
                    采集参数配置
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">并发任务数</label>
                      <Input 
                        type="number" 
                        defaultValue={3}
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">失败重试次数</label>
                      <Input 
                        type="number" 
                        defaultValue={3}
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">时间范围</label>
                      <Input 
                        placeholder="全部"
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">跳过已下载</label>
                      <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-400">
                        开启
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                  <FolderDown className="w-4 h-4 mr-2" />
                  开始批量采集
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* 底部信息 */}
      <footer className="border-t border-slate-800/50 bg-slate-950/80 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-slate-500 text-sm">
              基于 <ExternalLink className="w-3 h-3 inline mr-1" />
              <a 
                href="https://github.com/JoeanAmier/TikTokDownloader" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                JoeanAmier/TikTokDownloader
              </a> 开发
            </div>
            <div className="text-slate-500 text-sm">
              本工具仅供个人学习使用，请遵守平台服务条款
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}