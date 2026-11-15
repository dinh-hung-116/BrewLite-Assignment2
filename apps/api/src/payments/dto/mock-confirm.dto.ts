import { IsIn, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class MockConfirmDto {
  @IsString()
  orderCode!: string;

  @IsInt()
  @Min(1)
  paymentId!: number;

  @IsIn(['WALLET', 'CARD'])
  method!: 'WALLET' | 'CARD';

  @IsOptional()
  @Matches(/^[\d ]{16,19}$/, { message: 'Số thẻ phải gồm 16 chữ số' })
  cardNumber?: string;
}
