/**
 * 图片压缩脚本
 * 使用 sharp 将 src/asset/images 中的大图压缩
 * 运行: node scripts/compress-images.mjs
 */

import sharp from 'sharp'
import { readdir, stat, mkdir } from 'fs/promises'
import { join, extname } from 'path'

const INPUT_DIR = 'src/asset/images'
const OUTPUT_DIR = 'src/static/images'
const MAX_WIDTH = 750 // 小程序常用宽度
const QUALITY = 80

async function compressImages() {
  await mkdir(OUTPUT_DIR, { recursive: true })

  const files = await readdir(INPUT_DIR)
  const imageFiles = files.filter(f =>
    ['.png', '.jpg', '.jpeg', '.webp'].includes(extname(f).toLowerCase())
  )

  console.log(`找到 ${imageFiles.length} 张图片，开始压缩...\n`)

  for (const file of imageFiles) {
    const inputPath = join(INPUT_DIR, file)
    const outputPath = join(OUTPUT_DIR, file)
    const beforeStat = await stat(inputPath)

    await sharp(inputPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .png({ quality: QUALITY, compressionLevel: 9 })
      .toFile(outputPath)

    const afterStat = await stat(outputPath)
    const ratio = ((1 - afterStat.size / beforeStat.size) * 100).toFixed(1)
    console.log(
      `${file}: ${(beforeStat.size / 1024).toFixed(0)}KB → ${(afterStat.size / 1024).toFixed(0)}KB (压缩 ${ratio}%)`
    )
  }

  console.log('\n压缩完成！输出目录:', OUTPUT_DIR)
}

compressImages().catch(console.error)
