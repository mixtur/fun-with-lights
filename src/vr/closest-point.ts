type Vec3 = [number, number, number];
type Mat3 = [Vec3, Vec3, Vec3];

const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const find_nearest_point = (p: Vec3, a: Vec3[], d: Vec3[], n: number): void => {
    const m: Mat3 = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];

    const b = [0, 0, 0];

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

        solve(m, b, p, 3);
    }
};

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

// void solve(double *a, double *b, double *x, int n)
// {
// #define A(y, x) (*mat_elem(a, y, x, n))
//   int i, j, col, row, max_row, dia;
//   double max, tmp;
//
//   for (dia = 0; dia < n; dia++) {
//     max_row = dia, max = fabs(A(dia, dia));
//     for (row = dia + 1; row < n; row++)
//       if ((tmp = fabs(A(row, dia))) > max) max_row = row, max = tmp;
//     swap_row(a, b, dia, max_row, n);
//     for (row = dia + 1; row < n; row++) {
//       tmp = A(row, dia) / A(dia, dia);
//       for (col = dia+1; col < n; col++)
//         A(row, col) -= tmp * A(dia, col);
//       A(row, dia) = 0;
//       b[row] -= tmp * b[dia];
//     }
//   }
//   for (row = n - 1; row >= 0; row--) {
//     tmp = b[row];
//     for (j = n - 1; j > row; j--) tmp -= x[j] * A(row, j);
//     x[row] = tmp / A(row, row);
//   }
// #undef A
// }