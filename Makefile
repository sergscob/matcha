.PHONY: all prod prod-https back front i-back i-front i back-admin


ENGINE ?= podman
COMPOSE := $(ENGINE)-compose

all:
	$(MAKE) i-back
	$(MAKE) i-front
	$(COMPOSE) up postgres -d
	@sleep 5
	(cd back && npm run migrate && npm run seed:if-empty && npm run dev) & (cd front && npm run dev)
	wait

prod:
	$(COMPOSE) up --build -d

back:
	$(COMPOSmake E) up postgres -d && cd back && npm run dev

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
	(lsof -ti :3000 | xargs -r kill -9) || exit 0
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

	rm -rf back/uploads
	($(ENGINE) volume rm matcha_postgres_data) || exit 0
	($(ENGINE) volume rm matcha_uploads_data) || exit 0
	@echo "Cleaned"
