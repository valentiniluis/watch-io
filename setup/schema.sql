create user watchio_user password 'applicationadministrator';

create database watchio owner = watchio_user;

grant all on watchio to watchio_user;

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


-- create index
-- ;
