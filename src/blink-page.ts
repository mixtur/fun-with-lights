import { COUNT_LIGHTS } from './config.ts';
import { sendLightsData } from './lights-api.ts';

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export const hsl2rgb = (h: number, s: number, l: number): RGB => {
    const q = l < .5
        ? l * (1 + s)
        : l + s - (l * s);
    const p = 2*l-q;

    const r = comp(h + 1/3);
    const g = comp(h);
    const b = comp(h - 1/3);

    function comp(t: number): number {
        t = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
        if (t < 1/6) return p + ((q-p)*6*t);
        if (t < .5) return q;
        if (t < 2/3) return p + ((q-p)*(2/3-t)*6);
        return p;
    }

    return { r, g, b };
};

class LED {
    prevValue: [number, number, number];
    nextValue: [number, number, number];
    currentValue: [number, number, number];
    duration: number;
    time: number;
    constructor() {
        this.prevValue = [0, 0, 0];
        this.nextValue = [0, 0, 0];
        this.currentValue = [0, 0, 0];
        this.time = 0;
        this.duration = Math.random();
    }

    update(dt: number, satCenter: number, satSpread: number): void {
        const time = Math.min(this.time + dt, this.duration);
        let t = time / this.duration;

        t = Math.sin((t * 2 - 1) * Math.PI / 2) / 2 + 0.5;
        t = t ** (1 / 2);

        this.currentValue[0] = this.prevValue[0] * (1 - t) + this.nextValue[0] * t;
        this.currentValue[1] = this.prevValue[1] * (1 - t) + this.nextValue[1] * t;
        this.currentValue[2] = this.prevValue[2] * (1 - t) + this.nextValue[2] * t;

        if (time === this.duration) {
            this.time = 0;
            this.prevValue[0] = this.nextValue[0];
            this.prevValue[1] = this.nextValue[1];
            this.prevValue[2] = this.nextValue[2];
            if (Math.random() < 0.85) {
                this.nextValue[0] = 0;
                this.nextValue[1] = 0;
                this.nextValue[2] = 0;
            } else {
                let sat = satCenter + ((Math.random() - 0.5) * 2) * satSpread;
                sat = sat - Math.floor(sat);
                const color = hsl2rgb(sat, 1, 0.4);

                this.nextValue[0] = color.r;
                this.nextValue[1] = color.g;
                this.nextValue[2] = color.b;
            }
            this.duration = 0.5 + Math.random() * 6;
        } else {
            this.time = time;
        }
    }
}

(document.getElementById('disco') as HTMLButtonElement).addEventListener('click', async () => {
    const leds = [];
    for (let i = 0; i < COUNT_LIGHTS; i++) {
        leds.push(new LED());
    }

    const lightsData = new Uint32Array(COUNT_LIGHTS);
    await sendLightsData(lightsData);

    let prevTimeMS = performance.now();
    while (true) {
        const timeMS = performance.now();
        const dtMS = timeMS - prevTimeMS;
        prevTimeMS = timeMS;
        const satCenter = Math.sin(timeMS / 30000);
        for (let i = 0; i < COUNT_LIGHTS; i++) {
            leds[i].update(dtMS / 1000, satCenter, 0.1);
            const r = Math.floor(leds[i].currentValue[0] * 255);
            const g = Math.floor(leds[i].currentValue[1] * 255);
            const b = Math.floor(leds[i].currentValue[2] * 255);
            lightsData[i] = (r << 16) + (g << 8) + b;
        }
        await sendLightsData(lightsData);
    }
});
