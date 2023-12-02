export class GlProgram {
    gl: WebGL2RenderingContext;
    prog: WebGLProgram;
    constructor(gl: WebGL2RenderingContext, vertexShaderCode: string, fragmentShaderCode: string) {
        this.gl = gl;

        const vs = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vs, vertexShaderCode);
        gl.compileShader(vs);

        const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fs, fragmentShaderCode);
        gl.compileShader(fs);

        const prog = gl.createProgram()!;
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);

        const linkOk = gl.getProgramParameter(prog, gl.LINK_STATUS) as boolean;
        if (!linkOk) {
            console.warn('PROGRAM LINKING HAS FAILED');
            console.warn('PROGRAM LINK MESSAGE:\n' + gl.getProgramInfoLog(prog));

            const fsCompileOk = gl.getShaderParameter(fs, gl.COMPILE_STATUS) as boolean;
            if (!fsCompileOk) {
                console.warn('FRAGMENT SHADER COMPILATION MESSAGE:\n' + gl.getShaderInfoLog(fs));
            }
            const vsCompileOk = gl.getShaderParameter(vs, gl.COMPILE_STATUS) as boolean;
            if (!vsCompileOk) {
                console.warn('VERTEX SHADER COMPILATION MESSAGE:\n' + gl.getShaderInfoLog(vs));
            }

            throw new Error(`Failed to create program`);
        }

        gl.deleteShader(fs);
        gl.deleteShader(vs);

        this.prog = prog;
    }

    uniformLocations: Record<string, WebGLUniformLocation> = {};
    getUniformLocation(name: string): WebGLUniformLocation {
        if (!(name in this.uniformLocations)) {
            const location = this.gl.getUniformLocation(this.prog, name);
            if (location === null) {
                throw new Error(`no such uniform ${name}`);
            }
            this.uniformLocations[name] = location;
        }

        return this.uniformLocations[name];
    }

    use(): void {
        this.gl.useProgram(this.prog);
    }
}
