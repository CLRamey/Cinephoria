import { sendEmail } from '../../src/services/mailService';
import nodemailer from 'nodemailer';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('nodemailer');

const mockSendMail = jest.fn(() => Promise.resolve({ messageId: '' }));

// Tell nodemailer.createTransport to return an object with the mocked sendMail
(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: mockSendMail,
});

describe('sendEmail', () => {
  const to = 'test@example.com';
  const subject = 'Test Subject';
  const text = 'This is a test email.';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send an email and return messageId', async () => {
    mockSendMail.mockResolvedValueOnce({ messageId: 'mocked-id' });

    const result = await sendEmail(to, subject, text);

    expect(mockSendMail).toHaveBeenCalledWith({
      from: `"Cinephoria" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });

    expect(result.messageId).toBe('mocked-id');
  });

  it('should throw an error when sending fails', async () => {
    const error = new Error('Mock failure');
    mockSendMail.mockRejectedValueOnce(error);

    await expect(sendEmail(to, subject, text)).rejects.toThrow('Mock failure');
    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });
});
