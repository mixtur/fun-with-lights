import { Line } from './lines.ts';
import lineShader from './shaders/line.vert?raw';
import crossHairShader from './shaders/cross-hair.vert?raw';
import solidColorShader from './shaders/solidColor.frag?raw';
import { GlProgram } from './gl-program.ts';

interface GlLine extends Line {
    vao?: WebGLVertexArrayObject;
}

export class WebGLVR {
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    lineProgram: GlProgram;
    crossHairProgram: GlProgram;

    constructor() {
        this.canvas = document.createElement('canvas');
        const gl = this.canvas.getContext('webgl2');
        if (gl === null) {
            throw new Error('Webgl 2 is not supported');
        }
        this.gl = gl;

        this.lineProgram = new GlProgram(gl, lineShader, solidColorShader);
        this.crossHairProgram = new GlProgram(gl, crossHairShader, solidColorShader);
    }

    ensureLineVAO(line: Line): WebGLVertexArrayObject {
        const glLine = line as GlLine;
        if (glLine.vao === undefined) {
            const { direction, position } = line;
            const data = new Float32Array([
                ...direction, 0,
                ...position, 1,
                ...direction.map(x => -x), 0
            ]);

            const {gl} = this;
            const vao = gl.createVertexArray();
            if (vao === null) {
                throw new Error(`Failed to create line VAO`);
            }
            gl.bindVertexArray(vao);

            const vbo = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

            gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 4 * 4, 0);
            gl.enableVertexAttribArray(0);

            gl.bindVertexArray(null);

            glLine.vao = vao;
        }
        return glLine.vao;
    }

    drawFrame(xrLayer: XRWebGLLayer, xrViewerPose: XRViewerPose, lines: Line[]): void {
        const { gl } = this;
        const view = xrViewerPose.views[0];
        const viewport = xrLayer.getViewport(view)!;
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, xrLayer.framebuffer);
        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.crossHairProgram.use();
        gl.uniform3f(this.crossHairProgram.getUniformLocation('u_color'), 0, 1, 0);
        gl.drawArrays(gl.LINES, 0, 4);


        this.lineProgram.use();
        for (const line of lines) {
            const vao = this.ensureLineVAO(line);

            gl.uniformMatrix4fv(this.lineProgram.getUniformLocation('u_projectionMatrix'), false, view.projectionMatrix);
            gl.uniformMatrix4fv(this.lineProgram.getUniformLocation('u_viewMatrix'), false, view.transform.inverse.matrix);
            gl.uniform3f(this.lineProgram.getUniformLocation('u_color'), 1, 0, 0);

            gl.bindVertexArray(vao);

            gl.drawArrays(gl.LINE_STRIP, 0, 3);
        }
    }
}
