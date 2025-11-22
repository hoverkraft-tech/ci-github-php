FROM php:8.2-cli-bookworm AS base

WORKDIR /usr/src/app

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

FROM base AS build

ARG APP_PATH=
COPY $APP_PATH/composer*.json /usr/src/app/

RUN --mount=type=cache,target=/root/.composer \
    set -eu; \
    composer install --no-dev --optimize-autoloader;

COPY $APP_PATH/ /usr/src/app/

FROM base AS ci

COPY --from=build /usr/src/app/ /usr/src/app/

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD php -v >/dev/null 2>&1 || exit 1

CMD [ "tail", "-f", "/dev/null" ]
