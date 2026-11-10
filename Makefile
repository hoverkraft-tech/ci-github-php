.PHONY: help setup deps-install deps-update deps-update-interactive deps-audit test ci lint lint-fix

COMPOSER_DIRECTORIES := $(patsubst %/composer.json,%,$(shell git ls-files '**/composer.json'))

help: ## Display help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

setup: deps-install ## Set up development dependencies

deps-install: ## Install action and fixture dependencies without hooks or plugins
	@set -e; for directory in $(COMPOSER_DIRECTORIES); do \
		composer --working-dir="$$directory" --no-interaction --no-plugins install --no-scripts --prefer-dist; \
	done

deps-update: ## Update action and fixture dependencies and lockfiles
	@set -e; for directory in $(COMPOSER_DIRECTORIES); do \
		composer --working-dir="$$directory" --no-interaction --no-plugins update --no-scripts --prefer-dist; \
	done

deps-update-interactive: ## Interactively select fixture dependency updates
	@set -e; for directory in $(COMPOSER_DIRECTORIES); do \
		composer --working-dir="$$directory" --no-plugins update --no-scripts --interactive; \
	done

deps-audit: ## Audit action and fixture dependencies
	@set -e; for directory in $(COMPOSER_DIRECTORIES); do \
		composer --working-dir="$$directory" --no-interaction --no-plugins audit; \
	done

test: ## Run fixture lint and Composer project tests
	composer --working-dir=tests/php-project lint:ci
	@set -e; for directory in $(COMPOSER_DIRECTORIES); do \
		if php -r 'exit(isset(json_decode(file_get_contents($$argv[1]), true)["scripts"]["test"]) ? 0 : 1);' "$$directory/composer.json"; then \
			composer --working-dir="$$directory" test; \
		fi; \
	done

ci: ## Install, audit, test and lint without rewriting source files
	$(MAKE) deps-install
	$(MAKE) deps-audit
	$(MAKE) test
	$(MAKE) lint

lint: ## Execute linting
	$(call run_linter,)

lint-fix: ## Execute linting and fix
	$(call run_linter, \
		-e FIX_JSON_PRETTIER=true \
		-e FIX_JAVASCRIPT_PRETTIER=true \
		-e FIX_YAML_PRETTIER=true \
		-e FIX_MARKDOWN=true \
		-e FIX_MARKDOWN_PRETTIER=true \
		-e FIX_NATURAL_LANGUAGE=true)

define run_linter
	DEFAULT_WORKSPACE="$(CURDIR)"; \
	LINTER_IMAGE="linter:latest"; \
	VOLUME="$$DEFAULT_WORKSPACE:$$DEFAULT_WORKSPACE"; \
	DEFAULT_BRANCH="$$(git -C "$$DEFAULT_WORKSPACE" rev-parse --abbrev-ref HEAD 2>/dev/null)"; \
	docker build --platform=linux/amd64 --build-arg UID=$(shell id -u) --build-arg GID=$(shell id -g) --tag $$LINTER_IMAGE .; \
	docker run \
		--platform=linux/amd64 \
		-e DEFAULT_WORKSPACE="$$DEFAULT_WORKSPACE" \
		-e DEFAULT_BRANCH="$$DEFAULT_BRANCH" \
		-e USE_FIND_ALGORITHM=false \
		-e FILTER_REGEX_INCLUDE="$(filter-out $@,$(MAKECMDGOALS))" \
		-e IGNORE_GITIGNORED_FILES=true \
		$(1) \
		-v $$VOLUME \
		--rm \
		$$LINTER_IMAGE
endef

#############################
# Argument fix workaround
#############################
%:
	@: