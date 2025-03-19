const width = 10;
const height = 10;

const N = 1, S = 2, E = 4, W = 8;
const IN = 16;
const DX = { [E]: 1, [W]: -1, [N]: 0, [S]: 0 };
const DY = { [E]: 0, [W]: 0, [N]: -1, [S]: 1 };
const OPPOSITE = { [E]: W, [W]: E, [N]: S, [S]: N };

let grid = Array.from({ length: height }, () => Array(width).fill(0));



function walk(grid) {
    while (true) {
        let cx = Math.floor(Math.random() * width);
        let cy = Math.floor(Math.random() * height);
        if (grid[cy][cx] !== 0) continue;

        let visits = new Map();
        visits.set(`${cx},${cy}`, 0);
        let start_x = cx, start_y = cy;
        let walking = true;

        while (walking) {
            let directions = [N, S, E, W].sort(() => Math.random() - 0.5);
            walking = false;
            
            for (let dir of directions) {
                let nx = cx + DX[dir];
                let ny = cy + DY[dir];
                if (nx >= 0 && ny >= 0 && ny < height && nx < width) {
                    visits.set(`${cx},${cy}`, dir);
                    if (grid[ny][nx] !== 0) {
                        break;
                    } else {
                        cx = nx;
                        cy = ny;
                        walking = true;
                        break;
                    }
                }
            }
        }

        let path = [];
        let [x, y] = [start_x, start_y];
        while (visits.has(`${x},${y}`)) {
            let dir = visits.get(`${x},${y}`);
            path.push([x, y, dir]);
            x += DX[dir];
            y += DY[dir];
        }

        return path;
    }
}

grid[Math.floor(Math.random() * height)][Math.floor(Math.random() * width)] = IN;
let remaining = width * height - 1;

while (remaining > 0) {
    for (let [x, y, dir] of walk(grid)) {
        let nx = x + DX[dir];
        let ny = y + DY[dir];

        grid[y][x] |= dir;
        grid[ny][nx] |= OPPOSITE[dir];

        remaining--;
    }
}

