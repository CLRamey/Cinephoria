import { sendVerificationEmail } from '../../src/utils/verificationEmail';
import { sendEmail } from '../../src/services/mailService';

jest.mock('../../src/services/mailService');

afterEach(() => {
  jest.resetAllMocks();
});

describe('sendVerificationEmail', () => {
  const mockedSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call sendEmail with correct parameters', async () => {
    const to = 'user@example.com';
    const firstName = 'Jean';
    const verificationLink = 'https://example.com/verify?code=abc123';

    await sendVerificationEmail(to, firstName, verificationLink);

    expect(mockedSendEmail).toHaveBeenCalledTimes(1);

    // Check that the email was sent with the correct parameters
    const [calledTo, calledSubject, calledText, calledHtml] = mockedSendEmail.mock.calls[0];
    expect(calledTo).toBe(to);
    expect(calledSubject).toBe('Confirmez votre compte Cinéphoria');
    expect(calledText).toContain(firstName);
    expect(calledText).toContain(verificationLink);

    // Check html also contains interpolated values and basic html tags
    expect(calledHtml).toContain(`<strong>${firstName}</strong>`);
    expect(calledHtml).toContain(`href="${verificationLink}"`);
    expect(calledHtml).toContain('style="font-family: Arial, sans-serif; font-size: 15px;"');
  });
});
