import requests
import time
import os
from dotenv import load_dotenv
import psycopg2
import math
load_dotenv()


HEADERS = {
  'Authorization': 'Bearer ' + os.getenv('TMDB_API_ACCESS_TOKEN'),
  'accept': 'application/json'
}
# API do TMDB limita 50 requisições por segundo
REQUEST_LIMIT = { 'PERIOD': 1, 'LIMIT': 50 }
MIN_VOTES = 300
MIN_VOTE_AVG = 5
MIN_POPULARITY = 1


def connectDB(retries=3):
  err = None
  for _ in range(retries):
    try:
      connection = psycopg2.connect(
        host=os.getenv('PG_HOST'),
        database=os.getenv('PG_DB'),
        user=os.getenv('PG_USER'),
        password=os.getenv('PG_PW'),
        port=os.getenv('PG_PORT')
      )
      return connection
    except psycopg2.OperationalError as e:
      time.sleep(1)
      err = e
  
  print(err)
  print('Failed to connect to database, exiting...')
  exit(1)


def getGenreId(genre, genres):
  genresArray = genres['genres']
  filtered = [gen for gen in genresArray if gen['name'] == genre]
  return 0 if len(filtered) != 1 else filtered[0]['id']


def makeRequest(endpoint, page=None):
  url = endpoint
  if page:
    url = f'{endpoint}&page={page}'
  response = requests.get(url, headers=HEADERS)
  data = response.json()
  return data


def getReleaseYear(releaseDate):
  return int(releaseDate.split('-')[0]) if releaseDate and len(releaseDate) > 0 else 'N/A'


def requestAndStoreMovieDetails(movieId, cursor, conn):
  MOVIE_URL = f"https://api.themoviedb.org/3/movie/{movieId}?append_to_response=credits,keywords"
  BASE_IMAGE_PATH = "https://image.tmdb.org/t/p/w500"

  try:
    movieData = makeRequest(MOVIE_URL)
    # insert essential movie information
    statement = "INSERT INTO movie (id, title, original_title, original_language, poster_path, release_year, tmdb_rating) VALUES (%s, %s, %s, %s, %s, %s, %s);"
    data = (movieData['id'], 
            movieData['title'], 
            movieData['original_title'],
            movieData['original_language'],
            f'{BASE_IMAGE_PATH}{movieData["poster_path"]}', 
            getReleaseYear(movieData['release_date']), 
            movieData['vote_average'])
    cursor.execute(statement, data)

    # insert movie genres
    statement = "INSERT INTO movie_genre (movie_id, genre_id) VALUES (%s, %s);"
    data = [(movieId, genreId['id']) for genreId in movieData['genres']]
    cursor.executemany(statement, data)

    # include movie keywords to the database
    statement = "INSERT INTO keyword (id, keyword) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING;"
    data = [(keyword['id'], keyword['name']) for keyword in movieData['keywords']['keywords']]
    cursor.executemany(statement, data)
    
    # associate keywords to the movie
    statement = "INSERT INTO movie_keyword (movie_id, keyword_id) VALUES (%s, %s);"
    data = [(movieId, keyword['id']) for keyword in movieData['keywords']['keywords']]
    cursor.executemany(statement, data)

    def filterArtist(person):
      return person['popularity'] > MIN_POPULARITY
    
    cast = list(filter(filterArtist, movieData['credits']['cast']))
    crew = list(filter(filterArtist, movieData['credits']['crew']))
    artists = cast + crew

    # add artists (actors/movie-makers) to the database
    statement = "INSERT INTO artist (id, artist_name, original_name, known_for, popularity) VALUES (%s, %s, %s, %s, %s) ON CONFLICT (id) DO NOTHING;"
    data = [(artist['id'], 
             artist['name'], 
             artist['original_name'], 
             artist['known_for_department'], 
             artist['popularity']) for artist in artists]
    cursor.executemany(statement, data)

    # associate actors to movie
    statement = "INSERT INTO movie_cast (movie_id, artist_id, character_name) VALUES (%s, %s, %s);"
    data = [(movieId, actor['id'], actor['character']) for actor in cast]
    cursor.executemany(statement, data)

    # associate crew (director, writers, producers) to the movie
    statement = "INSERT INTO crew (movie_id, artist_id, credit_id, department, job) VALUES (%s, %s, %s, %s, %s);"
    data = [(movieId, member['id'], member['credit_id'], member['department'], member['job']) for member in crew]
    cursor.executemany(statement, data)

    conn.commit()
  except Exception as e:
    conn.rollback()
    print(f"Failed to store movie of id {movieId}")
    print(e)


def storeMovies(data, cursor, connection):
  def filterMovie(movie):
    return (movie['release_date'] and 
            len(movie['release_date']) and 
            type(movie['vote_average']) in [int, float] and 
            movie['poster_path'] and 
            len(movie['poster_path']))

  movies = list(filter(filterMovie, data['results']))
  for movie in movies:
    requestAndStoreMovieDetails(movie['id'], cursor, connection)


def storeGenres(data, cursor, connection):
  try:
    genres = data['genres']
    insert_query = """
    INSERT INTO genre(id, genre_name)
    VALUES (%s, %s);
    """
    data = [
      (genre['id'], genre['name'])
      for genre in genres
    ]
    cursor.executemany(insert_query, data)
    connection.commit()
  except Exception as e:
    print(e)
    connection.rollback()
    exit(1)


def testIfInitialized(cursor):
  query = """
    SELECT EXISTS (
      SELECT 1
      FROM pg_tables
      WHERE tablename = 'db_init'
    );
  """
  
  try:
    cursor.execute(query)
    result = cursor.fetchone()[0]
    return result
  except psycopg2.Error as e:
    print("Exiting - Failed to test if the database is initialized: " + e)
    exit(1)


def markAsInitialized(cursor, conn, retries=3):
  err = None
  success = False
  createStmt = """
    CREATE TABLE IF NOT EXISTS db_init (
      init_time TIMESTAMP NOT NULL DEFAULT NOW() PRIMARY KEY,
      initialized BOOLEAN NOT NULL DEFAULT TRUE
    );
  """
  insertStmt = 'INSERT INTO db_init DEFAULT VALUES;'

  for _ in range(retries):
    try:
      cursor.execute(createStmt)
      cursor.execute(insertStmt)
      conn.commit()
      success = True
    except psycopg2.OperationalError as e:
      err = e
      conn.rollback()
  
  if not success and error:
    print("Failed to mark database as initialized: " + err)


if __name__ == '__main__':
  BASE_URL = 'https://api.themoviedb.org/3'
  connection = connectDB()
  cursor = connection.cursor()

  isInit = testIfInitialized(cursor)

  if (isInit):
    print("Movies already in the local database. Exiting successfully.")
    exit(0)

  # genres = None
  # try:
  #   GENRES_URL = f'{BASE_URL}/genre/movie/list'
  #   genres = makeRequest(GENRES_URL)
  #   storeGenres(genres, cursor, connection)
  #   print('Stored movie genres successfully.')
  # except Exception as err:
  #   print("Fatal error - exiting...")
  #   print('Failed to request and store genres: ' + err)
  #   exit(1)

  # documentaryId = getGenreId('Documentary', genres)
  MOVIES_ENDPOINT = f'{BASE_URL}/discover/movie?sort_by=vote_average.desc&vote_average.gte={MIN_VOTE_AVG}&vote_count.gte={MIN_VOTES}&without_genres={99}'

  sample = makeRequest(MOVIES_ENDPOINT)
  pagesToRequest = min(500, sample['total_pages'])
  tenPercent = math.floor(pagesToRequest / 10)
  print(f'Requesting {pagesToRequest} API data pages...')

  requestCount = 0
  for i in range(pagesToRequest):
    try:
      page = i + 1
      data = makeRequest(MOVIES_ENDPOINT, page)
      storeMovies(data, cursor, connection)
      requestCount += 1
      if (requestCount == REQUEST_LIMIT['LIMIT']):
        time.sleep(REQUEST_LIMIT['PERIOD'])
        requestCount = 0
      if page % tenPercent == 0:
        print(f"Progress: {page / pagesToRequest * 100}% of pages requested and stored. {pagesToRequest - page} pages left.")
    except Exception as error:
      print(f"Failed to fetch or store page of movies #{page}: " + error)
  
  markAsInitialized(cursor, connection)
  cursor.close()
  connection.close()