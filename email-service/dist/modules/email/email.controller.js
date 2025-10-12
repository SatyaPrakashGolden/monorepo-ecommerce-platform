"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailController = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("./email.service");
const microservices_1 = require("@nestjs/microservices");
let EmailController = class EmailController {
    emailService;
    constructor(emailService) {
        this.emailService = emailService;
    }
    async handleSendEmail(message) {
        console.log('✅ Event Received in Email Service:', message);
        const { email, paid_amount, payment_status, order_status, payment_method } = message;
        console.log(email, paid_amount, payment_status, order_status, payment_method);
        const htmlBody = `<div style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
  <!-- Header -->
  <div style="background-color: #1e3a8a; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Order Confirmation</h2>
  </div>

  <!-- Body -->
  <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; color: #1f2937; margin: 0 0 15px;">Hi there,</p>
    <p style="font-size: 16px; color: #1f2937; margin: 0 0 20px;">Thank you for your order! We're excited to confirm your purchase. Below are the details of your order:</p>

    <!-- Order Details -->
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
      <h3 style="font-size: 18px; color: #1e3a8a; margin: 0 0 15px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">🧾</span> Order Details
      </h3>
      <ul style="list-style: none; padding: 0; margin: 0; font-size: 15px; color: #1f2937;">
        <li style="margin-bottom: 10px;">
          <strong style="color: #374151;">Paid Amount:</strong> ₹${paid_amount}
        </li>
        <li style="margin-bottom: 10px;">
          <strong style="color: #374151;">Payment Status:</strong> ${payment_status}
        </li>
        <li style="margin-bottom: 10px;">
          <strong style="color: #374151;">Order Status:</strong> ${order_status}
        </li>
        <li>
          <strong style="color: #374151;">Payment Method:</strong> ${payment_method}
        </li>
      </ul>
    </div>

    <!-- Message -->
    <p style="font-size: 16px; color: #1f2937; margin: 0 0 20px;">We’ll keep you updated as your order progresses. If you have any questions, feel free to reach out!</p>
    <p style="font-size: 16px; color: #1f2937; margin: 0;">Warm regards,<br><strong style="color: #1e3a8a;">Team Delente Technologies</strong></p>
  </div>

  <!-- Footer -->
  <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
  <div style="font-size: 13px; color: #6b7280; text-align: center; padding: 0 20px;">
    <p style="margin: 0 0 10px;">
      <strong style="color: #374151;">🏢 Registered Office Address:</strong><br>
      Delente Technologies Pvt. Ltd.<br>
      M3M Cosmopolitan, 12th Cosmopolitan,<br>
      Golf Course Ext Rd, Sector 66,<br>
      Gurugram, Haryana - 122002
    </p>
    <p style="margin: 0; color: #9ca3af;">&copy; 2025 Delente Technologies. All rights reserved.</p>
  </div>
</div>`;
        await this.emailService.sendMail(email, 'Your Order Has Been Placed Successfully!', htmlBody);
        return { message: `Email sent to ${email}` };
    }
};
exports.EmailController = EmailController;
__decorate([
    (0, microservices_1.EventPattern)('send-email'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "handleSendEmail", null);
exports.EmailController = EmailController = __decorate([
    (0, common_1.Controller)('email'),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailController);
//# sourceMappingURL=email.controller.js.map