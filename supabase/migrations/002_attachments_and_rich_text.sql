-- Phase 2–4: rich text content and card attachments

alter table cards
	add column if not exists content_json jsonb;

create table card_attachments (
	id uuid primary key default gen_random_uuid(),
	card_id uuid not null references cards(id) on delete cascade,
	file_name text not null,
	storage_path text not null,
	mime_type text not null,
	file_size bigint not null,
	kind text not null check (kind in ('image', 'document', 'audio', 'video', 'other')),
	position int not null default 0,
	created_at timestamptz not null default now()
);

create index card_attachments_card_id_idx on card_attachments(card_id);

alter table card_attachments enable row level security;

create policy "Users can view attachments on own boards"
	on card_attachments for select
	using (is_card_owner(card_id));

create policy "Users can insert attachments on own boards"
	on card_attachments for insert
	with check (is_card_owner(card_id));

create policy "Users can update attachments on own boards"
	on card_attachments for update
	using (is_card_owner(card_id));

create policy "Users can delete attachments on own boards"
	on card_attachments for delete
	using (is_card_owner(card_id));

insert into storage.buckets (id, name, public)
values ('card-attachments', 'card-attachments', false)
on conflict (id) do nothing;

create policy "Users can view own attachment files"
	on storage.objects for select
	using (
		bucket_id = 'card-attachments'
		and auth.uid()::text = (storage.foldername(name))[1]
	);

create policy "Users can upload own attachment files"
	on storage.objects for insert
	with check (
		bucket_id = 'card-attachments'
		and auth.uid()::text = (storage.foldername(name))[1]
	);

create policy "Users can update own attachment files"
	on storage.objects for update
	using (
		bucket_id = 'card-attachments'
		and auth.uid()::text = (storage.foldername(name))[1]
	);

create policy "Users can delete own attachment files"
	on storage.objects for delete
	using (
		bucket_id = 'card-attachments'
		and auth.uid()::text = (storage.foldername(name))[1]
	);
