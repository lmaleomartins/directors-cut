-- Normalize genres.name to Title Case and trim spaces
update public.genres
set name = initcap(regexp_replace(trim(name), '\\s+', ' ', 'g'))
where name is not null;

-- Normalize movies.genre (comma-separated) to Title Case for each token
-- Split into array, trim and collapse spaces, apply initcap, then join back
update public.movies m
set genre = (
  select string_agg(initcap(regexp_replace(trim(g), '\\s+', ' ', 'g')), ', ')
  from unnest(regexp_split_to_array(coalesce(m.genre, ''), ',')) as g
);
