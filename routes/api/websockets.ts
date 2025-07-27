
const sockets = new Set<WebSocket>();

const kv = await Deno.openKv();



export function handler(req: Request): Response {

    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onopen = async () => {
        sockets.add(socket);

        const drawings = kv.list({ prefix: ["drawings"] });

        for await (const entry of drawings) {
            if (socket.readyState == WebSocket.OPEN) {
                socket.send(JSON.stringify(entry.value));
            }
        }
    }

    socket.onclose = () => sockets.delete(socket);

    socket.onmessage = async (e) => {
        const data = JSON.parse(e.data);

        if (data.type == "start" || data.type == "draw") {
            const time = Date.now();
            await kv.set(["drawings", time], data);
        }


        for (const socketC of sockets) {
            if (socketC != socket && socketC.readyState == WebSocket.OPEN) {
                socketC.send(e.data);
            }
        }

    }

    return response;
}