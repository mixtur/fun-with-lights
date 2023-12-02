import { PhotoCapturer } from './capture-photos.ts';
import { COUNT_LIGHTS } from './config.ts';
import { sendLightsData } from './lights-api.ts';

const capturer = new PhotoCapturer();

const uiEl = document.getElementById('ui') as HTMLDivElement;
const initBtn = document.getElementById('init-btn') as HTMLButtonElement;
const capture1Btn = document.getElementById('capture1-btn') as HTMLButtonElement;
const capture2Btn = document.getElementById('capture2-btn') as HTMLButtonElement;
const compareBtn = document.getElementById('compare-btn') as HTMLButtonElement;

const autoCaptureBtn = document.getElementById('auto-capture-btn') as HTMLButtonElement;

const resultCanvas = document.getElementById('current-result') as HTMLCanvasElement;

const resultCtx = resultCanvas.getContext('2d');
if (resultCtx === null) {
    throw new Error('Failed to get 2d context from a preview canvas');
}

initBtn.addEventListener('click', () => {
    capturer.init()
        .then(
            () => { uiEl.classList.remove('hidden'); },
            console.log
        );
});

const outputResult = (result: ImageData): void => {
    resultCanvas.width = result.width;
    resultCanvas.height = result.height;
    resultCtx.putImageData(result, 0, 0)
};

let capture1Result: ImageData | null = null;
let capture2Result: ImageData | null = null;

capture1Btn.addEventListener('click', () => {
    capturer.captureStack(3)
        .then(
            (result) => {
                capture1Btn.innerHTML = `Capture 1 (ok)`;
                capture1Result = result;
                outputResult(result);
            },
            alert
        )
});

capture2Btn.addEventListener('click', () => {
    capturer.captureStack(3)
        .then(
            (result) => {
                capture2Btn.innerHTML = `Capture 2 (ok)`;
                capture2Result = result;
                outputResult(result);
            },
            alert
        )
});

const compare = (imgA: ImageData, imgB: ImageData): void => {
    const result = new ImageData(imgA.width, imgA.height);
    let maxDiff = 0;

    const toLin = (a: number): number => (a / 255) ** 2.2;

    const hystogram = new Uint32Array(256);

    for (let i = 0; i < result.width * result.height; i++) {
        const r1 = toLin(imgA.data[i * 4 + 0]);
        const g1 = toLin(imgA.data[i * 4 + 1]);
        const b1 = toLin(imgA.data[i * 4 + 2]);

        const r2 = toLin(imgB.data[i * 4 + 0]);
        const g2 = toLin(imgB.data[i * 4 + 1]);
        const b2 = toLin(imgB.data[i * 4 + 2]);



        let diff = ((
            Math.abs(r1 - r2) +
            Math.abs(g1 - g2) +
            Math.abs(b1 - b2)
        ) / 3) ** (1 / 2.2) * 255;

        diff = Math.floor(diff);

        hystogram[diff]++;

        maxDiff = Math.max(maxDiff, diff);

        result.data[i * 4 + 0] = diff;
        result.data[i * 4 + 1] = diff;
        result.data[i * 4 + 2] = diff;
        result.data[i * 4 + 3] = 255;
    }

    for (let i = 1; i < hystogram.length; i++) {
        hystogram[i] += hystogram[i - 1];
    }

    const total = hystogram[hystogram.length - 1];
    console.log(total);
    for (let i = 0; i < result.width * result.height; i++) {
        const h = hystogram[result.data[i * 4 + 0]];
        if (h / total > 0.9995) {
            result.data[i * 4 + 0] = 255;
            result.data[i * 4 + 1] = 0;
            result.data[i * 4 + 2] = 0;
            result.data[i * 4 + 3] = 255;
        }
    }

    outputResult(result);
    console.log(hystogram);
};

compareBtn.addEventListener('click', () => {
    if (capture1Result === null) {
        throw new Error(`no capture 1`);
    }

    if (capture2Result === null) {
        throw new Error(`no capture 2`);
    }

    compare(capture1Result, capture2Result);
});


const lightOnBtn = document.getElementById('light-on') as HTMLButtonElement;
const lightOffBtn = document.getElementById('light-off') as HTMLButtonElement;

const lightsData = new Uint32Array(COUNT_LIGHTS);
lightOnBtn.addEventListener('click', () => {
    lightsData[10] = 0xffffff;
    sendLightsData(lightsData).catch(console.log);
})

lightOffBtn.addEventListener('click', () => {
    lightsData[10] = 0x000000;
    sendLightsData(lightsData).catch(console.log);
});


autoCaptureBtn.addEventListener('click', async () => {
    const lightsData = new Uint32Array(COUNT_LIGHTS);
    await sendLightsData(lightsData);
    const base = await capturer.captureImageData();
    for (let i = 0; i < COUNT_LIGHTS; i++) {
        lightsData[i] = 0xffffff;
        await sendLightsData(lightsData);
        const lightsOn = await capturer.captureImageData();

        lightsData[i] = 0;

        compare(base, lightsOn);
    }
});
