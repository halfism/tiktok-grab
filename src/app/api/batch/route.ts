import { NextRequest, NextResponse } from 'next/server';

interface BatchTask {
  id: string;
  type: 'account' | 'collection' | 'favorites';
  platform: 'douyin' | 'tiktok';
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total: number;
  completed: number;
  error?: string;
}

// 批量采集任务列表
const batchTasks: Map<string, BatchTask> = new Map();

// 批量采集接口
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      platform, 
      url, 
      concurrency = 3, 
      retryCount = 3,
      skipExisting = true,
      timeRange,
      filters 
    } = body;

    if (!url || !type) {
      return NextResponse.json(
        { error: '请提供链接和采集类型' },
        { status: 400 }
      );
    }

    // 创建任务ID
    const taskId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // 创建任务
    const task: BatchTask = {
      id: taskId,
      type,
      platform,
      url,
      status: 'pending',
      progress: 0,
      total: 0,
      completed: 0,
    };

    batchTasks.set(taskId, task);

    // 在实际项目中，这里应该调用TikTokDownloader后端启动批量任务
    // 示例调用方式:
    // const backendUrl = process.env.TIKTOK_DOWNLOADER_API_URL;
    // const response = await fetch(`${backendUrl}/batch`, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     type, platform, url,
    //     settings: { concurrency, retryCount, skipExisting, timeRange, filters }
    //   }),
    // });

    // 模拟任务进度更新
    setTimeout(() => {
      const t = batchTasks.get(taskId);
      if (t) {
        t.status = 'processing';
        t.total = 50; // 模拟总数
      }
    }, 500);

    // 模拟进度递增
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      const t = batchTasks.get(taskId);
      if (t && t.status === 'processing') {
        currentProgress += 5;
        t.completed = currentProgress;
        t.progress = Math.floor((currentProgress / t.total) * 100);
        
        if (currentProgress >= t.total) {
          t.status = 'completed';
          t.progress = 100;
          clearInterval(progressInterval);
        }
      }
    }, 200);

    return NextResponse.json({
      success: true,
      taskId,
      message: '批量任务已创建（演示模式）',
      settings: {
        concurrency,
        retryCount,
        skipExisting,
        timeRange,
        filters
      }
    });

  } catch (error) {
    console.error('Batch error:', error);
    return NextResponse.json(
      { error: '批量任务创建失败' },
      { status: 500 }
    );
  }
}

// 查询任务状态
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (taskId) {
    const task = batchTasks.get(taskId);
    if (!task) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  }

  // 返回所有任务列表
  return NextResponse.json({
    success: true,
    tasks: Array.from(batchTasks.values()),
  });
}

// 删除任务
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json(
      { error: '请提供任务ID' },
      { status: 400 }
    );
  }

  const deleted = batchTasks.delete(taskId);
  
  return NextResponse.json({
    success: deleted,
    message: deleted ? '任务已删除' : '任务不存在',
  });
}