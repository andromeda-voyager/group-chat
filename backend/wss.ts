// This file is modified from code provided by the Deno authors
// Original file can be found at https://deno.land/std@0.80.0/ws/README.md
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
// Copyright 2020 Matthew Potts. All rights reserved. MIT license.
import { serve } from "https://deno.land/std@0.80.0/http/server.ts";
import { EventEmitter } from "https://deno.land/std@0.80.0/node/events.ts";

import {
    acceptWebSocket,
    isWebSocketCloseEvent,
    isWebSocketPingEvent,
    WebSocket,
} from "https://deno.land/std@0.80.0/ws/mod.ts";

export class WSS extends EventEmitter {
    clients: Set<WS> = new Set<WS>();
    constructor(private port: Number = 8080) {
        super();
        this.connect();
    }
    async connect() {
        console.log(`websocket server is running on :${this.port}`);
        for await (const req of serve(`:${this.port}`)) {
            const { conn, r: bufReader, w: bufWriter, headers } = req;

            acceptWebSocket({
                conn,
                bufReader,
                bufWriter,
                headers,
            })
                .then(WS => this.handleWs(WS))
                .catch(async (err: Error) => {
                    console.error(`failed to accept websocket: ${err}`);
                    await req.respond({ status: 400 });
                });
        }
    }
    handleWs(webSocket: WebSocket) {
        const ws: WS = new WS(webSocket);
        ws.open();
        this.clients.add(ws);
        this.emit("connected", ws);
    }
}

export class WS extends EventEmitter {
    webSocket: WebSocket;
    constructor(webSocket: WebSocket) {
        super();
        this.webSocket = webSocket;
    }
    async open() {
        console.log("socket connected!");
        try {
            for await (const ev of this.webSocket) {
                if (typeof ev === "string") {
                    // text message.
                    this.emit("message", ev)
                } else if (ev instanceof Uint8Array) {
                    // binary message.
                    this.emit("message", ev);
                } else if (isWebSocketPingEvent(ev)) {
                    const [, body] = ev;
                    // ping.
                    console.log("weboscket:Ping", body);
                } else if (isWebSocketCloseEvent(ev)) {
                    // close.
                    const { code, reason } = ev;
                    console.log("websocket:Close", code, reason);
                    this.emit("close", code);
                }
            }
        } catch (err) {
            console.error(`failed to receive frame: ${err}`);

            if (!this.webSocket.isClosed) {
                await this.webSocket.close(1000).catch(console.error);
            }
        }
    }
    async send(message: string | Uint8Array) {
        console.log("sending message: " + message);
        this.webSocket.send(message);
    }
}