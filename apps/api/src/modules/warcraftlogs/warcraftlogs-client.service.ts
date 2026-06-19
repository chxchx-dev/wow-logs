import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WarcraftLogsAuthService } from './warcraftlogs-auth.service';

@Injectable()
export class WarcraftLogsClientService {
  private readonly logger = new Logger(WarcraftLogsClientService.name);

  constructor(
    private readonly auth: WarcraftLogsAuthService,
    private readonly config: ConfigService,
  ) {}

  async query<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const token = await this.auth.getToken();
    const graphqlUrl = this.config.getOrThrow<string>('WARCRAFTLOGS_GRAPHQL_URL');

    let res: Response;

    try {
      res = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'TimeoutError') {
        throw new GatewayTimeoutException({
          code: 'EXTERNAL_API_TIMEOUT',
          message: 'Warcraft Logs tardó demasiado. Vuelve a intentarlo.',
        });
      }
      throw new InternalServerErrorException({
        code: 'WARCRAFTLOGS_API_ERROR',
        message: 'Error de conexión con Warcraft Logs.',
      });
    }

    if (res.status === 429) {
      throw new HttpException(
        { code: 'WARCRAFTLOGS_RATE_LIMITED', message: 'Warcraft Logs está limitando las peticiones. Espera unos segundos e intenta de nuevo.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const payload = (await res.json()) as { data?: T; errors?: { message: string }[] };

    if (payload.errors?.length) {
      const msg = payload.errors[0].message ?? '';
      this.logger.error(`WCL GraphQL error: ${msg}`);

      if (/rate.?limit/i.test(msg)) {
        throw new HttpException(
          { code: 'WARCRAFTLOGS_RATE_LIMITED', message: 'Warcraft Logs está limitando las peticiones. Espera unos segundos e intenta de nuevo.' },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (/permission|forbidden|private/i.test(msg)) {
        throw new ForbiddenException({
          code: 'REPORT_PRIVATE_OR_FORBIDDEN',
          message: 'No pude leer este reporte. Es privado, inexistente o la app no tiene acceso.',
        });
      }

      if (/not found|invalid/i.test(msg)) {
        throw new NotFoundException({
          code: 'REPORT_NOT_FOUND',
          message: 'El reporte no existe en Warcraft Logs.',
        });
      }

      throw new InternalServerErrorException({
        code: 'WARCRAFTLOGS_API_ERROR',
        message: 'Error inesperado en Warcraft Logs.',
      });
    }

    if (!payload.data) {
      throw new InternalServerErrorException({
        code: 'WARCRAFTLOGS_API_ERROR',
        message: 'Warcraft Logs devolvió una respuesta vacía.',
      });
    }

    return payload.data;
  }
}
