import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import {
  removeBackgroundWithAI,
  enhanceImage,
  addVignette,
  virtualTryOn,
} from '@/lib/ai-image-processor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const personFile = formData.get('person') as File;
    const dressFile = formData.get('dress') as File;
    const backgroundFile = formData.get('background') as File;
    const removeBgApiKey = formData.get('removeBgApiKey') as string | null;

    if (!personFile || !dressFile || !backgroundFile) {
      return NextResponse.json(
        { error: '缺少必需的图片' },
        { status: 400 }
      );
    }

    // 读取图片
    const personBuffer = Buffer.from(await personFile.arrayBuffer());
    const dressBuffer = Buffer.from(await dressFile.arrayBuffer());
    const backgroundBuffer = Buffer.from(await backgroundFile.arrayBuffer());

    // 使用AI处理图片
    const resultBuffer = await processImagesWithAI(
      personBuffer,
      dressBuffer,
      backgroundBuffer,
      removeBgApiKey || undefined
    );

    return new NextResponse(resultBuffer as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.error('Error processing images:', error);
    return NextResponse.json(
      { error: '图片处理失败' },
      { status: 500 }
    );
  }
}

async function processImagesWithAI(
  personBuffer: Buffer,
  dressBuffer: Buffer,
  backgroundBuffer: Buffer,
  removeBgApiKey?: string
): Promise<Buffer> {
  // 步骤1：使用AI去除人物背景
  const processedPerson = await removeBackgroundWithAI(personBuffer, removeBgApiKey);

  // 步骤2：获取背景图片尺寸
  const background = sharp(backgroundBuffer);
  const backgroundMeta = await background.metadata();
  const targetWidth = backgroundMeta.width || 800;
  const targetHeight = backgroundMeta.height || 600;

  // 步骤3：调整人物大小
  const personResized = await sharp(processedPerson)
    .resize(Math.round(targetWidth * 0.6), null, {
      fit: 'inside',
    })
    .toBuffer();

  // 步骤4：获取调整后的人物尺寸
  const personMeta = await sharp(personResized).metadata();
  const personWidth = personMeta.width || 300;
  const personHeight = personMeta.height || 400;

  // 步骤5：计算人物位置（居中偏下）
  const personX = Math.round((targetWidth - personWidth) / 2);
  const personY = Math.round(targetHeight - personHeight + 50);

  // 步骤6：应用虚拟试衣效果
  const personWithDress = await virtualTryOn(personResized, dressBuffer);

  // 步骤7：合成到背景上
  let composite = await background
    .composite([
      {
        input: personWithDress,
        left: personX,
        top: personY,
      },
    ])
    .toBuffer();

  // 步骤8：增强图像质量（暖色调滤镜）
  composite = await enhanceImage(composite);

  // 步骤9：添加暗角效果
  composite = await addVignette(composite, targetWidth, targetHeight);

  return composite;
}
