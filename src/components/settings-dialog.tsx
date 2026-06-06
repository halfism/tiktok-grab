'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  FolderOpen, 
  User, 
  FileVideo, 
  Calendar,
  Hash,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

// 下载配置类型
interface DownloadConfig {
  downloadDir: string;           // 主下载目录
  organizeByAuthor: boolean;     // 按作者归档
  organizeByType: boolean;       // 按类型归档
  organizeByDate: boolean;       // 按日期归档
  filenameTemplate: string;      // 文件名模板
  autoSkipExisting: boolean;     // 自动跳过已存在文件
  resolutionPriority: string;    // 分辨率优先级
}

const defaultConfig: DownloadConfig = {
  downloadDir: '/Downloads/DouK-Downloader',
  organizeByAuthor: true,        // 默认按作者归档
  organizeByType: false,
  organizeByDate: false,
  filenameTemplate: '{author}_{title}_{id}',
  autoSkipExisting: true,
  resolutionPriority: 'highest',
};

// 文件名模板变量说明
const templateVariables = [
  { key: '{author}', desc: '作者昵称' },
  { key: '{authorId}', desc: '作者ID' },
  { key: '{title}', desc: '作品标题' },
  { key: '{id}', desc: '作品ID' },
  { key: '{date}', desc: '发布日期' },
  { key: '{type}', desc: '资源类型' },
  { key: '{platform}', desc: '平台名称' },
];

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<DownloadConfig>(defaultConfig);

  // 从localStorage加载配置
  useEffect(() => {
    const saved = localStorage.getItem('douk-download-config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load config:', e);
      }
    }
  }, []);

  // 保存配置到localStorage
  const handleSave = () => {
    localStorage.setItem('douk-download-config', JSON.stringify(config));
    toast.success('设置已保存');
    setOpen(false);
  };

  // 更新配置项
  const updateConfig = (key: keyof DownloadConfig, value: boolean | string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // 获取归档路径示例
  const getArchivePathExample = () => {
    let path = config.downloadDir;
    if (config.organizeByAuthor) path += '/{作者昵称}';
    if (config.organizeByType) path += '/{视频/图集/音频}';
    if (config.organizeByDate) path += '/{发布日期}';
    path += '/{filename}';
    return path;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            下载设置
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            配置下载目录、文件归档方式和命名规则
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 下载目录配置 */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-green-500" />
                下载目录
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label className="text-slate-400 text-xs">主目录路径</Label>
                  <Input
                    value={config.downloadDir}
                    onChange={(e) => updateConfig('downloadDir', e.target.value)}
                    placeholder="/Downloads/DouK-Downloader"
                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="flex items-end">
                  <Badge variant="outline" className="border-slate-700 text-slate-500">
                    浏览...
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                注意：在浏览器环境下，文件会下载到浏览器默认下载目录。桌面应用模式下支持自定义目录。
              </p>
            </CardContent>
          </Card>

          {/* 文件归档配置 */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                文件归档方式
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                选择按作者、类型或日期创建子目录分类存储
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {/* 按作者归档 */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">按作者归档</span>
                  </div>
                  <Switch
                    checked={config.organizeByAuthor}
                    onCheckedChange={(checked) => updateConfig('organizeByAuthor', checked)}
                  />
                </div>

                {/* 按类型归档 */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                  <div className="flex items-center gap-2">
                    <FileVideo className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">按类型归档</span>
                  </div>
                  <Switch
                    checked={config.organizeByType}
                    onCheckedChange={(checked) => updateConfig('organizeByType', checked)}
                  />
                </div>

                {/* 按日期归档 */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">按日期归档</span>
                  </div>
                  <Switch
                    checked={config.organizeByDate}
                    onCheckedChange={(checked) => updateConfig('organizeByDate', checked)}
                  />
                </div>
              </div>

              {/* 路径示例 */}
              <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-400">归档路径示例:</span>
                </div>
                <code className="text-xs text-green-400 font-mono">
                  {getArchivePathExample()}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* 文件命名配置 */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Hash className="w-4 h-4 text-orange-500" />
                文件命名规则
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-400 text-xs">文件名模板</Label>
                <Input
                  value={config.filenameTemplate}
                  onChange={(e) => updateConfig('filenameTemplate', e.target.value)}
                  placeholder="{author}_{title}_{id}"
                  className="mt-1 bg-slate-800 border-slate-700 text-white font-mono"
                />
              </div>

              {/* 模板变量说明 */}
              <div className="grid grid-cols-2 gap-2">
                {templateVariables.map((v) => (
                  <div key={v.key} className="flex items-center gap-2 text-xs">
                    <code className="text-blue-400 font-mono">{v.key}</code>
                    <span className="text-slate-500">{v.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 其他设置 */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">其他设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                <div>
                  <span className="text-sm text-slate-300">跳过已存在文件</span>
                  <p className="text-xs text-slate-500 mt-0.5">自动跳过本地已下载的文件</p>
                </div>
                <Switch
                  checked={config.autoSkipExisting}
                  onCheckedChange={(checked) => updateConfig('autoSkipExisting', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                <div>
                  <span className="text-sm text-slate-300">分辨率优先级</span>
                  <p className="text-xs text-slate-500 mt-0.5">优先下载指定分辨率</p>
                </div>
                <Select
                  value={config.resolutionPriority}
                  onValueChange={(value) => updateConfig('resolutionPriority', value)}
                >
                  <SelectTrigger className="w-[120px] bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="highest">最高画质</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="480p">480p</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 保存按钮 */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-700 text-slate-400"
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              保存设置
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 获取当前配置的Hook
export function useDownloadConfig() {
  const [config, setConfig] = useState<DownloadConfig>(defaultConfig);

  useEffect(() => {
    const saved = localStorage.getItem('douk-download-config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load config:', e);
      }
    }
  }, []);

  return config;
}

// 导出配置类型供其他组件使用
export type { DownloadConfig };
export { defaultConfig };