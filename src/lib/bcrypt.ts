import bcrypt from 'bcryptjs';

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function comparePasswords(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}
