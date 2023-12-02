export class PhotoCapturer {
    private _userMedia: MediaStream | null = null;
    private _imageCapture: ImageCapture | null = null;
    width = 800;
    height = 600;
    async init() {
        this._userMedia = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        this._imageCapture = new ImageCapture(this._userMedia.getVideoTracks()[0]);

        this._imageCapture.getPhotoCapabilities().then((capabilities) => {
            this.width = capabilities.imageWidth.max;
            this.height = capabilities.imageHeight.max;
        });
    }

    async capture(): Promise<ImageBitmap> {
        this._imageCapture?.track.stop();

        await this.init();

        const ic = this._imageCapture;
        if (ic === null) {
            throw new Error(`No ImageCapture object`);
        }

        const blob = await ic.takePhoto({
            imageWidth: this.width,
            imageHeight: this.height
        });

        return createImageBitmap(blob);
    }

    async captureImageData(): Promise<ImageData> {
        const bmp = await this.capture();

        const { width, height } = this;
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx === null) {
            throw new Error(`Failed to obtain 2d context from offscreen canvas`);
        }

        ctx.drawImage(bmp, 0, 0);

        return ctx.getImageData(0, 0, width, height);
    }

    async captureStack(size: number): Promise<ImageData> {
        const { width, height } = this;

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx === null) {
            throw new Error(`Failed to obtain 2d context from offscreen canvas`);
        }

        const images = [];
        for (let i = 0; i < size; i++) {
            const img = await this.capture();
            ctx.drawImage(img, 0, 0);
            images.push(ctx.getImageData(0, 0, width, height));
        }

        const result = new ImageData(width, height);
        const l = Math.floor((size - 1) / 2);
        const r = Math.ceil((size - 1) / 2);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;

                const rs = images.map(img => img.data[i + 0]).sort();
                const gs = images.map(img => img.data[i + 1]).sort();
                const bs = images.map(img => img.data[i + 2]).sort();

                result.data[i + 0] = (rs[l] + rs[r]) / 2;
                result.data[i + 1] = (gs[l] + gs[r]) / 2;
                result.data[i + 2] = (bs[l] + bs[r]) / 2;
                result.data[i + 3] = 255;
            }
        }

        ctx.putImageData(result, 0, 0);
        return result;
    }
}

