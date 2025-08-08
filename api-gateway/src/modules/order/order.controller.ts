import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { OrderGatewayService } from './order.service';
import { successResponse, throwHttpFormattedError } from '../../utils/error.util';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderGatewayService: OrderGatewayService,
  ) { }
  
}