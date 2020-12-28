import { WS, WSS } from "./wss.ts";

const wss = new WSS(8080);
var connections: WS[] = [];
listen();
export function listen() {
    
    wss.on("connected", function (ws: WS) {
        connections.push(ws);
        ws.on("message", function (message: string) {
            for (const c of connections) {
                if (c != ws) {
                    c.send(message);
                }
            }
            console.log(message);
        });

        ws.on("close", function(ws:WS) {
            connections.splice(connections.indexOf(ws), 1);
            console.log("A ws was closed.");
        });
    });
}