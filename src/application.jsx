import { useEffect, useState } from "react";
import { Button } from "@heroui/react"
import useWilsonMaze from "./wilson";

import { Select, SelectItem } from "@heroui/react";

export const animals = [
    { key: "prim", label: "Prim" },
    { key: "wilson", label: "wilson" },
];

const WALL = 1;
const PATH = 0;
const NEIGHBOOR = 2;

const useMazePrim = (width, height) => {
    const [maze, setMaze] = useState([]);
    const [step, setStep] = useState(0);
    const [frontiers, setFrontiers] = useState([]);
    const [isComplete, setIsComplete] = useState(false);
    const [generationTime, setGenerationTime] = useState(0);
    const [startTime, setStartTime] = useState(0)
    const [numberSteps, setNumberSteps] = useState(0);


    const generateMaze = () => {
        const newMaze = Array.from({ length: height }, () => Array(width).fill(WALL));
        const _randomX = Math.floor(Math.random() * (width / 2)) * 2;
        const _randomY = Math.floor(Math.random() * (height / 2)) * 2;

        const newFrontiers = [];
        newMaze[_randomY][_randomX] = PATH;

        const directions = [[-2, 0], [2, 0], [0, -2], [0, 2]];
        for (let [dx, dy] of directions) {
            const x = _randomX + dx;
            const y = _randomY + dy;
            if (x >= 0 && x < width && y >= 0 && y < height && newMaze[y][x] !== PATH) {
                newMaze[y][x] = NEIGHBOOR;
                newFrontiers.push([x, y]);
            }
        }

        setMaze(newMaze);
        setFrontiers(newFrontiers);
        setStep(1);
        setIsComplete(false);
        setNumberSteps(0)
        setStartTime (performance.now());
    };

    useEffect(() => {
        generateMaze();
    }, []);

    useEffect(() => {
        if (frontiers.length === 0){
            setIsComplete(true);
            const endTime = performance.now(); 
            setGenerationTime((endTime - startTime));
            return;
        } 

        const newFrontiers = [...frontiers];
        const newMaze = maze.map(row => [...row]);
        const directions = [[-2, 0], [2, 0], [0, -2], [0, 2]];

        // Pick a random frontier cell
        const randomIndex = Math.floor(Math.random() * newFrontiers.length);
        const [fx, fy] = newFrontiers[randomIndex];
        newMaze[fy][fx] = PATH;
        newFrontiers.splice(randomIndex, 1);

        // Connect to a random existing path
        const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
        for (let [dx, dy] of shuffledDirections) {
            const nx = fx + dx;
            const ny = fy + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && newMaze[ny][nx] === PATH) {
                newMaze[fy + dy / 2][fx + dx / 2] = PATH;
                break;
            }
        }

        // Add new frontiers
        for (let [dx, dy] of directions) {
            const nx = fx + dx;
            const ny = fy + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && newMaze[ny][nx] === WALL) {
                newMaze[ny][nx] = NEIGHBOOR;
                newFrontiers.push([nx, ny]);
            }
        }

        setFrontiers(newFrontiers);
        setNumberSteps((prev)=>prev + 1)
        setMaze(newMaze);
        setTimeout(() => {
            setStep(prev => prev + 1);
        }, 10);
    }, [step]);

    // Function to regenerate the maze
    const regenerateMaze = () => {
        setStep(0);
        generateMaze();
    };

    return { maze, regenerateMaze, isComplete, generationTime, numberSteps };
};


const useMaze = ({ algo, width, height }) => {
    let maze, regenerate, isComplete, generationTime, numberSteps;
    const algoValue = algo.values().next().value;

    // Always call hooks, conditionally set the maze algorithm
    const { maze: primMaze, regenerateMaze: regeneratePrimMaze, isComplete : isCompetePrim, numberSteps : numberStepsPrim,
        generationTime : generationTimePrim } = useMazePrim(width * 2 - 1, height *2 - 1 );
    const { maze: wilsonMaze, regenerate: regenerateWilsonMaze , numberSteps : numberStepsWilson,
         isComplete : isCompeteWilson, generationTime : generationTimeWilson} = useWilsonMaze({ width , height });

    if (algoValue === 'prim') {
        maze = primMaze;
        regenerate = regeneratePrimMaze;
        isComplete = isCompetePrim
        generationTime = generationTimePrim
        numberSteps = numberStepsPrim
    } else {
        maze = wilsonMaze;
        regenerate = regenerateWilsonMaze;
        isComplete = isCompeteWilson
        generationTime = generationTimeWilson
        numberSteps = numberStepsWilson
    }

    return { maze, regenerate, isComplete, generationTime,numberSteps };
};

export const Application = () => {
    let width = 11;
    let height = 11;

    const [selectedAlgo, setSelectedAlgo] = useState(new Set(['wilson']));
    const {maze, regenerate : regenerateMaze, isComplete,generationTime, numberSteps} = useMaze({algo : selectedAlgo, width, height})

    return <div className="flex bg-gradient-to-tl from-zinc-950 to-zinc-800 h-screen justify-around flex-col items-center justify-center">
        <h1 className="text-3xl tracking-wider text-zinc-800 rounded-3xl font-extrabold px-8 py-2 bg-white">Hachimi Maze's</h1>
        <div className="flex w-fit gap-4">
            <Button isDisabled={!isComplete} onPress={() => regenerateMaze()} color={isComplete ? "primary" : "warning"} className="px-10 h-full text-md tracking-widest font-extrabold">
                {isComplete ?"REGENERATE" : "GENERATING..."}</Button>
            <Select selectedKeys={selectedAlgo} onSelectionChange={setSelectedAlgo} className="w-96" label="Selected Algorithm" >
                {animals.map((animal) => (
                    <SelectItem  key={animal.key}>{animal.label}</SelectItem>
                ))}
            </Select>
        </div>

        {generationTime && generationTime !=0 &&
        <span className="font-bold tracking wider text-zinc-100">Generation Time : <span className="text-success">{ (generationTime / 1000).toFixed(2)}</span>  seconds</span>}

        <div className="flex rounded-xl overflow-hidden flex-col">
            <div className="flex">
                {Array.from({ length: width * 2 + 1 }).map((e, i) => <span
                    className={["size-6", i == 1 ? "bg-green-500 " : "bg-white"].join(" ")} >
                </span>)}
            </div>

            {maze.map((column, i) =>
                <div key={i} className="flex">
                    <span className={"size-6 bg-white"} ></span>
                    {column.map((cell, j) => <span key={j}
                        className={["size-6", cell == PATH ? "bg-zinc-800" : (cell == WALL ? "bg-white" : "bg-blue-800")].join(" ")} >
                    </span>)}
                    <span className={"size-6 bg-white"} ></span>
                </div>)}

            <div className="flex">
                {Array.from({ length: width * 2 + 1 }).map((e, i) => <span
                    className={["size-6", i == width * 2 - 1 ? "bg-red-500 " : "bg-white"].join(" ")} >
                </span>)}
            </div>

        </div>
    </div>;

}
