import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Long, ObjectId } from 'bson';

@Injectable()
export class TransformLongToStringInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.recursivelyTransform(data))
    );
  }

private recursivelyTransform(obj: any): any {
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => this.recursivelyTransform(item));
  }

  if (obj && typeof obj === 'object') {
    if (
      typeof obj.low === 'number' &&
      typeof obj.high === 'number' &&
      typeof obj.unsigned === 'boolean'
    ) {
      try {
        return Long.fromBits(obj.low, obj.high, obj.unsigned).toString();
      } catch {
        return obj;
      }
    }

    if (obj._bsontype === 'ObjectID' && typeof obj.toString === 'function') {
      return obj.toString();
    }

    if (obj.buffer && obj.buffer.type === 'Buffer' && Array.isArray(obj.buffer.data)) {
      try {
        return new ObjectId(Buffer.from(obj.buffer.data)).toString();
      } catch {
        return obj;
      }
    }

    const result = {};
    for (const key of Object.keys(obj)) {
      result[key] = this.recursivelyTransform(obj[key]);
    }
    return result;
  }

  return obj;
}
}
