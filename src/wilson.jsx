import { useState, useEffect } from "react";

const N = 1, S = 2, E = 4, W = 8;
const IN = 16;
const DX = { [E]: 1, [W]: -1, [N]: 0, [S]: 0 };
const DY = { [E]: 0, [W]: 0, [N]: -1, [S]: 1 };
const OPPOSITE = { [E]: W, [W]: E, [N]: S, [S]: N };

const useWilsonMaze = ({ width, height }) => {
    const [maze, setMaze] = useState(Array.from({ length: height * 2 - 1 }, () => Array(width * 2 - 1).fill(1)));
    const [trigger, setTrigger] = useState(0); 
    const [isComplete, setIsComplete] = useState(false);
    const [generationTime, setGenerationTime] = useState(0);
    const [numberSteps, setNumberSteps] = useState(0);

    useEffect(() => {
        let grid = Array.from({ length: height }, () => Array(width).fill(0));
        grid[Math.floor(Math.random() * height)][Math.floor(Math.random() * width)] = IN;
        let remaining = width * height - 1;
        setIsComplete(false); 
        let _numberSteps = 0
        
        let startTime = performance.now()

        const walk = (grid) => {
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
        };

        const generateMaze = async () => {
            while (remaining > 0) {
                for (let [x, y, dir] of walk(grid)) {
                    _numberSteps +=1
                    let nx = x + DX[dir];
                    let ny = y + DY[dir];
                    grid[y][x] |= dir;
                    grid[ny][nx] |= OPPOSITE[dir];
                    remaining--;
                    await new Promise(resolve => setTimeout(resolve, 10));
                    setMaze(generateMazeArray(grid));
                }
            }
            setIsComplete(true); 
            setNumberSteps(_numberSteps)
            const endTime = performance.now(); 
            setGenerationTime((endTime - startTime).toFixed(2));

        };

        generateMaze();
    }, [trigger]); 

    const generateMazeArray = (grid) => {
        let maze = Array.from({ length: height * 2 - 1 }, () => Array(width * 2 - 1).fill(1));
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let cell = grid[y][x];
                let mazeY = y * 2;
                let mazeX = x * 2;
                maze[mazeY][mazeX] = 0;
                if (cell & E) maze[mazeY][mazeX + 1] = 0;
                if (cell & S) maze[mazeY + 1][mazeX] = 0;
            }
        }
        return maze;
    };

    const regenerate = () => {
        setTrigger(t => t + 1);
    };

    return { maze, regenerate, isComplete,generationTime,numberSteps };
};

export default useWilsonMaze;
