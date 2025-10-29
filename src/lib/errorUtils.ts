/**
 * Maps internal error codes to user-friendly messages
 * Prevents exposure of database structure and internal details
 */
export const mapToUserError = (error: any): string => {
  const code = error.code || error.error_code;
  
  // Map common PostgreSQL and Supabase error codes to safe messages
  const errorMap: Record<string, string> = {
    '23505': 'Este item já existe.',
    '23503': 'Operação não permitida.',
    '23502': 'Informação obrigatória não foi fornecida.',
    'PGRST116': 'Acesso negado.',
    'PGRST301': 'Operação não autorizada.',
    '42501': 'Você não tem permissão para esta operação.',
    '42P01': 'Recurso não encontrado.',
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-email': 'Email inválido.',
    'auth/email-already-in-use': 'Este email já está em uso.',
    'auth/weak-password': 'A senha deve ter pelo menos 8 caracteres.',
    '22P02': 'Formato de dados inválido.'
  };
  
  // Check if error message contains specific patterns
  if (error.message?.includes('Limite máximo de 3 filmes')) {
    return 'Limite máximo de 3 filmes em destaque atingido. Desmarque outro filme primeiro.';
  }
  
  if (error.message?.includes('JWT')) {
    return 'Sessão expirada. Por favor, faça login novamente.';
  }
  
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }
  
  // Log full error for debugging (server-side only in production)
  console.error('[Internal Error]', {
    code,
    message: error.message,
    details: error
  });
  
  // Return mapped error or generic message
  return errorMap[code] || 'Ocorreu um erro. Tente novamente.';
};
