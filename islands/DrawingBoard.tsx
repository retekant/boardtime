import {useState, useEffect, useRef} from "preact/hooks";

interface Point {
  x: number;
  y: number;
}

export default function DrawingBoard() {

    const boardRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const webSocketRef = useRef<WebSocket | null>(null);

    const[isDrawing, setIsDrawing] = useState(false);
    const[currentLine, setCurrentLine] = useState<Point[]>([]);

    const[loadID, setLoadID] = useState<string>("");
    const[saveID, setSaveID] = useState<string>("");

    //set ups

    const setUpCanvas = () => {
        const canvas = boardRef.current;
        if (!canvas) return;
        //recheck
        const context = canvas.getContext("2d");
        if (!context) return;

        const setBoardSize = () => {

            const rectangle = canvas.getBoundingClientRect();
            canvas.width = rectangle.width;
            canvas.height = rectangle.height;

            context.strokeStyle = "#000000'";
            context.lineWidth = 3;
        }

        setBoardSize();
        globalThis.addEventListener('resize', setBoardSize);

        contextRef.current = context;

        return () => globalThis.removeEventListener("resize", setBoardSize);
    }

    const setupWebSocket = () => {
        const protocol = location.protocol == "https:" ? 'wss:' : "ws:";
        const webSockt = new WebSocket(`${protocol}//${location.host}/api/websockets`);

        webSockt.onmessage = (e) => {
            const data = JSON.parse(e.data);
            drawOnlineLine(data);
            
        }
        webSocketRef.current = webSockt;

    }

    const generateID = () => {

        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < 24; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return result;
    }

    // gets

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

    //handles

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
            sendDrawing('start', point);
        }

        else if(type == "during"){
            if(!isDrawing) return;

            setCurrentLine(prev => [...prev, point]);

            context.lineTo(point.x, point.y);
            context.stroke();
            sendDrawing('draw', point);
        }

    }

    const handleSave = async () => {
        const canvas = boardRef.current;
        if(!canvas) return;

        const id = generateID();
        const imageData = canvas.toDataURL();

        try {
            const res = await fetch('/api/saveDrawing', {
                method: "POST",
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({id, imageData}),
            })

            if (res.ok) setSaveID(id);
        }

        catch (err) {
            console.error("Failed to save:", err);

        }

    }

    const handleLoad = async () => {

        if (!loadID) return;

        try {
            const res = await fetch(`/api/loadDrawing/${loadID}`);

            if (res.ok) {

                const data = await res.json();

                const canvas = boardRef.current;
                const context = contextRef.current;

                if (!canvas || !context) return;


                const img = new Image();

                img.onload = () => {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(img, 0, 0);
                };

                img.src = data.imageData;
            }
        } 
        
        catch (error) {
            console.error('Failed to load drawing:', error);
        }
    };

    const handleClear = async () => {
        const canvas = boardRef.current;
        const context = contextRef.current;
        if (!canvas || !context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);

        if (saveID) {
            try {
                await fetch('/api/deleteDrawing', {
                    method: "DELETE",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: saveID }),
                });
            } 
            
            catch (err) {
                console.error("Failed to delete saved data:", err);
            }
        }

        setSaveID("");
    };

    //use effects
    useEffect(() => {
        setUpCanvas();
        setupWebSocket();
    }, []);

    //websockets

    const drawOnlineLine = (data: {type: string, point: Point}) => {
        const context = contextRef.current;
        if(!context) return;
        
        if(data.type == 'start') {
            context.beginPath();
            context.moveTo(data.point.x, data.point.y);

        }

        else if (data.type == 'draw') {
            context.lineTo(data.point.x, data.point.y);
            context.stroke();
        }
        
    }

    const sendDrawing = (type: string, point: Point) => {
        if(!webSocketRef.current) return;

        if (webSocketRef.current.readyState == WebSocket.OPEN){
            webSocketRef.current.send(JSON.stringify({type, point}));
        }
    }

  return (
    <div class="w-full h-full relative">
      <canvas
          ref={boardRef} class="inset-0 cursor-crosshair touch-none w-full h-full bg-white"
          onMouseDown={(e) => handleDraw(e, 'start')}
          onMouseMove={(e) => handleDraw(e, 'during')}
          onMouseUp={(e) => handleDraw(e, 'end')}
          onMouseLeave={(e) => handleDraw(e, 'end')}
        />

        <div class="bg-emerald-300 flex flex-col text-white">

              <button 
                  onClick={handleSave}
                  class="bg-black"
              >
                  Save
              </button>
              
                <input
                    type="text"
                    value={loadID}
                    onInput={(e) => setLoadID((e.target as HTMLInputElement).value)}
                    placeholder="Enter ID to load"
                    class="px-2 py-1 border rounded text-sm"
                />


                <button 
                    onClick={handleLoad}
                     class="bg-gray-600"
                >
                    Load
                </button>
              
              
              <button 
                  onClick={handleClear}
                  class="bg-indigo-950"
              >
                  Clear
              </button>
              
          </div>
          <div>ID: {saveID ? saveID : ""}</div>
      </div>
  );
}
