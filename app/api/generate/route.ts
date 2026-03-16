import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  console.log('=== API 被调用 ===');
  
  try {
    const formData = await request.formData();
    const personFile = formData.get('person') as File;
    const dressFile = formData.get('dress') as File;
    const backgroundFile = formData.get('background') as File;

    console.log('收到请求，文件:', {
      person: personFile?.name,
      dress: dressFile?.name,
      background: backgroundFile?.name
    });

    if (!personFile || !dressFile || !backgroundFile) {
      console.log('错误: 缺少文件');
      return NextResponse.json(
        { error: '请上传所有三张图片' },
        { status: 400 }
      );
    }

    // 读取图片
    const personBuffer = Buffer.from(await personFile.arrayBuffer());
    const dressBuffer = Buffer.from(await dressFile.arrayBuffer());
    const backgroundBuffer = Buffer.from(await backgroundFile.arrayBuffer());

    console.log('图片大小:', {
      person: personBuffer.length,
      dress: dressBuffer.length,
      background: backgroundBuffer.length
    });

    // 简化的处理逻辑
    const resultBuffer = await processImagesSimple(
      personBuffer,
      dressBuffer,
      backgroundBuffer
    );

    console.log('处理完成，结果大小:', resultBuffer.length);

    return new NextResponse(resultBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.error('严重错误:', error);
    return NextResponse.json(
      { error: `生成失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}

async function processImagesSimple(
  personBuffer: Buffer,
  dressBuffer: Buffer,
  backgroundBuffer: Buffer
): Promise<Buffer> {
  console.log('开始处理...');

  // 获取背景尺寸
  const background = sharp(backgroundBuffer);
  const backgroundMeta = await background.metadata();
  const targetWidth = backgroundMeta.width || 800;
  const targetHeight = backgroundMeta.height || 600;

  console.log(`目标尺寸: ${targetWidth}x${targetHeight}`);

  // 调整人物大小
  const personResized = await sharp(personBuffer)
    .resize(Math.round(targetWidth * 0.5), null, {
      fit: 'inside',
    })
    .toBuffer();

  const personMeta = await sharp(personResized).metadata();
  const personWidth = personMeta.width || 300;
  const personHeight = personMeta.height || 400;

  // 计算位置
  const personX = Math.round((targetWidth - personWidth) / 2);
  const personY = Math.round(targetHeight - personHeight + 30);

  console.log(`人物位置: (${personX}, ${personY})`);

  // 简单合成
  let result = await background
    .composite([
      {
        input: personResized,
        left: personX,
        top: personY,
      },
    ])
    .toBuffer();

  // 应用滤镜
  result = await sharp(result)
    .modulate({
      brightness: 1.08,
      saturation: 1.15,
    })
    .linear(1.05, 15)
    .toBuffer();

  console.log('处理完成！');
  
  return result;
}
