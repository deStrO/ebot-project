export interface Queue {
    setup(config: any): void;
    dispatch(serverIp: string, content: string): void;
}
