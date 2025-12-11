-- create user watchio_user password 'applicationadministrator';
-- create database watchio owner = watchio_user;
-- grant all on watchio to watchio_user;
create table
	if not exists user_account (
		id varchar(100) unique not null,
		username varchar(255) not null,
		email varchar(255) unique not null,
		create_account date default (now ()) not null,
		constraint pk_user_account primary key (id)
	);

create table
	if not exists movie (
		id integer unique not null,
		title varchar(255) not null,
		original_title varchar(255) not null,
		original_language varchar(50) not null,
		poster_path text null,
		release_year integer null,
		tmdb_rating numeric(4, 3) null,
		constraint pk_movie primary key (id)
	);

create table
	if not exists interaction_type (
		id serial not null,
		interaction_type varchar(50) not null,
		constraint pk_interaction_type primary key (id)
	);

create table
	if not exists interaction (
		movie_id integer not null,
		user_id varchar(100) not null,
		type_id integer not null,
		constraint pk_interaction primary key (user_id, movie_id),
		constraint fk_interaction_user foreign key (user_id) references user_account (id),
		constraint fk_interaction_movie foreign key (movie_id) references movie (id),
		constraint fk_interaction_interaction_type foreign key (type_id) references interaction_type (id)
	);

create table
	if not exists genre (
		id integer not null,
		genre_name varchar(50) not null,
		constraint pk_genre primary key (id)
	);

create table
	if not exists movie_genre (
		movie_id integer not null,
		genre_id integer not null,
		constraint pk_movie_genre primary key (movie_id, genre_id),
		constraint fk_movie_genre_genre foreign key (genre_id) references genre (id),
		constraint fk_movie_genre_movie foreign key (movie_id) references movie (id)
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
	if not exists movie_cast (
		movie_id integer not null,
		artist_id integer not null,
		credit_id varchar(100) not null,
		character_name text not null,
		constraint pk_movie_cast primary key (movie_id, artist_id, credit_id),
		constraint fk_movie_cast_movie foreign key (movie_id) references movie (id),
		constraint fk_movie_cast_artist foreign key (artist_id) references artist (id)
	);

create table
	if not exists crew (
		movie_id integer not null,
		artist_id integer not null,
		credit_id varchar(100) not null,
		department varchar(100) not null,
		job varchar(100) not null,
		constraint pk_crew primary key (movie_id, artist_id, credit_id),
		constraint fk_crew_movie foreign key (movie_id) references movie (id),
		constraint fk_crew_artist foreign key (artist_id) references artist (id)
	);

create table
	if not exists keyword (
		id integer not null,
		keyword varchar(100) unique not null,
		constraint pk_keyword primary key (id)
	);

create table
	if not exists movie_keyword (
		movie_id integer not null,
		keyword_id integer not null,
		constraint pk_movie_keyword primary key (movie_id, keyword_id),
		constraint fk_movie_keyword_movie foreign key (movie_id) references movie (id),
		constraint fk_movie_keyword_keyword foreign key (keyword_id) references keyword (id)
	);

insert into
	interaction_type (interaction_type)
values
	('like'),
	('not interested'),
	('watchlist');


-- indexes:

-- index para ordenar filmes pela média de avaliação, tornando mais rápidas as consultas de filmes melhor avaliados
create index idx_movie_tmdb_rating on movie using btree (tmdb_rating);

-- index para id do gênero dos filmes, tornando mais rápidas as consultas de filmes por gênero
create index idx_movie_genre_genre_id on movie_genre using btree (genre_id);

-- índices para tornar mais rápida a pesquisa de filmes por título, organizando os títulos em ordem alfabética.
create index idx_movie_title on movie using btree (title);
create index idx_movie_original_title on movie using btree (original_title);

-- índices para agilizar os joins de cast e crew
create index idx_movie_cast_artist_id on movie_cast using btree (artist_id);
create index idx_crew_artist_id on crew using btree (artist_id);
create index idx_movie_keyword_keyword_id on movie_keyword using btree (keyword_id);
