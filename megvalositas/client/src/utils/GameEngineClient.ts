export class GameEngineClient {
  private socket: any;
  private eventHandlers: Record<string, ((...args: any[]) => void)[]> = {};

  constructor(socket: any) {
    this.socket = socket;
    this.initializeSocketListeners();
  }

  private initializeSocketListeners() {
    this.socket.on("log", (message: string) => {
      this.emit("log", message);
    });
    this.socket.on("stateChanged", (data: any) => {
      this.emit("stateChanged", data.state);
    });
    this.socket.on("actionSelected", (data: any) => {
      this.emit("actionSelected", data);
    });
    this.socket.on("actionExecuted", (data: any) => {
      this.emit("actionExecuted", data);
    });
    this.socket.on("stepCompleted", (data: any) => {
      this.emit("stepCompleted", data);
    });
    this.socket.on("gameStarted", (data: any) => {
      this.emit("gameStarted", data);
    });
    this.socket.on("awaitSelection", (data: any) => {
      this.emit("awaitSelection", data);
    });
    this.socket.on("resetGame", (data: any) => {
      this.emit("resetGame", data);
    })
  }

  // callback-ek adott eseményekre
  public on(event: string, handler: (...args: any[]) => void): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  // Események leiratkozása
  public off(event: string, handler: (...args: any[]) => void): void {
    if (!this.eventHandlers[event]) return;
    this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
  }

  // Az emit metódus meghívja az on()-nal regisztrált callback-eket
  private emit(event: string, ...args: any[]): void {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => handler(...args));
    }
  }
  public setSelectedAction(action: string, player: any): void {
    this.socket.emit("actionSelected", { action, player });
  }
}
