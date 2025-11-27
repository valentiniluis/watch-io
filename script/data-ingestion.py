import requests
import time
import os
from dotenv import load_dotenv
import psycopg2
load_dotenv()


HEADERS = {
  'Authorization': 'Bearer ' + os.getenv('TMDB_API_ACCESS_TOKEN'),
  'accept': 'application/json'
}
# API do TMDB limita 50 requisições por segundo
REQUEST_LIMIT = { 'PERIOD': 1, 'LIMIT': 50 }
MIN_VOTES = 300
MIN_VOTE_AVG = 4


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
  return releaseDate.split('-')[0] if releaseDate and len(releaseDate) > 0 else 'N/A'


def storeMovies(data, cursor, connection):
  def filterMovie(movie):
    return (movie['release_date'] and len(movie['release_date'])) and (type(movie['vote_average']) in [int, float]) and (movie['poster_path'] and len(movie['poster_path']))

  try:
    BASE_IMAGE_PATH = "https://image.tmdb.org/t/p/w500"
    movies = list(filter(filterMovie, data['results']))
    
    insert_query = """
    INSERT INTO movie(id, title, poster_path, year, tmdb_rating)
    VALUES (%s, %s, %s, %s, %s);
    """
    data = [
      (movie['id'], movie['title'], f'{BASE_IMAGE_PATH}{movie["poster_path"]}', getReleaseYear(movie['release_date']), movie['vote_average'])
      for movie in movies
    ]
    cursor.executemany(insert_query, data)
    connection.commit()

    insert_query = """
    INSERT INTO movie_genre(movie_id, genre_id)
    VALUES (%s, %s);
    """
    data = []
    for movie in movies:
      dbTuples = [(movie['id'], genreId) for genreId in movie['genre_ids']]
      data.extend(dbTuples)
    cursor.executemany(insert_query, data)
    connection.commit()

  except Exception as e:
    print(e)
    connection.rollback()
    exit()


def storeGenres(data, cursor, connection):
  try:
    genres = data['genres']
    insert_query = """
    INSERT INTO genre(id, name)
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
    exit()


if __name__ == '__main__':
  BASE_URL = 'https://api.themoviedb.org/3'

  try:
    connection = psycopg2.connect(
      host=os.getenv('PG_HOST'),
      database=os.getenv('PG_DB'),
      user=os.getenv('PG_USER'),
      password=os.getenv('PG_PW'),
      port=os.getenv('PG_PORT')
    )
    cursor = connection.cursor()

    GENRES_URL = f'{BASE_URL}/genre/movie/list'
    genres = makeRequest(GENRES_URL)
    storeGenres(genres, cursor, connection)
    print(f'Stored movie genres successfully.')

    documentaryId = getGenreId('Documentary', genres)
    MOVIES_ENDPOINT = f'{BASE_URL}/discover/movie?sort_by=vote_average.desc&vote_average.gte={MIN_VOTE_AVG}&vote_count.gte={MIN_VOTES}&without_genres={documentaryId}'

    sample = makeRequest(MOVIES_ENDPOINT)
    pagesToRequest = min(500, sample['total_pages'])
    print(f'Requesting {pagesToRequest} API data pages...')

    requestCount = 0
    for i in range(pagesToRequest):
      page = i + 1
      data = makeRequest(MOVIES_ENDPOINT, page)
      storeMovies(data, cursor, connection)
      requestCount += 1
      if (requestCount == REQUEST_LIMIT['LIMIT']):
        time.sleep(REQUEST_LIMIT['PERIOD'])
        requestCount = 0

    cursor.close()
    connection.close()
  except Exception as error:
    print(error)