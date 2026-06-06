import { NextRequest, NextResponse } from 'next/server';

// 归档配置类型
interface ArchiveConfig {
  downloadDir: string;
  organizeByAuthor: boolean;
  organizeByType: boolean;
  organizeByDate: boolean;
}

// 构建归档文件名（包含子目录路径）
function buildArchiveFilename(
  filename: string,
  archivePath: string,
  author: string,
  authorId: string
): string {
  // 在浏览器下载场景下，使用"作者_子路径_文件名"格式模拟归档
  // 实际桌面应用模式下会创建真实的子目录结构
  const safeAuthor = author.replace(/[<>:"\/\\|?*]/g, '_');
  
  // 将归档路径转换为文件名前缀（模拟目录结构）
  const pathParts = archivePath.split('/').filter(Boolean);
  if (pathParts.length > 0) {
    return `${safeAuthor}_${pathParts.join('_')}_${filename}`;
  }
  
  return `${safeAuthor}_${filename}`;
}

// 编码文件名以支持中文（RFC 5987）
function encodeFilename(filename: string): string {
  // 使用URL编码处理非ASCII字符
  const encoded = encodeURIComponent(filename);
  return `filename*=UTF-8''${encoded}`;
}

// 下载资源接口
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      url, 
      filename, 
      type, 
      archivePath,
      config,
      author,
      authorId 
    } = body as {
      url: string;
      filename: string;
      type: 'video' | 'images' | 'audio' | 'live';
      archivePath?: string;
      config?: ArchiveConfig;
      author?: string;
      authorId?: string;
    };

    if (!url) {
      return NextResponse.json(
        { error: '请提供下载链接' },
        { status: 400 }
      );
    }

    // 构建归档文件名
    const archiveFilename = archivePath && author 
      ? buildArchiveFilename(filename, archivePath, author, authorId || '')
      : filename;

    // 在实际项目中，这里应该调用TikTokDownloader后端进行真实下载
    // 当前为演示模式，返回模拟内容

    const archiveInfo = config ? `
归档配置:
- 主目录: ${config.downloadDir}
- 按作者归档: ${config.organizeByAuthor ? '开启' : '关闭'}
- 按类型归档: ${config.organizeByType ? '开启' : '关闭'}  
- 按日期归档: ${config.organizeByDate ? '开启' : '关闭'}
- 实际归档路径: ${config.downloadDir}${archivePath}

文件归档路径结构示例:
${config.downloadDir}
${config.organizeByAuthor ? `└── ${author}/` : ''}
${config.organizeByType ? `    └── ${type === 'video' ? '视频' : type === 'images' ? '图集' : '音频'}/` : ''}
${config.organizeByDate ? `        └── ${new Date().toISOString().split('T')[0]}/` : ''}
            └── ${filename}` : '';

    const mockContent = `=== DouK-Downloader 下载文件 ===

这是一个模拟的${type === 'video' ? '视频' : type === 'images' ? '图集' : '音频'}文件。
    
实际部署时需要连接到TikTokDownloader后端服务进行真实下载。

作者: ${author || '未知'}
作者ID: ${authorId || '未知'}
文件名: ${filename}
类型: ${type}
下载时间: ${new Date().toISOString()}
${archiveInfo}

=== 提示 ===
浏览器下载模式下，文件会保存到浏览器默认下载目录。
如需自定义下载目录和归档结构，请使用桌面应用版本（Electron打包）。`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        try {
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
        } catch (streamError) {
          controller.error(streamError);
        }
      },
    });

    const extension = type === 'video' ? 'mp4' : type === 'audio' ? 'mp3' : 'zip';
    
    // 对中文路径进行编码（HTTP headers不支持非ASCII字符）
    const encodedArchivePath = archivePath ? encodeURIComponent(archivePath) : '';
    
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; ${encodeFilename(`${archiveFilename}.${extension}`)}`,
        'Transfer-Encoding': 'chunked',
        'X-Archive-Path': encodedArchivePath,
        'X-Archive-Config': JSON.stringify(config || {}),
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
  const archivePath = searchParams.get('archivePath') || '';

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

    const archiveFilename = archivePath 
      ? `${archivePath.replace(/\//g, '_')}_${filename}`
      : filename;

    // 对中文路径进行编码（HTTP headers不支持非ASCII字符）
    const encodedArchivePath = archivePath ? encodeURIComponent(archivePath) : '';
    
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': `attachment; ${encodeFilename(archiveFilename)}`,
        'X-Archive-Path': encodedArchivePath,
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