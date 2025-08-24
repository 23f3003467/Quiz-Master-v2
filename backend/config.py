

class Config(object):
    DEBUG = False
    TESTING = False


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///mydatabase.sqlite3'


    #config for security
    SECRET_KEY = "thisis-cigratte"
    SECURITY_JOIN_USER_ROLES = True
    SECURITY_PASSWORD_SALT = "thisissaltt"
    SECURITY_PASSWORD_HASH = "bcrypt"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False
    # SECURITY_TOKEN_AUTHENTICATION_KEY = 'auth_token'

    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    SECURITY_TOKEN_AUTHENTICATION_ENABLED = True

    # Redis / Celery / Cache configs
    # CELERY_BROKER_URL = "redis://localhost:6379/1"
    # CELERY_RESULT_BACKEND = "redis://localhost:6379/2"
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_URL = "redis://localhost:6379/0"
    CACHE_DEFAULT_TIMEOUT = 200
    # REDIS_URL = "redis://localhost:6379"
    # broker_URL = "redis://localhost:6379/0"
    # result_backend = "redis://localhost:6379/0"
    # broker_connection_retry_on_startup = True



