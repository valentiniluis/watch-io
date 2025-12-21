-- create user watchio_user password 'applicationadministrator';
-- create database watchio owner = watchio_user;
-- grant all on watchio to watchio_user;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

create table
	if not exists user_account (
		id varchar(100) unique not null,
		username varchar(255) not null,
		email varchar(255) unique not null,
		create_account date default (now ()) not null,
		constraint pk_user_account primary key (id)
	);

create table
	if not exists media_type (
		id serial not null,
		media_name varchar(20) not null,
		constraint pk_media_type primary key (id)
	);

-- media table stores both series and movies
create table
	if not exists media (
		id serial not null,
		tmdb_id integer not null,
		type_id integer not null,
		title varchar(255) not null,
		original_title varchar(255) not null,
		original_language varchar(50) not null,
		poster_path text null,
		release_year integer null,
		tmdb_rating numeric(4, 3) null,
		seasons integer null,
		constraint pk_movie primary key (id),
		constraint media_unique_tmdb_id_type_id unique (tmdb_id, type_id),
		constraint fk_media_media_type foreign key (type_id) references media_type (id)
	);

create table
	if not exists interaction_type (
		id serial not null,
		interaction_type varchar(50) not null,
		constraint pk_interaction_type primary key (id)
	);

create table
	if not exists interaction (
		media_id integer not null,
		user_id varchar(100) not null,
		inter_type_id integer not null,
		constraint pk_interaction primary key (user_id, media_id),
		constraint fk_interaction_user foreign key (user_id) references user_account (id),
		constraint fk_interaction_media foreign key (media_id) references media (id),
		constraint fk_interaction_interaction_type foreign key (inter_type_id) references interaction_type (id)
	);

-- genres regardless of media type
create table
	if not exists genre (
		id integer not null,
		genre_name varchar(50) not null,
		constraint pk_genre primary key (id)
	);

-- associate movie and tv show to its different sets of genres
create table
	if not exists media_type_genre (
		media_type_id integer not null,
		genre_id integer not null,
    constraint pk_media_type_genre primary key (media_type_id, genre_id),
		constraint fk_media_type_genre_genre foreign key (genre_id) references genre (id),
		constraint fk_media_type_genre_media_type foreign key (media_type_id) references media_type (id)
	);

-- actual genres of particular movies/shows
create table
	if not exists media_genre (
		media_id integer not null,
		media_type_id integer not null,
		genre_id integer not null,
		constraint pk_media_genre primary key (media_id, genre_id),
		constraint fk_media_genre_media_type_genre foreign key (media_type_id, genre_id) references media_type_genre (media_type_id, genre_id),
		constraint fk_media_genre_media foreign key (media_id) references media (id)
	);

create table
	if not exists rating (
		user_id varchar(100) not null,
		media_id integer not null,
		score integer not null,
		headline varchar(255) not null,
		note varchar(511) null,
		created_at timestamptz not null default (now ()),
		last_update timestamptz not null default (now ()),
		constraint pk_media_rating primary key (user_id, media_id),
		constraint fk_media_rating_user_account foreign key (user_id) references user_account (id),
		constraint fk_media_rating_media foreign key (media_id) references media (id)
	);

create table
	if not exists artist (
		id integer not null,
		artist_name varchar(100) not null,
		original_name varchar(100) not null,
		known_for varchar(100) not null,
		popularity numeric(5, 2) not null,
		constraint pk_artist primary key (id)
	);

create table
	if not exists media_cast (
		media_id integer not null,
		cast_type varchar(40) null,
		artist_id integer not null,
		credit_id varchar(100) not null,
		character_name text null,
		constraint pk_media_cast primary key (media_id, artist_id, credit_id),
		constraint fk_media_cast_media foreign key (media_id) references media (id),
		constraint fk_media_cast_artist foreign key (artist_id) references artist (id)
	);

create table
	if not exists crew (
		media_id integer not null,
		artist_id integer not null,
		credit_id varchar(100) not null,
		department varchar(100) not null,
		job varchar(100) not null,
		constraint pk_crew primary key (media_id, artist_id, credit_id),
		constraint fk_crew_media foreign key (media_id) references media (id),
		constraint fk_crew_artist foreign key (artist_id) references artist (id)
	);

create table
	if not exists keyword (
		id integer not null,
		keyword varchar(100) unique not null,
		constraint pk_keyword primary key (id)
	);

create table
	if not exists media_keyword (
		media_id integer not null,
		keyword_id integer not null,
		constraint pk_media_keyword primary key (media_id, keyword_id),
		constraint fk_media_keyword_media foreign key (media_id) references media (id),
		constraint fk_media_keyword_keyword foreign key (keyword_id) references keyword (id)
	);

insert into
	media_type (media_name)
values
	('TV_SERIES'),
	('MOVIE');

insert into
	interaction_type (interaction_type)
values
	('LIKE'),
	('NOT_INTERESTED'),
	('WATCHLIST');

-- indexes:
-- index para ordenar séries e filmes pela média de avaliação, tornando mais rápidas as consultas de melhor avaliados
create index idx_media_tmdb_rating on media using btree (type_id, tmdb_rating);

create index idx_media_tmdb_id on media using btree (type_id, tmdb_id);

-- índices para tornar mais rápida a pesquisa de filmes por título, organizando os títulos em ordem alfabética.

-- create index idx_media_title on media using btree (title);

CREATE INDEX idx_media_title_trgm ON media USING GIN (title gin_trgm_ops);

CREATE INDEX idx_media_original_title_trgm ON media USING GIN (original_title gin_trgm_ops);

-- index para id do gênero dos filmes, tornando mais rápidas as consultas de filmes por gênero
create index idx_media_genre_genre_id on media_genre using btree (genre_id);

-- índices para agilizar os joins de cast e crew
create index idx_media_cast_artist_id on media_cast using btree (artist_id);

create index idx_crew_artist_id on crew using btree (artist_id);

create index idx_media_keyword_keyword_id on media_keyword using btree (keyword_id);