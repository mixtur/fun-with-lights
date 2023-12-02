import { VRCalibration } from './vr-calibration.ts';

const vrCalibration = new VRCalibration();
const vrOverlay = document.getElementById('vr-overlay') as HTMLDivElement;

(document.getElementById('start-vr') as HTMLButtonElement).addEventListener('click', () => {
    vrCalibration.init(vrOverlay)
        .catch(alert);
});
