import { BadRequestException, Controller, Get, Query, Redirect } from '@nestjs/common';
import { EncodedQrData, QrData } from '@alice/alice-qr-lib/qr.dto';
import { decode, encode } from './qr';
import { ApiResponse } from '@nestjs/swagger';

@Controller()
export class QrController {
  @Get('/decode')
  @ApiResponse({ type: QrData })
  decode(@Query() query: EncodedQrData): QrData {
    try {
      return decode(query.content);
    } catch (e) {
      console.warn('exception in /decode: ', e);
      throw new BadRequestException('Wrong data format');
    }
  }

  @Get('/encode')
  @ApiResponse({ type: EncodedQrData })
  encode(@Query() query: QrData): EncodedQrData {
    try {
      return { content: encode(query) };
    } catch (e) {
      console.warn('exception in /encode: ', e);
      throw new BadRequestException('Wrong data format');
    }
  }

  @Get('/encode_to_image')
  @Redirect()
  encodeToImage(@Query() query: QrData) {
    try {
      const content = encode(query);
      return {
        url: `http://api.qrserver.com/v1/create-qr-code/?color=000000&bgcolor=FFFFFF&data=${content}&qzone=10&margin=0&size=300x300&ecc=L&format=svg`,
        statusCode: 301,
      };
    } catch (e) {
      console.warn('exception in /encode_to_image: ', e);
      throw new BadRequestException('Wrong data format');
    }
  }
}
