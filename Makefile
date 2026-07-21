## Makefile - helper targets for development and deployment

install:
	npm ci

build:
	npm run build

preview:
	npm run preview

clean:
	@echo "Removing node_modules and build output (local)"
	-rm -rf node_modules .output

deploy-ghpages:
	@echo "Local deploy to gh-pages (manual steps shown, run at your own risk):"
	@echo "1) npm run build"
	@echo "2) git checkout --orphan gh-pages"
	@echo "3) rm -rf * && cp -r .output/public/* ."
	@echo "4) git add . && git commit -m 'deploy' && git push origin gh-pages"
	@echo "Tip: GitHub Actions already handles deployment automatically." 

.PHONY: install build preview clean deploy-ghpages
