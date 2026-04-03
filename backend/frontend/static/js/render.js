function drawImageFromArray(arr, canvasId = "canvas") {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !arr || !arr.length || !arr[0].length) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const height = arr.length;
  const width = arr[0].length;

  canvas.width = width;
  canvas.height = height;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const [r, g, b, a] = arr[y][x];

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function toGrayscale(arr) {
  const height = arr.length;
  const width = arr[0].length;
  const newArray = [];

  for (let y = 0; y < height; y++) {
    const row = [];

    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = arr[y][x];
      const gray = Math.floor((0.299 * r) + (0.587 * g) + (0.114 * b));
      row.push([gray, gray, gray, a]);
    }

    newArray.push(row);
  }

  return newArray;
}

function initPixelRender() {
  if (typeof pixelArray === "undefined") {
    return;
  }

  const canvas = document.querySelector("[data-pixel-image]");
  if (!canvas) {
    return;
  }

  const renderMode = canvas.dataset.renderMode || "color";
  const pixels = renderMode === "grayscale" ? toGrayscale(pixelArray) : pixelArray;
  drawImageFromArray(pixels, canvas.id);
}

document.addEventListener("DOMContentLoaded", initPixelRender);
