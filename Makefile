build: components index.js
	@component build --dev

components: component.json
	@component install --dev

test: build
	npm install .
	serve -p 9000 &
	node test/server.js &
	open http://localhost:9000/test/

clean:
	rm -fr build components template.js

.PHONY: clean test
