export type Vec3 = [number, number, number];
type Mat3 = [Vec3, Vec3, Vec3];

const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const find_nearest_point = (a: Vec3[], d: Vec3[], n: number): Vec3 => {
    const m: Mat3 = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];

    const b: Vec3 = [0, 0, 0];

    for (let i = 0; i < n; i++) {
        const d2 = dot(d[i], d[i]);
        const da = dot(d[i], a[i]);
        for (let ii = 0; ii < 3; ii++) {
            for (let jj = 0; jj < 3; jj++) {
                m[ii][jj] += d[i][ii] * d[i][jj];
            }
            m[ii][ii] -= d2;
            b[ii] += d[i][ii] * da - a[i][ii] * d2;
        }

    }
    return solve(m, b);
};

const det3 = (m: Mat3): number => {
    const [
        [a, b, c],
        [d, e, f],
        [g, h, i]
    ] = m;

    return (a*e*i + b*f*g + c*d*h)
         - (c*e*g + b*d*i + a*f*h);
};

const substitute_row = (m: Mat3, v: Vec3, i: number): Mat3 => {
    const result: Mat3 = [...m];
    result[i] = v;
    return result;
};

const substitute_col = (m: Mat3, v: Vec3, col_index: number): Mat3 => {
    const result: Mat3 = m.map((r: Vec3): Vec3 => [...r]) as Mat3;
    for (let i = 0; i < 3; i++) {
        result[i][col_index] = v[i];
    }
    return result;
};


const solve = (m: Mat3, b: Vec3): Vec3 => {
    const d = det3(m);
    const d0 = det3(substitute_col(m, b, 0));
    const d1 = det3(substitute_col(m, b, 1));
    const d2 = det3(substitute_col(m, b, 2));

    return [d0 / d, d1 / d, d2 / d];
}

// A simple verifier.
const dist2 = (p: Vec3, a: Vec3, d: Vec3): number => {
    const pa: Vec3 = [ a[0] - p[0], a[1] - p[1], a[2] - p[2] ];
    const dpa = dot(d, pa);
    return dot(d, d) * dot(pa, pa) - dpa * dpa;
};

const sum_dist2 = (p: Vec3, a: Vec3[], d: Vec3[], n: number): number => {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += dist2(p, a[i], d[i]);
    return sum;
};

// Check 26 nearby points and verify the provided one is nearest.
const is_nearest = (p: Vec3, a: Vec3[], d: Vec3[], n: number): boolean => {
    let min_d2 = 1e100;
    let ii = 2;
    let jj = 2;
    let kk = 2;
    const D = 0.01;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            for (let k = -1; k <= 1; k++) {
                const pp: Vec3 = [ p[0] + D * i, p[1] + D * j, p[2] + D * k ];
                const d2 = sum_dist2(pp, a, d, n)
                if (d2 < min_d2 || i == 0 && j == 0 && k == 0 && d2 == min_d2) {
                    min_d2 = d2;
                    ii = i; jj = j; kk = k;
                }
            }
        }
    }
    return ii === 0 && jj === 0 && kk === 0;
};

const normalize = (v: Vec3): void => {
    const len = Math.sqrt(dot(v, v))
    v[0] /= len;
    v[1] /= len;
    v[2] /= len;
}
