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
