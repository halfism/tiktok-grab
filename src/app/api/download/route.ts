import { NextRequest, NextResponse } from 'next/server';

// 下载资源接口
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, filename, type } = body;

    if (!url) {
      return NextResponse.json(
        { error: '请提供下载链接' },
        { status: 400 }
      );
    }

    // 在实际项目中，这里应该调用TikTokDownloader后端进行真实下载
    // 示例调用方式:
    // const backendUrl = process.env.TIKTOK_DOWNLOADER_API_URL;
    // const response = await fetch(`${backendUrl}/download`, {
    //   method: 'POST',
    //   body: JSON.stringify({ url, filename, type }),
    // });
    // return new NextResponse(response.body, {
    //   headers: {
    //     'Content-Type': 'application/octet-stream',
    //     'Content-Disposition': `attachment; filename="${filename}.mp4"`,
    //   },
    // });

    // 模拟下载：返回一个示例文件
    // 由于无法在沙箱环境中实际下载视频文件，这里返回模拟响应
    const mockContent = `这是一个模拟的${type === 'video' ? '视频' : type === 'images' ? '图集' : '音频'}文件。
    
实际部署时需要连接到TikTokDownloader后端服务进行真实下载。

部署指南:
1. 安装并运行 TikTokDownloader 的 Web API 模式
2. 在环境变量中配置: TIKTOK_DOWNLOADER_API_URL=http://127.0.0.1:5555
3. 前端会自动调用后端进行真实的视频解析和下载

文件名: ${filename}
类型: ${type}
下载时间: ${new Date().toISOString()}`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // 模拟下载进度
        let progress = 0;
        const total = 100;
        
        const interval = setInterval(() => {
          progress += 10;
          if (progress <= total) {
            controller.enqueue(encoder.encode(`进度: ${progress}%\n`));
          } else {
            clearInterval(interval);
            controller.enqueue(encoder.encode(mockContent));
            controller.close();
          }
        }, 100);
      },
    });

    const extension = type === 'video' ? 'mp4' : type === 'audio' ? 'mp3' : 'zip';
    
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}.${extension}"`,
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: '下载失败' },
      { status: 500 }
    );
  }
}

// 流式下载接口（支持大文件）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'download';

  if (!url) {
    return NextResponse.json(
      { error: '请提供下载链接' },
      { status: 400 }
    );
  }

  // 实际部署时，这里应该代理真实的下载流
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: '资源获取失败' },
        { status: response.status }
      );
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Stream download error:', error);
    return NextResponse.json(
      { error: '下载失败' },
      { status: 500 }
    );
  }
}