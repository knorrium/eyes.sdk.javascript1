import { ConfigurationPlain } from './index';
interface EyesServiceOptions extends ConfigurationPlain {
    useVisualGrid?: boolean;
    concurrency?: number;
    eyes?: EyesServiceOptions;
}
declare class EyesService {
    private _eyes;
    private _appName?;
    private _testResults?;
    constructor({ useVisualGrid, concurrency, eyes, ...config }: EyesServiceOptions);
    private _eyesOpen;
    private _eyesClose;
    beforeSession(config: Record<string, unknown>): void;
    before(): void;
    beforeTest(test: any): void;
    afterTest(): Promise<void>;
    after(): Promise<void>;
}
export = EyesService;
