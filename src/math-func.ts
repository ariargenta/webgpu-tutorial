import {vec3} from 'gl-matrix';

export const Sinc = (x: number, z: number, center: vec3 = [0, 0, 0]) => {
    let r = Math.sqrt(x * x + z * z);
    let y = (r == 0) ? 1 : Math.sin(r) / r;

    return vec3.fromValues(x + center[0], y + center[1], z + center[2]);
}