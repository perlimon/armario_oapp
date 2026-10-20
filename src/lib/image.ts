/** Reduce la foto para que ocupe poco en la nube. */
export async function reducirImagen(file: Blob, max = 900): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo reducir la imagen"))), "image/jpeg", 0.8),
  );
}

/**
 * Quita el fondo en el propio dispositivo, gratis. La primera vez descarga el
 * modelo ligero (unos 50–60 MB) a la caché del navegador.
 */
export async function quitarFondo(file: Blob, onProgreso?: (p: number) => void): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(file, {
    model: "isnet_quint8",
    output: { format: "image/webp", quality: 0.8 },
    progress: (_key, actual, total) => onProgreso?.(total ? actual / total : 0),
  });
}
