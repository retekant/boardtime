import {useState, useEffect, useRef} from "preact/hooks";

interface Point {
  x: number;
  y: number;
}

export default function DrawingBoard() {

    const boardRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    const[isDrawing, setIsDrawing] = useState(false);
    const[currentLine, setCurrentLine] = useState<Point[]>([]);


    const setUpCanvas = () => {
        const canvas = boardRef.current;
        if (!canvas) return;
        //recheck
        const context = canvas.getContext("2d");
        if (!context) return;

        context.strokeStyle = "#000000";
        context.lineWidth = 3;
        


        contextRef.current = context;
    }

    const getMouseCoords = (e: MouseEvent): Point => {

        const canvas = boardRef.current;
        const rectangle = canvas?.getBoundingClientRect();

        let localX, localY;
        
        if(e instanceof TouchEvent){
            const point = e.touches[0];
            localX = point.clientX;
            localY = point.clientY;
        }
        else{
            localX = e.clientX;
            localY = e.clientY;
        }

        if (!rectangle) return { x: 0, y: 0 };

        return {
            x: localX - rectangle.left, 
            y: localY - rectangle.top
        }
    }

    useEffect(() => {
        setUpCanvas();
    }, []);

    const handleDraw = (e: MouseEvent, type: 'start' | 'during' | 'end') => {

        const context = contextRef.current;
        if (!context) return;

        e.preventDefault();



        if (type == "end"){
            setIsDrawing(false);
            setCurrentLine([]);
            return;
        }

        
        const point = getMouseCoords(e);

        if(type == "start"){
            setIsDrawing(true);
            setCurrentLine([point]);

            context.beginPath();
            context.moveTo(point.x, point.y);
        }

        else if(type == "during"){
            if(!isDrawing) return;

            setCurrentLine(prev => [...prev, point]);

            context.lineTo(point.x, point.y);
            context.stroke();
        }

    }


  return (
      <canvas
          ref={boardRef} class="inset-0 cursor-crosshair touch-none w-full h-full bg-white"
          onMouseDown={(e) => handleDraw(e, 'start')}
          onMouseMove={(e) => handleDraw(e, 'during')}
          onMouseUp={(e) => handleDraw(e, 'end')}
        />
  );
}
