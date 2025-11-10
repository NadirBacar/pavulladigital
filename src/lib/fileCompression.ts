// lib/fileCompression.ts

/**
 * Compress an image file to be under the target size
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 10,
  maxWidthOrHeight: number = 1920
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = (height * maxWidthOrHeight) / width;
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = (width * maxWidthOrHeight) / height;
            height = maxWidthOrHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Start with quality 0.9 and reduce if needed
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              const sizeMB = blob.size / 1024 / 1024;
              
              // If still too large and quality can be reduced, try again
              if (sizeMB > maxSizeMB && quality > 0.1) {
                quality -= 0.1;
                tryCompress();
              } else {
                // Create new file from blob
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        tryCompress();
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress a video file by reducing resolution and bitrate
 * Note: This requires ffmpeg.wasm which needs to be installed
 */
export async function compressVideo(
  file: File,
  maxSizeMB: number = 10
): Promise<File> {
  // For video compression, we'll use a simpler approach
  // In production, you might want to use ffmpeg.wasm or a server-side solution
  
  // Check if already under size
  const sizeMB = file.size / 1024 / 1024;
  if (sizeMB <= maxSizeMB) {
    return file;
  }
  
  // For now, return original file with a warning
  // In production, implement proper video compression
  throw new Error(
    `Vídeo muito grande (${sizeMB.toFixed(2)}MB). Por favor, comprima o vídeo antes de enviar ou escolha um vídeo menor.`
  );
}

/**
 * Main compression function that handles different file types
 */
export async function compressFile(
  file: File,
  maxSizeMB: number = 100
): Promise<File> {
  const sizeMB = file.size / 1024 / 1024;
  
  // If already under limit, return as-is
  if (sizeMB <= maxSizeMB) {
    return file;
  }
  
  // Compress based on file type
  if (file.type.startsWith('image/')) {
    return await compressImage(file, maxSizeMB);
  } else if (file.type.startsWith('video/')) {
    return await compressVideo(file, maxSizeMB);
  } else if (file.type.startsWith('audio/')) {
    // Audio files typically don't compress well client-side
    throw new Error(
      `Arquivo de áudio muito grande (${sizeMB.toFixed(2)}MB). Por favor, escolha um arquivo menor.`
    );
  } else {
    // Documents and other files
    throw new Error(
      `Arquivo muito grande (${sizeMB.toFixed(2)}MB). Por favor, escolha um arquivo menor que 10MB.`
    );
  }
  
  return file;
}