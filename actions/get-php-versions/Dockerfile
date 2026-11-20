FROM composer:2.11.1@sha256:8de2184c6de224f4689e8f80ed5f5edaf0030b6b8b7839a22a2bcb6722ac87d0

COPY composer.json composer.lock /opt/php-versions/
RUN composer --working-dir=/opt/php-versions install --no-dev --no-interaction --no-plugins --no-scripts --prefer-dist --no-progress
COPY src/ /opt/php-versions/src/

USER 65534:65534

HEALTHCHECK --interval=5m --timeout=10s --retries=3 CMD ["php", "--version"]

ENTRYPOINT ["php", "/opt/php-versions/src/cli.php"]
CMD ["/project", "--latest"]
