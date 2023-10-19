const fs = require("fs");
const sharp = require("sharp");

const inputDirectory = "./input_images";
const outputDirectory = "./output_images";

const targetFileSizeKB = 350; // Hedef dosya boyutu (KB)

if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

const processImage = async (file) => {
  const inputPath = `${inputDirectory}/${file}`;
  const outputPath = `${outputDirectory}/${file}`;
  const format = file.split(".").pop().toLowerCase();

  const maxQuality = 90; // Maksimum kalite
  const minQuality = 1; // Minimum kalite
  const qualityStep = 7; // Kalite adımı
  let currentQuality = maxQuality;
  let currentSizeKB = Infinity;

  while (currentSizeKB > targetFileSizeKB && currentQuality >= minQuality) {
    const imageBuffer = await sharp(inputPath)
      .rotate()
      .resize(1920, null, {
        fit: sharp.fit.inside,
      })
      .toFormat(format === "png" ? "png" : "jpeg", {
        quality: currentQuality,
      })
      .toBuffer();

    currentSizeKB = Buffer.byteLength(imageBuffer) / 1024;

    if (currentSizeKB > targetFileSizeKB) {
      currentQuality -= qualityStep;
    }
  }

  await sharp(inputPath)
    .rotate()
    .resize(1920, null, {
      fit: sharp.fit.inside,
    })
    .toFormat(format === "png" ? "png" : "jpeg", {
      quality: currentQuality,
    })
    .toFile(outputPath);
  
  console.log(`${file} boyutlandırıldı ve ${currentSizeKB} KB olarak kaydedildi.`);
};

fs.readdir(inputDirectory, (err, files) => {
  if (err) {
    console.error("Giriş dizinini okurken hata oluştu:", err);
    return;
  }

  files.forEach((file) => {
    processImage(file).catch((err) => {
      console.error(`${file} işlenirken hata oluştu:`, err);
    });
  });
});
