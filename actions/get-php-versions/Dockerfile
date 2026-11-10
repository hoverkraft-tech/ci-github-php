FROM composer:2.11.0@sha256:278dfc7bd35169965d03f87194816f43bf4e6b6ea61707c2114e52ad12fe24ce

COPY composer.json composer.lock /opt/php-versions/
RUN composer --working-dir=/opt/php-versions install --no-dev --no-interaction --no-plugins --no-scripts --prefer-dist --no-progress
COPY src/ /opt/php-versions/src/

USER 65534:65534

HEALTHCHECK --interval=5m --timeout=10s --retries=3 CMD ["php", "--version"]

ENTRYPOINT ["php", "/opt/php-versions/src/cli.php"]
CMD ["/project", "--latest"]
