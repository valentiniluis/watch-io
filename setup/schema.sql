drop table if exists watchio.user;

drop table if exists watchio.movie;

drop table if exists watchio.interaction;

create table
	if not exists watchio.user (
		"id" varchar(100) unique not null,
		"name" varchar(255) not null,
		email varchar(255) unique,
		create_account date default (now ()) not null,
		constraint pk_user primary key ("id")
	);

create table
	if not exists watchio.movie (
		"id" int unique not null,
		title varchar(255) not null,
		poster_path text null,
		"year" int null,
		tmdb_rating numeric(2, 1) null,
		constraint pk_movie primary key ("id")
	);

create table
	if not exists watchio.interaction (
		movie_id int not null,
		user_id varchar(100) not null,
		"type" varchar(30) not null,
		constraint pk_interaction primary key (movie_id, user_id),
		constraint fk_user_interaction foreign key (user_id) references watchio.user ("id"),
		constraint fk_movie_interaction foreign key (movie_id) references watchio.movie ("id")
	);

-- QUERY MOVIES
select
	*
from
	watchio.movie;

-- QUERY USERS
select
	*
from
	watchio.user;

-- QUERY INTERACTIONS
select
	*
from
	watchio.interaction;