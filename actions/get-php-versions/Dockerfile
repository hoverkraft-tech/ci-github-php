FROM node:24-bookworm-slim@sha256:01d566e8d94d8c619591d78652babfccd3c6992a3dffa9ed5ab39e11cf6c70e9

COPY dist/ /opt/php-versions/dist/

USER 1000:1000

HEALTHCHECK --interval=5m --timeout=10s --retries=3 CMD ["node", "--version"]

ENTRYPOINT ["node", "/opt/php-versions/dist/index.js"]
CMD ["/project", "--latest"]
