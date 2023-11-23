const fs = require("fs");
const sharp = require("sharp");

const inputDirectory = "./input_images";
const outputDirectory = "./output_images";
const targetFileSizeKB = 300;
const maxResolution = 1920;

let sharpResizeResolution = 1920;
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

const processImage = async (file) => {
  const inputPath = `${inputDirectory}/${file}`;
  const outputPath = `${outputDirectory}/${file}`;
  const format = file.split(".").pop().toLowerCase();

  const imageInfo = await sharp(inputPath).metadata();
  const currentResolution = Math.max(imageInfo.width, imageInfo.height);

  if (currentResolution < maxResolution && fs.statSync(inputPath).size / 1024 < targetFileSizeKB) {

    // burada node.js ile direk kopyalama yap
    fs.copyFile(inputPath, outputPath, (err) => {
      if (err) {
        console.error(`${file} kopyalanırken hata oluştu:`, err);
      } else {
        console.log(`${file} sadece orijinal boyut ve çözünürlüğü ile kopyalandı.`);
      }
    });

    // await sharp(inputPath)
    //   .rotate()
    //   // .resize(null, null, {
    //   //   fit: sharp.fit.inside,
    //   // })
    //   .toFormat(format === "png" ? "png" : "jpeg", {
    //     quality: 70, // or your default quality
    //   })
    //   .toFile(outputPath);

      // console.log(`${file} w->${imageInfo.width} h->${imageInfo.height}, s->${fs.statSync(inputPath).size}`);
    console.log(`${file} sadece orijinal boyut ve çözünürlüğü ile kopyalandı.`);
  } else {
    if (currentResolution < maxResolution) {
      sharpResizeResolution = currentResolution;
    }

    const maxQuality = 90;
    const minQuality = 1;
    const qualityStep = 5;
    let currentQuality = maxQuality;
    let currentSizeKB = Infinity;

    while (currentSizeKB > targetFileSizeKB && currentQuality >= minQuality) {
      const imageBuffer = await sharp(inputPath)
        .rotate()
        .resize(sharpResizeResolution, null, {
          fit: sharp.fit.inside,
        })
        .toFormat(format === "png" ? "png" : "jpeg", {
          quality: currentQuality,
        })
        .toBuffer();

      currentSizeKB = imageBuffer.length / 1024;

      if (currentSizeKB > targetFileSizeKB) {
        currentQuality -= qualityStep;
      }
    }

    await sharp(inputPath)
      .rotate()
      .resize(sharpResizeResolution, null, {
        fit: sharp.fit.inside,
      })
      .toFormat(format === "png" ? "png" : "jpeg", {
        quality: currentQuality,
      })
      .toFile(outputPath);

    console.log(`${file} boyutlandırıldı ve ${currentSizeKB} KB olarak kaydedildi.`);
  }
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
