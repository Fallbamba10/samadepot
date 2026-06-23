-- Trigger pour maintenir universities.used_storage_mb à jour
-- S'exécute après chaque INSERT ou DELETE sur submissions

create or replace function update_university_storage()
returns trigger
language plpgsql
security definer
as $$
begin
  if (TG_OP = 'INSERT') then
    update universities
    set used_storage_mb = used_storage_mb + coalesce(NEW.file_size_mb, 0)
    where id = NEW.university_id;

  elsif (TG_OP = 'DELETE') then
    update universities
    set used_storage_mb = greatest(0, used_storage_mb - coalesce(OLD.file_size_mb, 0))
    where id = OLD.university_id;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_submission_storage on submissions;

create trigger trg_submission_storage
after insert or delete on submissions
for each row execute function update_university_storage();
