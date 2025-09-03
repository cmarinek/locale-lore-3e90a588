
// Image processing pipeline with multiple formats
export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
  progressive?: boolean;
}

export interface ProcessedImage {
  url: string;
  format: string;
  width: number;
  height: number;
  size: number;
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Process image with multiple format outputs
  async processImage(
    file: File,
    options: ImageProcessingOptions[] = []
  ): Promise<ProcessedImage[]> {
    const img = await this.loadImage(file);
    const results: ProcessedImage[] = [];

    // Default processing options if none provided
    if (options.length === 0) {
      options = [
        { format: 'webp', quality: 85 },
        { format: 'jpeg', quality: 90 },
        { format: 'avif', quality: 80 }
      ];
    }

    for (const option of options) {
      try {
        const processed = await this.processWithOptions(img, option);
        results.push(processed);
      } catch (error) {
        console.error('Error processing image with options:', option, error);
      }
    }

    return results;
  }

  // Generate responsive image set
  async generateResponsiveSet(
    file: File,
    breakpoints: number[] = [320, 640, 960, 1280, 1920]
  ): Promise<{ [key: string]: ProcessedImage[] }> {
    const img = await this.loadImage(file);
    const formats: Array<'webp' | 'avif' | 'jpeg'> = ['webp', 'avif', 'jpeg'];
    const results: { [key: string]: ProcessedImage[] } = {};

    for (const width of breakpoints) {
      const key = `${width}w`;
      results[key] = [];

      for (const format of formats) {
        try {
          const processed = await this.processWithOptions(img, {
            width,
            format,
            quality: format === 'avif' ? 75 : format === 'webp' ? 80 : 85,
            fit: 'cover'
          });
          results[key].push(processed);
        } catch (error) {
          console.error(`Error generating ${format} at ${width}px:`, error);
        }
      }
    }

    return results;
  }

  // Optimize image for web
  async optimizeForWeb(file: File): Promise<ProcessedImage> {
    const img = await this.loadImage(file);
    
    // Determine optimal dimensions
    const maxWidth = 1920;
    const maxHeight = 1080;
    
    let { width, height } = this.calculateDimensions(
      img.width,
      img.height,
      maxWidth,
      maxHeight
    );

    return this.processWithOptions(img, {
      width,
      height,
      format: 'webp',
      quality: 85,
      fit: 'inside',
      progressive: true,
      sharpen: true
    });
  }

  // Create thumbnail
  async createThumbnail(file: File, size: number = 150): Promise<ProcessedImage> {
    const img = await this.loadImage(file);
    
    return this.processWithOptions(img, {
      width: size,
      height: size,
      format: 'webp',
      quality: 75,
      fit: 'cover',
      position: 'center'
    });
  }

  private async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private async processWithOptions(
    img: HTMLImageElement,
    options: ImageProcessingOptions
  ): Promise<ProcessedImage> {
    const {
      width = img.width,
      height = img.height,
      quality = 85,
      format = 'webp',
      fit = 'cover',
      position = 'center',
      blur,
      sharpen,
      grayscale,
      progressive = false
    } = options;

    // Calculate dimensions
    const dimensions = this.calculateDimensions(
      img.width,
      img.height,
      width,
      height,
      fit
    );

    // Set canvas size
    this.canvas.width = dimensions.width;
    this.canvas.height = dimensions.height;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply transformations
    this.ctx.save();

    // Grayscale filter
    if (grayscale) {
      this.ctx.filter = 'grayscale(100%)';
    }

    // Blur filter
    if (blur) {
      this.ctx.filter = `blur(${blur}px)`;
    }

    // Draw image
    const drawParams = this.calculateDrawParams(
      img.width,
      img.height,
      dimensions.width,
      dimensions.height,
      fit,
      position
    );

    this.ctx.drawImage(
      img,
      drawParams.sx,
      drawParams.sy,
      drawParams.sw,
      drawParams.sh,
      drawParams.dx,
      drawParams.dy,
      drawParams.dw,
      drawParams.dh
    );

    // Apply sharpening (simple implementation)
    if (sharpen) {
      this.applySharpen();
    }

    this.ctx.restore();

    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      this.canvas.toBlob(
        (blob) => resolve(blob!),
        `image/${format}`,
        quality / 100
      );
    });

    const url = URL.createObjectURL(blob);

    return {
      url,
      format,
      width: dimensions.width,
      height: dimensions.height,
      size: blob.size
    };
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    targetWidth: number,
    targetHeight: number,
    fit: string = 'cover'
  ) {
    const aspectRatio = originalWidth / originalHeight;
    const targetAspectRatio = targetWidth / targetHeight;

    switch (fit) {
      case 'contain':
        if (aspectRatio > targetAspectRatio) {
          return {
            width: targetWidth,
            height: Math.round(targetWidth / aspectRatio)
          };
        } else {
          return {
            width: Math.round(targetHeight * aspectRatio),
            height: targetHeight
          };
        }

      case 'cover':
      default:
        return { width: targetWidth, height: targetHeight };

      case 'fill':
        return { width: targetWidth, height: targetHeight };

      case 'inside':
        const scale = Math.min(targetWidth / originalWidth, targetHeight / originalHeight);
        return {
          width: Math.round(originalWidth * scale),
          height: Math.round(originalHeight * scale)
        };

      case 'outside':
        const scaleOut = Math.max(targetWidth / originalWidth, targetHeight / originalHeight);
        return {
          width: Math.round(originalWidth * scaleOut),
          height: Math.round(originalHeight * scaleOut)
        };
    }
  }

  private calculateDrawParams(
    imgWidth: number,
    imgHeight: number,
    canvasWidth: number,
    canvasHeight: number,
    fit: string,
    position: string
  ) {
    if (fit === 'fill') {
      return {
        sx: 0, sy: 0, sw: imgWidth, sh: imgHeight,
        dx: 0, dy: 0, dw: canvasWidth, dh: canvasHeight
      };
    }

    const imgAspect = imgWidth / imgHeight;
    const canvasAspect = canvasWidth / canvasHeight;

    let sw, sh, sx, sy;

    if (fit === 'cover') {
      if (imgAspect > canvasAspect) {
        sh = imgHeight;
        sw = imgHeight * canvasAspect;
        sy = 0;
        sx = (imgWidth - sw) / 2;
      } else {
        sw = imgWidth;
        sh = imgWidth / canvasAspect;
        sx = 0;
        sy = (imgHeight - sh) / 2;
      }
    } else {
      sw = imgWidth;
      sh = imgHeight;
      sx = 0;
      sy = 0;
    }

    return {
      sx, sy, sw, sh,
      dx: 0, dy: 0, dw: canvasWidth, dh: canvasHeight
    };
  }

  private applySharpen() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    // Simple sharpening kernel
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];

    const side = Math.round(Math.sqrt(kernel.length));
    const halfSide = Math.floor(side / 2);
    const src = data.slice();

    for (let y = 0; y < this.canvas.height; y++) {
      for (let x = 0; x < this.canvas.width; x++) {
        const sy = y;
        const sx = x;
        const dstOff = (sy * this.canvas.width + sx) * 4;
        let r = 0, g = 0, b = 0;

        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = sy + cy - halfSide;
            const scx = sx + cx - halfSide;

            if (scy >= 0 && scy < this.canvas.height && scx >= 0 && scx < this.canvas.width) {
              const srcOff = (scy * this.canvas.width + scx) * 4;
              const wt = kernel[cy * side + cx];
              r += src[srcOff] * wt;
              g += src[srcOff + 1] * wt;
              b += src[srcOff + 2] * wt;
            }
          }
        }

        data[dstOff] = Math.max(0, Math.min(255, r));
        data[dstOff + 1] = Math.max(0, Math.min(255, g));
        data[dstOff + 2] = Math.max(0, Math.min(255, b));
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }
}

export const imageProcessor = new ImageProcessor();
