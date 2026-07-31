-- User profiles for cross-device account data

create table public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	email text,
	full_name text,
	avatar_url text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles(email);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
	on public.profiles for select
	using (auth.uid() = id);

create policy "Users can update own profile"
	on public.profiles for update
	using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	insert into public.profiles (id, email, full_name, avatar_url)
	values (
		new.id,
		new.email,
		coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
		coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
	);
	return new;
end;
$$;

create trigger on_auth_user_created
	after insert on auth.users
	for each row execute function public.handle_new_user();

create or replace function public.handle_profile_updated()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

create trigger on_profile_updated
	before update on public.profiles
	for each row execute function public.handle_profile_updated();
