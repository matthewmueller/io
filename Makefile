build: components index.js
	@component build --dev

components: component.json
	@component install --dev

test: build
	npm install .
	serve -p 9000 &
	node test/server.js &
	mocha test/

clean:
	rm -fr build components template.js

.PHONY: clean test
