const fs = require("fs");
const sharp = require("sharp");

// Giriş ve çıkış dizinleri
const inputDirectory = "./input_images";
const outputDirectory = "./output_images";

// Boyutlandırma yapılandırması
const resizeWidth = 1920; // Dilediğiniz genişliği burada ayarlayın
const resizeHeight = null; // Dilediğiniz yüksekliği burada ayarlayın

// Kalite ayarları
const jpegQuality = 70; // JPEG kalitesi (0-100 arasında)
const pngQuality = 8; // PNG kalitesi (0-9 arasında)

// Çıkış dizini henüz varsa oluştur
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

// Giriş dizinindeki dosyaları oku
fs.readdir(inputDirectory, (err, files) => {
  if (err) {
    console.error("Giriş dizinini okurken hata oluştu:", err);
    return;
  }

  // Her dosyayı işle
  files.forEach((file) => {
    const inputPath = `${inputDirectory}/${file}`;
    const outputPath = `${outputDirectory}/${file}`;
    const format = file.split(".").pop().toLowerCase();

    // Orijinal görüntü oranını koruyarak boyutlandır ve kalite ayarlarını belirle
    sharp(inputPath)
      .rotate()
      .resize(resizeWidth, resizeHeight, {
        fit: sharp.fit.inside,
      })
      .toFormat(format === "png" ? "png" : "jpeg", {
        quality: format === "png" ? pngQuality : jpegQuality,
      })
      .toFile(outputPath, (err) => {
        if (err) {
          console.error(`${file} işlenirken hata oluştu:`, err);
        } else {
          console.log(
            `${file} boyutlandırıldı ve ${resizeWidth}x${resizeHeight} olarak kaydedildi.`
          );
        }
      });
  });
});
