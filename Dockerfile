FROM ghcr.io/hoverkraft-tech/docker-base-images/super-linter:2.0.1@sha256:7fbeb0e47711e939db09027b64d2b4f405dd271dad056fe42dc05ac15a6ddab0

HEALTHCHECK --interval=5m --timeout=10s --start-period=30s --retries=3 CMD ["/bin/sh","-c","test -d /github/home"]
ARG UID=1000
ARG GID=1000
USER ${UID}:${GID}

# The PHP integration workflow runs PHPStan and PHPUnit with the project's runtime.
# Super-Linter's PHP bootstrap installs every nested Composer project with its own PHP.
ENV VALIDATE_PHP_BUILTIN=false \
    VALIDATE_PHP_PHPCS=false \
    VALIDATE_PHP_PHPSTAN=false \
    VALIDATE_PHP_PSALM=false
