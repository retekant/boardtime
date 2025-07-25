
const sockets = new Set<WebSocket>();

export function handler(req: Request): Response {

    const{socket, response} = Deno.upgradeWebSocket(req);

    socket.onopen = () => sockets.add(socket);
    socket.onclose = () => sockets.delete(socket);

    socket.onmessage = (e) => {
        for(const socketC of sockets) {
            if(socketC != socket && socketC.readyState == WebSocket.OPEN){
                socketC.send(e.data);
            }
        }

    }

    return response;
}