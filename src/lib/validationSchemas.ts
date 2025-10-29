import { z } from 'zod';

/**
 * Validation schemas for user inputs
 * Prevents injection attacks and ensures data integrity
 */

export const authSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: 'Email inválido' })
    .max(255, { message: 'Email muito longo' }),
  password: z.string()
    .min(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
    .max(72, { message: 'A senha deve ter no máximo 72 caracteres' }),
  firstName: z.string()
    .trim()
    .min(1, { message: 'Nome não pode estar vazio' })
    .max(50, { message: 'Nome muito longo' })
    .optional(),
  lastName: z.string()
    .trim()
    .min(1, { message: 'Sobrenome não pode estar vazio' })
    .max(50, { message: 'Sobrenome muito longo' })
    .optional()
});

export const movieSchema = z.object({
  title: z.string()
    .trim()
    .min(1, { message: 'Título não pode estar vazio' })
    .max(200, { message: 'Título muito longo (máximo 200 caracteres)' }),
  director: z.string()
    .trim()
    .min(1, { message: 'Nome do diretor não pode estar vazio' })
    .max(100, { message: 'Nome do diretor muito longo (máximo 100 caracteres)' }),
  year: z.number()
    .int({ message: 'Ano deve ser um número inteiro' })
    .min(1895, { message: 'Ano deve ser 1895 ou posterior' })
    .max(new Date().getFullYear() + 2, { message: 'Ano não pode ser tão distante no futuro' }),
  duration: z.string()
    .trim()
    .min(1, { message: 'Duração não pode estar vazia' }),
  genre: z.array(z.string())
    .min(1, { message: 'Selecione pelo menos um gênero' })
    .max(10, { message: 'Máximo de 10 gêneros permitidos' }),
  synopsis: z.string()
    .max(2000, { message: 'Sinopse muito longa (máximo 2000 caracteres)' })
    .optional(),
  thumbnail: z.string()
    .url({ message: 'URL da thumbnail inválida' })
    .optional()
    .or(z.literal('')),
  video_url: z.string()
    .url({ message: 'URL do vídeo inválida' })
    .optional()
    .or(z.literal(''))
});

export const profileSchema = z.object({
  firstName: z.string()
    .trim()
    .min(1, { message: 'Nome não pode estar vazio' })
    .max(50, { message: 'Nome muito longo' }),
  lastName: z.string()
    .trim()
    .min(1, { message: 'Sobrenome não pode estar vazio' })
    .max(50, { message: 'Sobrenome muito longo' }),
  bio: z.string()
    .max(500, { message: 'Biografia muito longa (máximo 500 caracteres)' })
    .optional()
});
