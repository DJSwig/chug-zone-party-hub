export const generateJoinCode = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar chars
  const length = 5;
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return code;
};

export const validateJoinCode = (code: string): boolean => {
  return /^[A-Z0-9]{4,6}$/.test(code.toUpperCase());
};
