import { Response, Request } from 'express';
import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        password: string;
    }, res: Response, req: Request): Promise<{
        accessToken: string;
        user: any;
    }>;
    logout(req: any, res: Response): Promise<{
        message: string;
    }>;
    refresh(req: any, res: Response): Promise<{
        accessToken: string;
    }>;
    me(req: any): Promise<any>;
}
