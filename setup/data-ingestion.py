import requests
import time
import json
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
PAGES_TO_REQUEST = 300


def getGenreId(genre, genres):
  genresArray = genres['genres']
  filtered = [gen for gen in genresArray if gen['name'] == genre]
  return 0 if len(filtered) != 1 else filtered[0]['id']


def readGenres(filename):
  with open(filename, 'r') as file:
    data = json.load(file)
  return data


def makeRequest(page):
  url = f'{ENDPOINT}&page={page}'
  response = requests.get(url, headers=HEADERS)
  data = response.json()
  return data


def getReleaseYear(releaseDate):
  return releaseDate.split('-')[0] if releaseDate and len(releaseDate) > 0 else 'N/A'


def storeData(data, cursor, connection):
  try:
    BASE_IMAGE_PATH = "https://image.tmdb.org/t/p/w500"
    movies = data['results']
    insert_query = """
    INSERT INTO watchio.movie(id, title, poster_path, year, tmdb_rating)
    VALUES (%s, %s, %s, %s, %s);
    """
    data = [
      (movie['id'], movie['title'], f'{BASE_IMAGE_PATH}{movie["poster_path"]}', getReleaseYear(movie['release_date']), movie['vote_average'])
      for movie in movies
    ]
    cursor.executemany(insert_query, data)
    connection.commit()
  except Exception as e:
    print(e)
    connection.rollback()
    exit()


if __name__ == '__main__':
  genres = readGenres('movie-genres.json')
  documentaryId = getGenreId('Documentary', genres)
  ENDPOINT = f'https://api.themoviedb.org/3/discover/movie?sort_by=vote_average.desc&vote_count.gte=500&without_genres={documentaryId}'

  try:
    connection = psycopg2.connect(
      host='localhost',
      database='postgres',
      user='postgres',
      password='postgres',
      port=5432
    )
    cursor = connection.cursor()

    requestCount = 0
    for i in range(PAGES_TO_REQUEST):
      page = i + 1
      data = makeRequest(page)
      storeData(data, cursor, connection)
      requestCount += 1
      if (requestCount == REQUEST_LIMIT['LIMIT']):
        time.sleep(REQUEST_LIMIT['PERIOD'])
        requestCount = 0

    cursor.close()
    connection.close()
  except Exception as error:
    print(error)
    print('Current request page:', page)