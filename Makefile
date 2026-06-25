
.PHONY: all prod prod-https back front i-back i-front i back-admin

# Switch container engine with `make ENGINE=podman ...`, or change the default here.
ENGINE ?= podman
COMPOSE := $(ENGINE)-compose

all:
	$(MAKE) back &
	$(MAKE) front &
	wait

prod:
	$(COMPOSE) up --build -d

back:
	$(COMPOSE) up postgres -d && cd back && npm run dev

front:
	cd front && npm run dev

i-back:
	cd back && npm install

i-front:
	cd front && npm install

i:
	$(MAKE) i-back
	$(MAKE) i-front

seed:
	$(COMPOSE) up postgres -d && cd back && npm run seed 500

clearcontainers:
	($(ENGINE) ps -aq | xargs -r $(ENGINE) rm -f) || exit 0
	($(ENGINE) images -aq | xargs -r $(ENGINE) rmi -f) || exit 0

clearports:
	(lsof -ti :8080 | xargs -r kill -9) || exit 0
	(lsof -ti :8000 | xargs -r kill -9) || exit 0
	(lsof -ti :8080 | xargs -r kill -9) || exit 0
	(lsof -ti :5173 | xargs -r kill -9) || exit 0

clearback:
	rm -rf back/venv

clearfront:
	rm -rf front/node_modules

fclear:
	$(MAKE) clearcontainers
	$(MAKE) clearports
	$(MAKE) clearback
	$(MAKE) clearfront
