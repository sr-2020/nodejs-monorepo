import { LegacyQrType } from '@alice/alice-qr-lib/qr.types';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QrData {
  @ApiProperty({ type: Number })
  @IsInt()
  @Transform(Number.parseInt)
  type: LegacyQrType;

  @ApiProperty()
  @IsInt()
  @Transform(Number.parseInt)
  kind: number;

  @ApiProperty()
  @IsInt()
  @Transform(Number.parseInt)
  validUntil: number;

  @ApiProperty()
  @IsString()
  payload: string;
}

export class EncodedQrData {
  @ApiProperty()
  @IsString()
  content: string;
}
