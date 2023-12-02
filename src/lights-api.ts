import { LIGHTS_BASE_URL } from './config.ts';

export const sendLightsData = async (data: ArrayBuffer): Promise<void> => {
    const url = new URL('upload', LIGHTS_BASE_URL).toString();
    const request = await fetch(url, {
        method: 'POST',
        body: data
    });

    await request.text();
};
