import {
  sanitizeUserInput,
  sanitizeUserInputObject,
  sanitizeRegisterInput,
  sanitizeEmployeeInput,
  sanitizeLoginInput,
  sanitizeFilmInput,
} from '../../src/utils/sanitize';
import { filmAttributes } from '../../src/models/film';
import { Role, RegisterInput, LoginUserInput } from '../../src/validators/userValidator';

describe('sanitizeUserInput', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should remove script and style tags', () => {
    const dirty = '<script>alert("x")</script><style>body{}</style>hello';
    const result = sanitizeUserInput(dirty);
    expect(result).toBe('hello');
  });

  it('should remove all HTML tags', () => {
    const dirty = '<b>Bold</b><i>Italic</i><div>Text</div>';
    const result = sanitizeUserInput(dirty);
    expect(result).toBe('BoldItalicText');
  });

  it('should return plain text as is', () => {
    const clean = 'Simple text with no tags';
    const result = sanitizeUserInput(clean);
    expect(result).toBe(clean);
  });
});

describe('sanitizeUserInputObject', () => {
  it('should sanitize all string values', () => {
    const input = {
      safe: 'hello',
      unsafe: '<script>alert("x")</script>Hi',
      numberLike: 123,
    };
    const result = sanitizeUserInputObject(input);
    expect(result.safe).toBe('hello');
    expect(result.unsafe).toBe('Hi');
    expect(result.numberLike).toBe('123');
  });
});

describe('sanitizeRegisterInput', () => {
  const dirtyInput: RegisterInput = {
    userFirstName: '<script>bad()</script>John',
    userLastName: '<style>bad{}</style>Smith',
    userUsername: '<img src=x onerror=alert(1)>johnsmith',
    userEmail: 'john<script>@example.com',
    userPassword: 'StrongP@ssw0rd!',
    userRole: Role.CLIENT,
    agreedPolicy: 'true' as unknown as boolean,
    agreedCgvCgu: 'true' as unknown as boolean,
  };

  it('should sanitize all string specified fields, maintain password, ensure the role is client and booleans', () => {
    const result = sanitizeRegisterInput(dirtyInput);

    expect(result.userFirstName).toBe('John');
    expect(result.userLastName).toBe('Smith');
    expect(result.userUsername).toBe('johnsmith');
    expect(result.userEmail).toBe('john');
    expect(result.userPassword).toBe('StrongP@ssw0rd!');
    expect(result.userRole).toBe(Role.CLIENT);
    expect(result.agreedPolicy).toBe(true);
    expect(result.agreedCgvCgu).toBe(true);
  });

  it('should fallback to CLIENT role if role is invalid', () => {
    const input = { ...dirtyInput, userRole: 'ADMIN' as Role } as RegisterInput;
    const result = sanitizeRegisterInput(input);
    expect(result.userRole).toBe(Role.CLIENT);
  });
});

describe('sanitizeEmployeeInput', () => {
  const dirtyInput: RegisterInput = {
    userFirstName: '<script>bad()</script>John',
    userLastName: '<style>bad{}</style>Smith',
    userUsername: '<img src=x onerror=alert(1)>johnsmith',
    userEmail: 'john<script>@example.com',
    userPassword: 'StrongP@ssw0rd!',
    userRole: Role.EMPLOYEE,
    agreedPolicy: 'true' as unknown as boolean,
    agreedCgvCgu: 'true' as unknown as boolean,
  };

  it('should sanitize all string specified fields, maintain password, ensure the role is employee and booleans', () => {
    const result = sanitizeEmployeeInput(dirtyInput);

    expect(result.userFirstName).toBe('John');
    expect(result.userLastName).toBe('Smith');
    expect(result.userUsername).toBe('johnsmith');
    expect(result.userEmail).toBe('john');
    expect(result.userPassword).toBe('StrongP@ssw0rd!');
    expect(result.userRole).toBe(Role.EMPLOYEE);
    expect(result.agreedPolicy).toBe(true);
    expect(result.agreedCgvCgu).toBe(true);
  });

  it('should fallback to EMPLOYEE role if role is invalid', () => {
    const input = { ...dirtyInput, userRole: 'ADMIN' as Role } as RegisterInput;
    const result = sanitizeEmployeeInput(input);
    expect(result.userRole).toBe(Role.EMPLOYEE);
  });
});

describe('sanitizeLoginInput', () => {
  const dirtyInput: LoginUserInput = {
    userEmail: 'john<script>@example.com',
    userPassword: 'StrongP@ssw0rd!',
  };

  it('should sanitize email and keep password untouched', () => {
    const result = sanitizeLoginInput(dirtyInput);
    expect(result.userEmail).toBe('john');
    expect(result.userPassword).toBe('StrongP@ssw0rd!');
  });
});

describe('sanitizeFilmInput', () => {
  const dirtyInput: Partial<filmAttributes> = {
    filmTitle: '<b>Inception</b>',
    filmDescription: '<script>alert("x")</script>A mind-bending thriller.',
    filmImg: '<img src=x onerror=alert(1)>image.jpg',
    filmPublishingState: '<style>bad{}</style>active' as unknown as 'active' | 'inactive',
  };

  it('should sanitize all string fields in film input', () => {
    const result = sanitizeFilmInput(dirtyInput);
    expect(result.filmTitle).toBe('Inception');
    expect(result.filmDescription).toBe('A mind-bending thriller.');
    expect(result.filmImg).toBe('image.jpg');
    expect(result.filmPublishingState).toBe('active');
  });

  it('should handle partial inputs gracefully', () => {
    const partialInput = {
      filmTitle: '<i>The Matrix</i>',
      filmDescription:
        'A computer hacker learns the reality and his role in the war against its controllers.',
    };
    const result = sanitizeFilmInput(partialInput);
    expect(result.filmTitle).toBe('The Matrix');
    expect(result.filmDescription).toBe(
      'A computer hacker learns the reality and his role in the war against its controllers.',
    );
    expect(result.filmImg).toBeUndefined();
    expect(result.filmPublishingState).toBeUndefined();
  });
});
