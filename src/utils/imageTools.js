// Achica la foto de perfil en el navegador antes de guardarla: viaja en cada login y en
// cada carga de la app, así que una foto de celular de varios MB la volvería muy pesada.
export const MAX_AVATAR_SIDE = 640;

// Por encima de este tamaño (en caracteres del data URL, ~675 KB) se considera "pesada".
export const HEAVY_AVATAR_CHARS = 900000;

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const encodeAvatar = (image) => {
  const scale = Math.min(1, MAX_AVATAR_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

  let dataUrl = canvas.toDataURL("image/webp", 0.85);
  // Algunos navegadores no generan WebP: se usa JPEG, que sí achica bien las fotos.
  if (!dataUrl.startsWith("data:image/webp") || dataUrl.length > HEAVY_AVATAR_CHARS) {
    dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  }
  return dataUrl;
};

// A partir de un archivo elegido por la persona.
export const compressAvatarFile = async (file) => {
  const objectUrl = URL.createObjectURL(file);
  try {
    return encodeAvatar(await loadImage(objectUrl));
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

// A partir de una foto ya guardada (data URL).
export const compressAvatarUrl = async (dataUrl) => encodeAvatar(await loadImage(dataUrl));
