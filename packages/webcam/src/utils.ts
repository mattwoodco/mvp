export function generateVideoId(): string {
  return `video_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export async function generateThumbnail(videoBlob: Blob): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.addEventListener('loadedmetadata', () => {
      video.currentTime = Math.min(1, video.duration / 2);
    });

    video.addEventListener('seeked', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(video.src);
          resolve(blob);
        }, 'image/jpeg', 0.8);
      } else {
        resolve(null);
      }
    });

    video.src = URL.createObjectURL(videoBlob);
    video.load();
  });
}

export function getVideoDimensions(videoBlob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    
    video.addEventListener('loadedmetadata', () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight
      });
      URL.revokeObjectURL(video.src);
    });

    video.addEventListener('error', () => {
      reject(new Error('Failed to load video'));
      URL.revokeObjectURL(video.src);
    });

    video.src = URL.createObjectURL(videoBlob);
    video.load();
  });
}

export function getVideoDuration(videoBlob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    
    video.addEventListener('loadedmetadata', () => {
      resolve(video.duration);
      URL.revokeObjectURL(video.src);
    });

    video.addEventListener('error', () => {
      reject(new Error('Failed to load video'));
      URL.revokeObjectURL(video.src);
    });

    video.src = URL.createObjectURL(videoBlob);
    video.load();
  });
}