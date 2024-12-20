export function generateUsername(email: string): string {
    const [localPart] = email.split('@');
    const baseUsername = localPart.replace(/[^a-zA-Z0-9]/g, '');
    return `${baseUsername}${Math.random().toString(36).slice(2, 6)}`;
  }