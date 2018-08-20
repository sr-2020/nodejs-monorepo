declare class App {
    private app;
    private server;
    constructor();
    listen(port: number): void;
    stop(): void;
}
export default App;
