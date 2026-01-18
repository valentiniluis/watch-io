import requests
import time
import os
from dotenv import load_dotenv
import psycopg2
import math
load_dotenv()


BASE_URL = 'https://api.themoviedb.org/3'
HEADERS = {
  'Authorization': 'Bearer ' + os.getenv('TMDB_API_ACCESS_TOKEN'),
  'accept': 'application/json'
}
# API do TMDB limita 50 requisições por segundo
REQUEST_LIMIT = { 'PERIOD': 1, 'LIMIT': 50 }
MIN_VOTES = 300
MIN_VOTE_AVG = 5
MIN_POPULARITY = 0.5
SERIES = 'TV_SERIES'
MOVIES = 'MOVIE'
MEDIA_TYPES = [SERIES, MOVIES]


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
  filtered = [gen for gen in genres if gen['name'] == genre]
  return 0 if len(filtered) != 1 else filtered[0]['id']


def makeRequest(endpoint, page=None):
  url = endpoint
  hasQueryParam = url.find('?') != -1
  if page and hasQueryParam:
    url = f'{endpoint}&page={page}'
  elif page:
    url = f'{endpoint}?page={page}'
  response = requests.get(url, headers=HEADERS)
  data = response.json()
  return data


def getReleaseYear(data):
  release = data.get('release_date', None) or data.get('first_air_date', None)
  return int(release.split('-')[0]) if release and len(release) > 0 else 'N/A'


def sanitizeTvShow(data):
  # transform tv show data so that every field name is the same as the in the movie data objects
  data['title'] = data['name']
  del data['name']
  data['original_title'] = data['original_name']
  del data['original_name']
  data['keywords']['keywords'] = data['keywords']['results']
  del data['keywords']['results']
  data['release_date'] = data['first_air_date']
  del data['first_air_date']
  return data


def requestAndStoreMediaDetails(TMDbId, mediaType, cursor, conn):
  if mediaType not in MEDIA_TYPES:
    raise Exception('Invalid media type.')
  
  dynamicSegment = getURLSegment(mediaType)
  MEDIA_URL = f"https://api.themoviedb.org/3/{dynamicSegment}/{TMDbId}?append_to_response=credits,keywords"
  BASE_IMAGE_PATH = "https://image.tmdb.org/t/p/w500"

  try:
    mediaData = makeRequest(MEDIA_URL)
    if mediaType == SERIES:
      mediaData = sanitizeTvShow(mediaData)
    # insert essential movie/tv show information
    statement = """
      INSERT INTO 
      media 
      (tmdb_id, type_id, title, original_title, original_language, poster_path, release_year, tmdb_rating, seasons) 
      VALUES (%s, (SELECT id FROM media_type WHERE media_name = %s), %s, %s, %s, %s, %s, %s, %s)
      RETURNING id;
    """
    data = (
      mediaData['id'],
      mediaType,
      mediaData['title'],
      mediaData['original_title'],
      mediaData['original_language'],
      f'{BASE_IMAGE_PATH}{mediaData["poster_path"]}', 
      getReleaseYear(mediaData),
      mediaData['vote_average'],
      mediaData.get('number_of_seasons', None)
    )
    cursor.execute(statement, data)
    mediaId = cursor.fetchone()[0]

    # insert movie genres
    statement = """
      INSERT INTO 
      media_genre 
      (media_id, media_type_id, genre_id) 
      VALUES 
      (%s, (SELECT id FROM media_type WHERE media_name = %s), %s);
    """
    data = [(mediaId, mediaType, genre['id']) for genre in mediaData['genres']]
    cursor.executemany(statement, data)

    # include movie keywords to the database
    statement = "INSERT INTO keyword (id, keyword) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING;"
    data = [(keyword['id'], keyword['name']) for keyword in mediaData['keywords']['keywords']]
    cursor.executemany(statement, data)
    
    # associate keywords to the movie
    statement = "INSERT INTO media_keyword (media_id, keyword_id) VALUES (%s, %s);"
    data = [(mediaId, keyword['id']) for keyword in mediaData['keywords']['keywords']]
    cursor.executemany(statement, data)

    def filterArtist(person):
      return person['popularity'] > MIN_POPULARITY or person.get('job') == 'Director'
    
    cast = list(filter(filterArtist, mediaData['credits']['cast']))
    crew = list(filter(filterArtist, mediaData['credits']['crew']))
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
    statement = "INSERT INTO media_cast (media_id, artist_id, credit_id, character_name) VALUES (%s, %s, %s, %s);"
    data = [(mediaId, actor['id'], actor['credit_id'], actor.get('character', None)) for actor in cast]
    cursor.executemany(statement, data)

    # associate crew (director, writers, producers) to the movie
    statement = "INSERT INTO crew (media_id, artist_id, credit_id, department, job) VALUES (%s, %s, %s, %s, %s);"
    data = [(mediaId, member['id'], member['credit_id'], member['department'], member['job']) for member in crew]
    cursor.executemany(statement, data)

    conn.commit()
  except Exception as e:
    conn.rollback()
    print(f"Failed to store media of type '{mediaType}' of id {TMDbId}.")
    print(e)


def storeMedia(data, mediaType, cursor, connection):
  def filterMedia(media):
    return (
        getReleaseYear(media) != 'N/A' and 
        type(media['vote_average']) in [int, float] and 
        media['poster_path'] and 
        len(media['poster_path'])
      )

  allMedia = list(filter(filterMedia, data['results']))
  for media in allMedia:
    requestAndStoreMediaDetails(media['id'], mediaType, cursor, connection)


def storeGenres(data, cursor, connection):
  for mediaKey, genres in data.items():
    statement = """
      INSERT INTO genre(id, genre_name)
      VALUES (%s, %s)
      ON CONFLICT (id) DO NOTHING;
    """
    arguments = [(genre['id'], genre['name']) for genre in genres]
    cursor.executemany(statement, arguments)

    statement = """
      INSERT INTO
      media_type_genre(media_type_id, genre_id)
      VALUES ((SELECT id FROM media_type AS mt WHERE mt.media_name = %s), %s);
    """
    arguments = [(mediaKey, genre['id']) for genre in genres]
    cursor.executemany(statement, arguments)

    connection.commit()


def getURLSegment(mediaType):
  segments = { MOVIES: 'movie', SERIES: 'tv' }
  return segments.get(mediaType, None)


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
  connection = connectDB()
  cursor = connection.cursor()

  isInit = testIfInitialized(cursor)
  if (isInit):
    print("Database already initialized, exiting successfully...")
    cursor.close()
    connection.close()
    exit(0)

  try:
    genres = {}
    documentaryId = None
    for mediaType in MEDIA_TYPES:
      segment = getURLSegment(mediaType)
      GENRES_URL = f'{BASE_URL}/genre/{segment}/list'
      loadedGenres = makeRequest(GENRES_URL)['genres']
      if (mediaType == MOVIES):
        documentaryId = getGenreId('Documentary', loadedGenres)
      loadedGenres = list(filter(lambda x: x.get('name') != 'Documentary'), loadedGenres)
      genres[mediaType] = loadedGenres

    storeGenres(genres, cursor, connection)
    print(f'Stored genres successfully.')
  except Exception as err:
    print("Fatal error - exiting...")
    print('Failed to request and store genres.')
    print(err)
    exit(1)

  for mediaType in MEDIA_TYPES:
    segment = getURLSegment(mediaType)
    ENDPOINT = f'{BASE_URL}/discover/{segment}?sort_by=vote_average.desc&vote_average.gte={MIN_VOTE_AVG}&vote_count.gte={MIN_VOTES}&without_genres={documentaryId}'
    sample = makeRequest(ENDPOINT)
    pagesToRequest = min(500, sample['total_pages'])
    tenPercent = math.floor(pagesToRequest / 10)
    print(f'Ingesting media type "{mediaType}" - {pagesToRequest} API data pages to request...')

    requestCount = 0
    for i in range(pagesToRequest):
      try:
        page = i + 1
        data = makeRequest(ENDPOINT, page)
        storeMedia(data, mediaType, cursor, connection)
        requestCount += 1
        if (requestCount == REQUEST_LIMIT['LIMIT']):
          time.sleep(REQUEST_LIMIT['PERIOD'])
          requestCount = 0
        if page % tenPercent == 0:
          print(f"Progress: {page / pagesToRequest * 100:.2f}% of pages requested and stored. {pagesToRequest - page} page(s) left.")
      except Exception as error:
        print(f'Failed to fetch or store page #{page} of media type "{mediaType}". Error:')
        print(error)
  
  markAsInitialized(cursor, connection)
  cursor.close()
  connection.close()