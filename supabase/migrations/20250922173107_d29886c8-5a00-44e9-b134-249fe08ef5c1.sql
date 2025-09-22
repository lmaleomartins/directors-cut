-- Função para validar limite de filmes em destaque
CREATE OR REPLACE FUNCTION public.validate_featured_movies_limit()
RETURNS TRIGGER AS $$
DECLARE
  featured_count INTEGER;
BEGIN
  -- Se o filme não está sendo marcado como destaque, permitir
  IF NEW.featured = FALSE THEN
    RETURN NEW;
  END IF;
  
  -- Contar quantos filmes já estão em destaque (excluindo o atual se for update)
  IF TG_OP = 'UPDATE' THEN
    SELECT COUNT(*) INTO featured_count 
    FROM public.movies 
    WHERE featured = true AND id != NEW.id;
  ELSE
    SELECT COUNT(*) INTO featured_count 
    FROM public.movies 
    WHERE featured = true;
  END IF;
  
  -- Se já temos 3 filmes em destaque, não permitir adicionar mais
  IF featured_count >= 3 THEN
    RAISE EXCEPTION 'Limite máximo de 3 filmes em destaque atingido. Desmarque outro filme primeiro.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para INSERT
CREATE TRIGGER trigger_validate_featured_movies_insert
    BEFORE INSERT ON public.movies
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_featured_movies_limit();

-- Criar trigger para UPDATE
CREATE TRIGGER trigger_validate_featured_movies_update
    BEFORE UPDATE ON public.movies
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_featured_movies_limit();