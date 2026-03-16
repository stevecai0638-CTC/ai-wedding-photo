'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

export default function Home() {
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [dressImage, setDressImage] = useState<File | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removeBgApiKey, setRemoveBgApiKey] = useState<string>('');
  const [showApiSettings, setShowApiSettings] = useState(false);

  const personRef = useRef<HTMLInputElement>(null);
  const dressRef = useRef<HTMLInputElement>(null);
  const backgroundRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'person' | 'dress' | 'background'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'person') setPersonImage(file);
    if (type === 'dress') setDressImage(file);
    if (type === 'background') setBackgroundImage(file);
  };

  const handleGenerate = async () => {
    if (!personImage || !dressImage || !backgroundImage) {
      setError('请上传所有三张图片');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('person', personImage);
      formData.append('dress', dressImage);
      formData.append('background', backgroundImage);

      // 添加API密钥（如果有）
      if (removeBgApiKey) {
        formData.append('removeBgApiKey', removeBgApiKey);
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成失败');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;

    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'wedding-photo-result.png';
    link.click();
  };

  const getPreviewUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-4 drop-shadow-lg">
          👰 AI 婚纱照生成器
        </h1>
        <p className="text-white/90 text-center text-xl mb-12">
          上传图片，AI 自动生成婚纱照
        </p>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-8 text-center">
            {error}
          </div>
        )}

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Person Photo */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="text-center mb-4">
              <span className="text-5xl">👤</span>
              <h3 className="text-xl font-bold text-purple-700 mt-2">人物照片</h3>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'person')}
              ref={personRef}
              className="hidden"
              id="person"
            />
            <label
              htmlFor="person"
              className={`block w-full py-3 px-6 rounded-full text-center font-bold cursor-pointer transition-all ${
                personImage
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {personImage ? '✓ 已选择' : '选择照片'}
            </label>
            {personImage && (
              <div className="mt-4 rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={getPreviewUrl(personImage)}
                  alt="Person"
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>

          {/* Dress Image */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="text-center mb-4">
              <span className="text-5xl">👗</span>
              <h3 className="text-xl font-bold text-purple-700 mt-2">婚纱图片</h3>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'dress')}
              ref={dressRef}
              className="hidden"
              id="dress"
            />
            <label
              htmlFor="dress"
              className={`block w-full py-3 px-6 rounded-full text-center font-bold cursor-pointer transition-all ${
                dressImage
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {dressImage ? '✓ 已选择' : '选择婚纱'}
            </label>
            {dressImage && (
              <div className="mt-4 rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={getPreviewUrl(dressImage)}
                  alt="Dress"
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>

          {/* Background Scene */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="text-center mb-4">
              <span className="text-5xl">🏞️</span>
              <h3 className="text-xl font-bold text-purple-700 mt-2">背景场景</h3>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'background')}
              ref={backgroundRef}
              className="hidden"
              id="background"
            />
            <label
              htmlFor="background"
              className={`block w-full py-3 px-6 rounded-full text-center font-bold cursor-pointer transition-all ${
                backgroundImage
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {backgroundImage ? '✓ 已选择' : '选择背景'}
            </label>
            {backgroundImage && (
              <div className="mt-4 rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={getPreviewUrl(backgroundImage)}
                  alt="Background"
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-12 space-y-4">
          <button
            onClick={() => setShowApiSettings(!showApiSettings)}
            className="py-2 px-6 rounded-full text-sm font-bold bg-white/20 hover:bg-white/30 text-white transition-all"
          >
            ⚙️ AI设置
          </button>

          {showApiSettings && (
            <div className="bg-white rounded-xl p-4 shadow-lg max-w-md mx-auto">
              <label className="block text-purple-700 font-bold mb-2">
                Remove.bg API密钥（可选，增强背景去除效果）
              </label>
              <input
                type="password"
                value={removeBgApiKey}
                onChange={(e) => setRemoveBgApiKey(e.target.value)}
                placeholder="输入你的Remove.bg API密钥"
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                免费获取：https://www.remove.bg/zh/signup（每月50张免费）
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!personImage || !dressImage || !backgroundImage || loading}
            className="py-4 px-12 rounded-full text-xl font-bold bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                处理中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                ✨ 生成婚纱照
              </span>
            )}
          </button>
        </div>

        {/* Result Section */}
        {resultImage && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-purple-700 text-center mb-6">
              🎉 生成结果
            </h2>
            <div className="flex justify-center mb-6">
              <div className="rounded-lg overflow-hidden shadow-lg border-4 border-purple-200">
                <img
                  src={resultImage}
                  alt="Generated Wedding Photo"
                  className="max-w-full h-auto"
                />
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={handleDownload}
                className="py-3 px-8 rounded-full text-lg font-bold bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg transition-all"
              >
                📥 下载图片
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-white/95 rounded-2xl p-6 mt-8 shadow-2xl">
          <h3 className="text-xl font-bold text-purple-700 mb-3">🤖 AI技术说明</h3>
          <p className="text-gray-700 mb-3">
            本应用集成了真实的AI图像处理技术：
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li><strong>智能背景去除</strong>：集成Hugging Face AI模型</li>
            <li><strong>高级背景去除</strong>：支持Remove.bg API（可选，每月50张免费）</li>
            <li><strong>虚拟试衣效果</strong>：智能图像合成与融合</li>
            <li><strong>专业色调调整</strong>：暖色调婚纱照风格滤镜</li>
            <li><strong>氛围效果增强</strong>：暗角效果提升视觉焦点</li>
          </ul>
          <div className="bg-purple-50 rounded-lg p-3 mt-4">
            <p className="text-sm text-purple-800 font-bold mb-1">💡 获取免费API密钥：</p>
            <p className="text-sm text-purple-700">
              访问 <a href="https://www.remove.bg/zh/signup" target="_blank" rel="noopener noreferrer" className="underline font-bold">https://www.remove.bg/zh/signup</a> 注册账号，每月可免费处理50张图片，背景去除效果更佳！
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
