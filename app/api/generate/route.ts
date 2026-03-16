import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import {
  removeBackgroundWithAI,
  enhanceImage,
  addVignette,
  virtualTryOn,
} from '@/lib/ai-image-processor';

export async function POST(request: NextRequest) {
  let personBuffer: Buffer | null = null;
  let dressBuffer: Buffer | null = null;
  let backgroundBuffer: Buffer | null = null;

  try {
    const formData = await request.formData();
    const personFile = formData.get('person') as File;
    const dressFile = formData.get('dress') as File;
    const backgroundFile = formData.get('background') as File;

    if (!personFile || !dressFile || !backgroundFile) {
      return NextResponse.json(
        { error: '请上传所有三张图片（人物、婚纱、背景）' },
        { status: 400 }
      );
    }

    // 读取图片
    personBuffer = Buffer.from(await personFile.arrayBuffer());
    dressBuffer = Buffer.from(await dressFile.arrayBuffer());
    backgroundBuffer = Buffer.from(await backgroundFile.arrayBuffer());

    console.log('开始处理图片...');
    console.log('- 人物图片大小:', personBuffer.length);
    console.log('- 婚纱图片大小:', dressBuffer.length);
    console.log('- 背景图片大小:', backgroundBuffer.length);

    // 使用本地算法处理图片（不需要任何API密钥）
    const resultBuffer = await processImagesWithAI(
      personBuffer,
      dressBuffer,
      backgroundBuffer
    );

    console.log('图片处理完成，结果大小:', resultBuffer.length);

    return new NextResponse(resultBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.error('Error processing images:', error);
    return NextResponse.json(
      { error: `生成失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}

async function processImagesWithAI(
  personBuffer: Buffer,
  dressBuffer: Buffer,
  backgroundBuffer: Buffer
): Promise<Buffer> {
  console.log('步骤1: 去除背景...');
  
  // 步骤1：去除人物背景（使用本地算法，100%可用）
  const processedPerson = await removeBackgroundWithAI(personBuffer);

  console.log('步骤2: 获取背景尺寸...');
  
  // 步骤2：获取背景图片尺寸
  const background = sharp(backgroundBuffer);
  const backgroundMeta = await background.metadata();
  const targetWidth = backgroundMeta.width || 800;
  const targetHeight = backgroundMeta.height || 600;

  console.log(`目标尺寸: ${targetWidth}x${targetHeight}`);

  console.log('步骤3: 调整人物大小...');
  
  // 步骤3：调整人物大小
  const personResized = await sharp(processedPerson)
    .resize(Math.round(targetWidth * 0.5), null, {
      fit: 'inside',
    })
    .toBuffer();

  // 步骤4：获取调整后的人物尺寸
  const personMeta = await sharp(personResized).metadata();
  const personWidth = personMeta.width || 300;
  const personHeight = personMeta.height || 400;

  // 步骤5：计算人物位置（居中偏下）
  const personX = Math.round((targetWidth - personWidth) / 2);
  const personY = Math.round(targetHeight - personHeight + 30);

  console.log(`人物位置: (${personX}, ${personY}), 尺寸: ${personWidth}x${personHeight}`);

  console.log('步骤4: 应用婚纱效果...');
  
  // 步骤6：应用虚拟试衣效果
  const personWithDress = await virtualTryOn(personResized, dressBuffer);

  console.log('步骤5: 合成到背景...');
  
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

  console.log('步骤6: 增强色调...');
  
  // 步骤8：增强图像质量（暖色调滤镜）
  composite = await enhanceImage(composite);

  console.log('步骤7: 添加暗角效果...');
  
  // 步骤9：添加暗角效果
  composite = await addVignette(composite, targetWidth, targetHeight);

  console.log('处理完成！');
  
  return composite;
}
