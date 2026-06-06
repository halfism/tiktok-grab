import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'DouK-Downloader | 短视频无水印解析下载',
    template: '%s | DouK-Downloader',
  },
  description:
    '抖音/TikTok短视频无水印解析下载工具，支持视频、图集、音频采集，批量下载账号作品、合集内容，提供高清原画质量输出。',
  keywords: [
    '抖音下载',
    'TikTok下载',
    '无水印视频',
    '短视频解析',
    '批量下载',
    'DouK-Downloader',
    '视频采集',
  ],
  authors: [{ name: 'DouK-Downloader Team', url: 'https://github.com/JoeanAmier/TikTokDownloader' }],
  generator: 'DouK-Downloader',
  openGraph: {
    title: 'DouK-Downloader | 短视频无水印解析下载工具',
    description: '抖音/TikTok短视频无水印解析下载，支持批量采集、高清原画输出。',
    url: 'https://github.com/JoeanAmier/TikTokDownloader',
    siteName: 'DouK-Downloader',
    locale: 'zh_CN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased">
        <Inspector>
          {children}
        </Inspector>
      </body>
    </html>
  );
}