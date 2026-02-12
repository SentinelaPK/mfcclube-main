/**
 * Sanitiza erros do banco de dados para não expor detalhes internos ao usuário.
 * Mantém logs detalhados no console para debugging.
 */

interface PostgresError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

export const sanitizeDbError = (error: unknown): Error => {
  const pgError = error as PostgresError;
  
  // Log completo apenas no console (para debugging)
  console.error('[DB Error - Internal]:', error);
  
  // Mapear códigos de erro do Postgres para mensagens amigáveis
  if (pgError?.code) {
    switch (pgError.code) {
      case '23505': // unique_violation
        return new Error('Este registro já existe.');
      case '23503': // foreign_key_violation
        return new Error('Operação inválida: registro referenciado não existe.');
      case '23502': // not_null_violation
        return new Error('Campo obrigatório não preenchido.');
      case '23514': // check_violation
        return new Error('Dados inválidos. Verifique os valores informados.');
      case '42501': // insufficient_privilege
        return new Error('Você não tem permissão para esta operação.');
      case '42P01': // undefined_table
        return new Error('Erro de configuração. Contate o administrador.');
      case 'PGRST301': // JWT expired
        return new Error('Sessão expirada. Faça login novamente.');
      default:
        break;
    }
  }
  
  // Verificar mensagens de erro comuns relacionadas a RLS
  if (pgError?.message?.includes('RLS') || 
      pgError?.message?.includes('policy') ||
      pgError?.message?.includes('permission denied')) {
    return new Error('Você não tem permissão para esta operação.');
  }
  
  // Mensagem genérica para outros erros
  return new Error('Erro ao processar solicitação. Tente novamente.');
};

/**
 * Mensagens de erro específicas por operação
 */
export const getOperationErrorMessage = (operation: string): string => {
  const messages: Record<string, string> = {
    fetch: 'Erro ao carregar dados. Tente novamente.',
    add: 'Erro ao adicionar registro. Tente novamente.',
    update: 'Erro ao atualizar registro. Tente novamente.',
    delete: 'Erro ao remover registro. Tente novamente.',
  };
  return messages[operation] || 'Erro ao processar solicitação. Tente novamente.';
};
