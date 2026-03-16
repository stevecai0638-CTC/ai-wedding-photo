import sharp from 'sharp';

// 本地图像处理（不需要任何API密钥）
export async function removeBackgroundWithAI(
  imageBuffer: Buffer,
  apiKey?: string
): Promise<Buffer> {
  // 优先使用本地算法，确保100%可用
  try {
    return await removeBackgroundLocally(imageBuffer);
  } catch (error) {
    console.error('本地背景去除失败:', error);
    // 如果本地算法失败，返回原始图片
    return imageBuffer;
  }
}

// 本地背景去除算法（基于颜色检测）
async function removeBackgroundLocally(imageBuffer: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(imageBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const newData = Buffer.from(data);

  // 分析图片中心区域的颜色作为主体颜色
  const centerStartY = Math.floor(height * 0.3);
  const centerEndY = Math.floor(height * 0.7);
  const centerStartX = Math.floor(width * 0.3);
  const centerEndX = Math.floor(width * 0.7);

  // 计算中心区域的平均颜色
  let sumR = 0, sumG = 0, sumB = 0, count = 0;
  
  for (let y = centerStartY; y < centerEndY; y++) {
    for (let x = centerStartX; x < centerEndX; x++) {
      const i = (y * width + x) * channels;
      sumR += data[i];
      sumG += data[i + 1];
      sumB += data[i + 2];
      count++;
    }
  }
  
  const avgR = sumR / count;
  const avgG = sumG / count;
  const avgB = sumB / count;

  // 对每个像素进行处理
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // 计算与中心颜色的差异
      const diff = Math.abs(r - avgR) + Math.abs(g - avgG) + Math.abs(b - avgB);

      // 如果像素与中心区域差异很大（可能是背景），降低透明度
      if (diff > 80 && channels === 4) {
        // 尝试检测是否为背景（白色/灰色/蓝色天空等）
        const isBright = r > 200 && g > 200 && b > 200;
        const isSkyBlue = b > r && b > g && b > 180;
        
        if (isBright || isSkyBlue) {
          // 背景像素，降低透明度
          const alpha = Math.max(0, 255 - (diff * 2));
          newData[i + 3] = alpha;
        }
      }
    }
  }

  return sharp(newData, {
    raw: { width, height, channels },
  })
    .png()
    .toBuffer();
}

// 增强图像质量
export async function enhanceImage(imageBuffer: Buffer): Promise<Buffer> {
  return await sharp(imageBuffer)
    .modulate({
      brightness: 1.08,
      saturation: 1.15,
    })
    .linear(1.05, 15)
    .toBuffer();
}

// 添加暗角效果
export async function addVignette(
  imageBuffer: Buffer,
  width: number,
  height: number
): Promise<Buffer> {
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.max(width, height) * 0.7;

  // 创建径向渐变
  const gradient = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 计算暗角强度（距离中心越远越暗）
      const intensity = Math.min(1, Math.max(0, (distance - maxRadius * 0.3) / (maxRadius * 0.4)));
      const alpha = Math.round(intensity * 80);

      const i = (y * width + x) * 4;
      gradient[i] = 0;
      gradient[i + 1] = 0;
      gradient[i + 2] = 0;
      gradient[i + 3] = alpha;
    }
  }

  return sharp(imageBuffer)
    .composite([
      {
        input: gradient,
        blend: 'multiply',
      },
    ])
    .toBuffer();
}

// 虚拟试衣效果（使用混合模式）
export async function virtualTryOn(
  personBuffer: Buffer,
  dressBuffer: Buffer
): Promise<Buffer> {
  const person = sharp(personBuffer);
  const dress = sharp(dressBuffer);

  const personMeta = await person.metadata();
  const dressMeta = await dress.metadata();

  // 调整婚纱图片大小以匹配人物
  const dressResized = await dress
    .resize(personMeta.width || 300, personMeta.height || 400, {
      fit: 'cover',
    })
    .toBuffer();

  // 使用overlay混合模式叠加婚纱效果
  return await sharp(personBuffer)
    .composite([
      {
        input: await sharp(dressResized)
          .modulate({ brightness: 0.6, saturation: 0.8 })
          .toBuffer(),
        blend: 'soft-light',
      },
    ])
    .toBuffer();
}
