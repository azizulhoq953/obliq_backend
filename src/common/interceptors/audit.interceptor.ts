import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
	constructor(private readonly auditService: AuditService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest<Request & { user?: { id?: string } }>();
		const method = request.method?.toUpperCase() || '';
		const shouldAudit = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

		if (!shouldAudit) {
			return next.handle();
		}

		const routePath = request.route?.path || request.path || 'unknown';
		const action = `API_${method}_${String(routePath).replace(/[/:]/g, '_').toUpperCase()}`;

		return next.handle().pipe(
			tap({
				next: () => {
					if (!request.user?.id) {
						return;
					}

					void this.auditService
						.log(
							request.user.id,
							action,
							{ method, path: request.originalUrl },
							undefined,
							request.ip,
						)
						.catch(() => undefined);
				},
			}),
		);
	}
}
