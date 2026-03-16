import sharp from 'sharp';

// AI服务配置
const AI_SERVICES = {
  removebg: {
    apiUrl: 'https://api.remove.bg/v1.0/removebg',
  },
  huggingface: {
    apiUrl: 'https://api-inference.huggingface.co/models',
    models: {
      segmentation: 'briaai/RMBG-1.4', // 背景去除模型
      inpainting: 'stabilityai/stable-diffusion-xl-base-1.0', // 图像修复模型
    },
  },
};

export async function removeBackgroundWithAI(
  imageBuffer: Buffer,
  apiKey?: string
): Promise<Buffer> {
  // 如果有remove.bg API密钥，优先使用
  if (apiKey) {
    try {
      return await removeBackgroundWithRemoveBG(imageBuffer, apiKey);
    } catch (error) {
      console.warn('Remove.bg API失败，使用备用方案:', error);
    }
  }

  // 使用Hugging Face的背景去除模型
  try {
    return await removeBackgroundWithHuggingFace(imageBuffer);
  } catch (error) {
    console.warn('Hugging Face API失败，使用本地算法:', error);
    return await removeBackgroundLocally(imageBuffer);
  }
}

// 使用remove.bg API
async function removeBackgroundWithRemoveBG(
  imageBuffer: Buffer,
  apiKey: string
): Promise<Buffer> {
  const formData = new FormData();
  const uint8Array = new Uint8Array(imageBuffer);
  const blob = new Blob([uint8Array], { type: 'image/png' });
  formData.append('image_file', blob, 'image.png');
  formData.append('size', 'auto');

  const response = await fetch(AI_SERVICES.removebg.apiUrl, {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Remove.bg API错误: ${error}`);
  }

  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

// 使用Hugging Face的背景去除模型
async function removeBackgroundWithHuggingFace(
  imageBuffer: Buffer
): Promise<Buffer> {
  const response = await fetch(
    `${AI_SERVICES.huggingface.apiUrl}/${AI_SERVICES.huggingface.models.segmentation}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: imageBuffer as unknown as BodyInit,
    }
  );

  if (!response.ok) {
    throw new Error(`Hugging Face API错误: ${response.statusText}`);
  }

  // Hugging Face返回的是PNG格式的透明背景图像
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

// 本地背景去除算法（fallback）
async function removeBackgroundLocally(imageBuffer: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(imageBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const newData = Buffer.from(data);

  const threshold = 220; // 亮度阈值

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // 计算亮度
    const brightness = (r + g + b) / 3;

    // 如果像素很亮，减少透明度
    if (brightness > threshold) {
      newData[i + 3] = Math.max(0, newData[i + 3] - 200);
    } else if (brightness > 180) {
      newData[i + 3] = Math.max(0, newData[i + 3] - 100);
    }
  }

  return sharp(newData, {
    raw: { width, height, channels },
  })
    .toFormat('png')
    .toBuffer();
}

// 增强图像质量
export async function enhanceImage(imageBuffer: Buffer): Promise<Buffer> {
  return await sharp(imageBuffer)
    .modulate({
      brightness: 1.05,
      saturation: 1.1,
    })
    .linear(1.02, 10)
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
      const intensity = Math.min(1, (distance - maxRadius * 0.3) / (maxRadius * 0.4));
      const alpha = Math.round(intensity * 100);

      const i = (y * width + x) * 4;
      gradient[i] = 0;     // R
      gradient[i + 1] = 0; // G
      gradient[i + 2] = 0; // B
      gradient[i + 3] = alpha; // A
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

// 虚拟试衣效果（模拟）
export async function virtualTryOn(
  personBuffer: Buffer,
  dressBuffer: Buffer
): Promise<Buffer> {
  // 这是一个简化版本，真实的虚拟试衣需要专门的AI模型
  // 使用图像混合来模拟效果
  const person = sharp(personBuffer);
  const dress = sharp(dressBuffer);

  const personMeta = await person.metadata();
  const dressMeta = await dress.metadata();

  // 调整婚纱图片大小
  const dressResized = await dress
    .resize(personMeta.width, personMeta.height, {
      fit: 'cover',
    })
    .toBuffer();

  // 使用overlay混合模式
  return await person
    .composite([
      {
        input: await sharp(dressResized)
          .modulate({ brightness: 0.7 })
          .toBuffer(),
        blend: 'overlay',
      },
    ])
    .toBuffer();
}
