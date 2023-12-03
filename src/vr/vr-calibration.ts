import { WebGLVR } from './vr-gl.ts';
import {Line, Point} from './types.ts';
import { XRReactOverlayController } from './overlay/main.tsx';
import {find_nearest_point, Vec3} from "./closest-point.ts";

const getXr = (): XRSystem => {
    if (navigator.xr) {
        return navigator.xr;
    }
    throw new Error(`WebXR is not supported`);
}

type XRRafRequestResult = {
    time: number;
    xrFrame: XRFrame;
} | null;

interface PointGroup {
    aligned: boolean;
    alignmentMatrix: Float32Array;
    points: Point[];
}

export class VRCalibration {
    glViewer!: WebGLVR;
    xr!: XRSystem;
    session!: XRSession;
    localSpace!: XRReferenceSpace;
    mainLoopPromise!: Promise<void>;
    glLayer!: XRWebGLLayer;
    viewLine!: Line;
    overlay!: XRReactOverlayController;

    pointGroups: PointGroup[] = [];
    currentGroup: PointGroup = {
        aligned: true,
        alignmentMatrix: new Float32Array([
            1, 0, 0, 0,
            0, 1, 0 ,0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]),
        points: []
    };
    currentPoint: Point | null = null;
    lines: Line[] = [];

    isRunning = false;
    rafStop = () => undefined;

    async init(domOverlay: HTMLDivElement): Promise<void> {
        try {
            this.overlay = new XRReactOverlayController();
            this.xr = getXr();
            this.glViewer = new WebGLVR();
            this.session = await this.xr.requestSession('immersive-ar', {
                requiredFeatures: ['dom-overlay', 'unbounded'],
                domOverlay: {
                    root: domOverlay
                }
            });
            this.overlay.start(domOverlay, {
                onShootLine: () => {
                    this.lines.push(this.viewLine);
                    const position = find_nearest_point(
                        this.lines.map(l => [...l.position] as Vec3),
                        this.lines.map(l => [...l.direction] as Vec3),
                        this.lines.length
                    );

                    if (position.every(Number.isFinite)) {
                        this.currentPoint = {
                            id: 0,
                            position: new Float32Array(position)
                        }
                    } else {
                        this.currentPoint = null;
                    }
                },
                onConfirm: () => {
                    if (this.currentPoint === null) return;
                    this.currentGroup.points.push(this.currentPoint);
                    this.currentPoint = null;
                    this.lines = [];
                },
                onRestart: () => {
                    this.lines = [];
                    this.currentPoint = null;
                }
            });
            this.isRunning = true;
            this.session.addEventListener('end', () => {
                this.rafStop();
                this.overlay.stop();
                this.isRunning = false;
            });

            this.localSpace = await this.session.requestReferenceSpace('unbounded');
            this.mainLoopPromise = this.startMainLoop();
            await this.glViewer.gl.makeXRCompatible();
            this.glLayer = new XRWebGLLayer(this.session, this.glViewer.gl);
            await this.session.updateRenderState({
                baseLayer: this.glLayer
            });
        } catch (e) {
            alert('failed to initialize immersive ar');
            throw e;
        }
    }

    async startMainLoop(): Promise<void> {
        while (this.isRunning) {
            const rafRequestResult = await new Promise<XRRafRequestResult>((resolve) => {
                const currentRafRequest = this.session.requestAnimationFrame((time, xrFrame) => {
                    resolve({time, xrFrame});
                });
                this.rafStop = () => {
                    this.session.cancelAnimationFrame(currentRafRequest);
                    resolve(null);
                };
            });

            if (rafRequestResult === null) {
                return;
            }

            const {xrFrame} = rafRequestResult;

            const viewerPose = xrFrame.getViewerPose(this.localSpace);
            if (viewerPose == undefined) {
                this.overlay.update({
                    hasViewerPose: false,
                    isPositionEmulated: false,
                    linesList: []
                })
                continue;
            }

            this.overlay.update({
                hasViewerPose: true,
                isPositionEmulated: viewerPose.emulatedPosition,
                linesList: [...this.lines]
            })

            const view = viewerPose.views[0];
            const {x, y, z} = view.transform.position;
            const position = new Float32Array([x, y, z]);
            const zAxis = view.transform.matrix.slice(8, 11);

            this.viewLine = { position, direction: zAxis };
            this.glViewer.drawFrame(
                this.glLayer,
                viewerPose,
                this.lines,
                [
                    ...this.currentGroup.points,
                    ...this.pointGroups.flatMap(g => g.points)
                ],
                this.currentPoint
            );
        }
    }
}

