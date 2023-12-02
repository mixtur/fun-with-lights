import { createRoot, Root } from 'react-dom/client';
import { VROverlay, VROverlayConfig, VROverlayProps } from './vr-overlay.tsx';

export class XRReactOverlayController {
    root!: Root;
    config: VROverlayConfig = {};
    start(rootElement: HTMLElement, config: VROverlayConfig): void {
        this.root = createRoot(rootElement);
        this.config = config;
        this.root.render(<VROverlay {...config} />);
    }

    update(props: VROverlayProps) {
        this.root.render(<VROverlay {...props} {...this.config} />);
    }

    stop(): void {
        this.root.unmount();
    }
}
