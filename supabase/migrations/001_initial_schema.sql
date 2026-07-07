-- Personal Trello MVP — initial schema with RLS

create table boards (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	title text not null,
	created_at timestamptz not null default now()
);

create table lists (
	id uuid primary key default gen_random_uuid(),
	board_id uuid not null references boards(id) on delete cascade,
	title text not null,
	position int not null default 0
);

create table cards (
	id uuid primary key default gen_random_uuid(),
	list_id uuid not null references lists(id) on delete cascade,
	title text not null,
	description text not null default '',
	position int not null default 0
);

create table checklist_items (
	id uuid primary key default gen_random_uuid(),
	card_id uuid not null references cards(id) on delete cascade,
	text text not null,
	completed boolean not null default false,
	position int not null default 0
);

create index boards_user_id_idx on boards(user_id);
create index lists_board_id_idx on lists(board_id);
create index cards_list_id_idx on cards(list_id);
create index checklist_items_card_id_idx on checklist_items(card_id);

alter table boards enable row level security;
alter table lists enable row level security;
alter table cards enable row level security;
alter table checklist_items enable row level security;

create or replace function is_board_owner(board_uuid uuid)
returns boolean
language sql
security definer
stable
as $$
	select exists (
		select 1
		from boards
		where id = board_uuid
			and user_id = auth.uid()
	);
$$;

create or replace function is_list_owner(list_uuid uuid)
returns boolean
language sql
security definer
stable
as $$
	select exists (
		select 1
		from lists l
		join boards b on b.id = l.board_id
		where l.id = list_uuid
			and b.user_id = auth.uid()
	);
$$;

create or replace function is_card_owner(card_uuid uuid)
returns boolean
language sql
security definer
stable
as $$
	select exists (
		select 1
		from cards c
		join lists l on l.id = c.list_id
		join boards b on b.id = l.board_id
		where c.id = card_uuid
			and b.user_id = auth.uid()
	);
$$;

create policy "Users can view own boards"
	on boards for select
	using (auth.uid() = user_id);

create policy "Users can insert own boards"
	on boards for insert
	with check (auth.uid() = user_id);

create policy "Users can update own boards"
	on boards for update
	using (auth.uid() = user_id);

create policy "Users can delete own boards"
	on boards for delete
	using (auth.uid() = user_id);

create policy "Users can view lists on own boards"
	on lists for select
	using (is_board_owner(board_id));

create policy "Users can insert lists on own boards"
	on lists for insert
	with check (is_board_owner(board_id));

create policy "Users can update lists on own boards"
	on lists for update
	using (is_board_owner(board_id));

create policy "Users can delete lists on own boards"
	on lists for delete
	using (is_board_owner(board_id));

create policy "Users can view cards on own boards"
	on cards for select
	using (is_list_owner(list_id));

create policy "Users can insert cards on own boards"
	on cards for insert
	with check (is_list_owner(list_id));

create policy "Users can update cards on own boards"
	on cards for update
	using (is_list_owner(list_id));

create policy "Users can delete cards on own boards"
	on cards for delete
	using (is_list_owner(list_id));

create policy "Users can view checklist items on own boards"
	on checklist_items for select
	using (is_card_owner(card_id));

create policy "Users can insert checklist items on own boards"
	on checklist_items for insert
	with check (is_card_owner(card_id));

create policy "Users can update checklist items on own boards"
	on checklist_items for update
	using (is_card_owner(card_id));

create policy "Users can delete checklist items on own boards"
	on checklist_items for delete
	using (is_card_owner(card_id));
