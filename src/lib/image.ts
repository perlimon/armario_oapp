/** Reduce la foto para que pese poco y se procese rápido. */
export async function reducirImagen(file: Blob, max = 1024): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo reducir la imagen"))), "image/jpeg", 0.85),
  );
}

/** Quita el fondo en el propio dispositivo (el modelo se descarga la primera vez). */
export async function quitarFondo(file: Blob, onProgreso?: (p: number) => void): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(file, {
    output: { format: "image/png" },
    progress: (_key, actual, total) => onProgreso?.(total ? actual / total : 0),
  });
}

export function blobABase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
