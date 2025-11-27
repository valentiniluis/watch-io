-- create user watchio_user password 'applicationadministrator';

-- create database watchio owner = watchio_user;

-- grant all on watchio to watchio_user;

create table
	if not exists user_account (
		"id" varchar(100) unique not null,
		"name" varchar(255) not null,
		email varchar(255) unique,
		create_account date default (now ()) not null,
		constraint pk_user_account primary key ("id")
	);

create table
	if not exists movie (
		"id" int unique not null,
		title varchar(255) not null,
		poster_path text null,
		"year" int null,
		tmdb_rating numeric(2, 1) null,
		constraint pk_movie primary key ("id")
	);

create table
	if not exists interaction (
		movie_id int not null,
		user_id varchar(100) not null,
		"type" varchar(30) not null,
		constraint pk_interaction primary key (movie_id, user_id),
		constraint fk_user_interaction foreign key (user_id) references user_account ("id"),
		constraint fk_movie_interaction foreign key (movie_id) references movie ("id")
	);

create table
	if not exists genre (
		"id" integer primary key,
		"name" varchar(50) not null
	);

create table
	if not exists movie_genre (
		movie_id integer not null,
		genre_id integer not null,
		constraint pk_movie_genre primary key (movie_id, genre_id),
		constraint fk_movie_genre_genre foreign key (genre_id) references genre ("id"),
		constraint fk_movie_genre_movie foreign key (movie_id) references movie ("id")
	);

create table
	if not exists movie_rating (
		user_id varchar(100) not null,
		movie_id integer not null,
		score integer not null,
		headline varchar(255) not null,
		note varchar(511) null,
		created_at timestamptz not null default (now ()),
		last_update timestamptz not null default (now ()),
		constraint pk_movie_rating primary key (user_id, movie_id),
		constraint fk_movie_rating_user_account foreign key (user_id) references user_account (id),
		constraint fk_movie_rating_movie foreign key (movie_id) references movie (id)
	);

-- indexes:
-- index para ordenar filmes pela média de avaliação
-- torna mais rápidas as consultas de filmes melhor avaliados
create index idx_movie_tmdb_rating on public.movie using btree (tmdb_rating);

-- index para id do gênero dos filmes
-- torna mais rápidas as consultas de filmes por gênero
create index idx_movie_genre_genre_id on public.movie_genre using btree (genre_id);

-- index para id do usuário na tabela de interações
-- facilita a consulta de filmes interagidos por um usuário
create index idx_interaction_user_id on public.interaction using btree (user_id);