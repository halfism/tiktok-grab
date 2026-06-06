import { NextRequest, NextResponse } from 'next/server';

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

// 从URL提取作品ID
function extractIdFromUrl(url: string, platform: string): string {
  // 抖音链接格式解析
  // https://v.douyin.com/xxx 或 https://www.douyin.com/video/xxx
  const douyinPatterns = [
    /douyin\.com\/video\/(\d+)/,
    /v\.douyin\.com\/([A-Za-z0-9]+)/,
  ];

  // TikTok链接格式解析
  // https://www.tiktok.com/@user/video/xxx 或 https://vm.tiktok.com/xxx
  const tiktokPatterns = [
    /tiktok\.com\/@[\w.]+\/video\/(\d+)/,
    /vm\.tiktok\.com\/([A-Za-z0-9]+)/,
  ];

  if (platform === 'douyin') {
    for (const pattern of douyinPatterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
  } else {
    for (const pattern of tiktokPatterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
  }

  // 生成随机ID作为演示
  return `demo_${Date.now()}`;
}

// 模拟解析结果（实际项目中需要调用TikTokDownloader后端）
function generateMockResult(url: string, platform: 'douyin' | 'tiktok'): ParseResult {
  const id = extractIdFromUrl(url, platform);
  const randomData = {
    likes: Math.floor(Math.random() * 100000),
    shares: Math.floor(Math.random() * 10000),
    comments: Math.floor(Math.random() * 5000),
  };

  return {
    id,
    platform,
    type: Math.random() > 0.3 ? 'video' : 'images',
    title: `精彩内容演示 - ${id.slice(-6)}`,
    author: platform === 'douyin' ? '抖音创作者' : 'TikTok Creator',
    authorId: `author_${Math.floor(Math.random() * 10000)}`,
    coverUrl: platform === 'douyin' 
      ? 'https://picsum.photos/seed/douyin/400/300'
      : 'https://picsum.photos/seed/tiktok/400/300',
    duration: Math.floor(Math.random() * 60) + 15,
    resolution: '1080p',
    downloadUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/download/mock/${id}`,
    createTime: new Date().toISOString(),
    ...randomData,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, platform } = body;

    if (!url) {
      return NextResponse.json(
        { error: '请提供链接地址' },
        { status: 400 }
      );
    }

    // 验证链接格式
    const validDouyinPattern = /douyin\.com|iesdouyin\.com/;
    const validTiktokPattern = /tiktok\.com|vm\.tiktok\.com/;

    if (platform === 'douyin' && !validDouyinPattern.test(url)) {
      return NextResponse.json(
        { error: '无效的抖音链接格式' },
        { status: 400 }
      );
    }

    if (platform === 'tiktok' && !validTiktokPattern.test(url)) {
      return NextResponse.json(
        { error: '无效的TikTok链接格式' },
        { status: 400 }
      );
    }

    // 在实际项目中，这里应该调用TikTokDownloader的Python后端API
    // 示例调用方式:
    // const backendUrl = process.env.TIKTOK_DOWNLOADER_API_URL;
    // const response = await fetch(`${backendUrl}/parse`, {
    //   method: 'POST',
    //   body: JSON.stringify({ url, platform }),
    // });

    // 模拟解析延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    // 返回模拟结果（实际项目中返回真实解析数据）
    const result = generateMockResult(url, platform);

    return NextResponse.json({ 
      success: true,
      result,
      message: '解析成功（演示模式）'
    });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: '解析失败，请检查链接格式' },
      { status: 500 }
    );
  }
}

// GET方法用于查询已解析的历史记录
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: '请提供作品ID' },
      { status: 400 }
    );
  }

  // 模拟查询历史记录
  return NextResponse.json({
    success: true,
    result: generateMockResult(`https://v.douyin.com/${id}`, 'douyin'),
  });
}