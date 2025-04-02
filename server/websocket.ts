import { WebSocketServer, WebSocket } from "ws";
import { IStorage } from "./storage";
import { WebSocketMessage } from "@shared/schema";

export function setupWebSocketServer(wss: WebSocketServer, storage: IStorage) {
  wss.on("connection", (ws: WebSocket) => {
    console.log("WebSocket client connected");
    
    // Send initial welcome message
    const message: WebSocketMessage = {
      type: "PLATE_DETECTED",
      data: {
        message: "Connected to BeaverPlate WebSocket server"
      }
    };
    
    ws.send(JSON.stringify(message));
    
    // Get recent plates and send them to the client
    storage.getRecentPlates(5)
      .then(plates => {
        if (plates.length > 0 && ws.readyState === WebSocket.OPEN) {
          const recentMessage: WebSocketMessage = {
            type: "PLATE_DETECTED",
            data: plates[0] // Send the most recent plate
          };
          ws.send(JSON.stringify(recentMessage));
        }
      })
      .catch(error => {
        console.error("Error fetching recent plates:", error);
      });
    
    // Handle messages from client
    ws.on("message", (data: string) => {
      try {
        const message = JSON.parse(data) as WebSocketMessage;
        console.log("Received message:", message);
        
        // Handle different message types
        switch (message.type) {
          case "PLATE_DETECTED":
            // Process the detected plate
            // In a real implementation, this might trigger validation
            break;
            
          default:
            // Handle unknown message types
            const errorMessage: WebSocketMessage = {
              type: "ERROR",
              error: `Unknown message type: ${message.type}`
            };
            ws.send(JSON.stringify(errorMessage));
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        const errorMessage: WebSocketMessage = {
          type: "ERROR",
          error: "Invalid message format"
        };
        ws.send(JSON.stringify(errorMessage));
      }
    });
    
    // Handle client disconnection
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
    
    // Handle errors
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
  
  return wss;
}
