import * as assert from "assert";
import { createParser } from "../vueAstParser";

describe("", () => {
  it("", () => {
    const vue = `
			<template>
			<img src="test" />
			</template>
		`;
    const parser = createParser(vue);
    const nodes = parser.findImgElementInTemplate();
    assert.equal(nodes.length, 1);
  });

  it("", () => {
    const vue = `
			<template>
			<img src="test" width="100" />
			</template>
		`;
    const parser = createParser(vue);
    const nodes = parser.findImgElementInTemplate();
    assert.equal(nodes.length, 1);
  });
  it("", () => {
    const vue = `
			<template>
			<img src="test" width="100" height="100" />
			</template>
		`;
    const parser = createParser(vue);
    const nodes = parser.findImgElementInTemplate();
    assert.equal(nodes.length, 0);
  });

  it("", () => {
    const vue = `
			<img src="test" width="100"  />
		`;
    const parser = createParser(vue);
    const nodes = parser.findImgElementInTemplate();
    assert.equal(nodes.length, 0);
  });

  it("", () => {
    const vue = `
	<template>
	<div><img src="test" width="100" /></div>
	</template>
`;
    const parser = createParser(vue);
    const nodes = parser.findImgElementInTemplate();
    assert.equal(nodes.length, 1);
  });

  it("", () => {
    const vue = `
	<template>
	<div v-for="a in [1,2]"><img src="test" width="100" :key="a" /></div>
	</template>
`;
    const parser = createParser(vue);
    const nodes = parser.findImgElementInTemplate();
    assert.equal(nodes.length, 1);
  });

  it("", () => {
    const vue = `
	<template>
	<div v-for="a in [1,2]"><img src="test" height="100" :key="a" /><img src="test" width="100" :key="a" /></div>
	</template>
`;
    const parser = createParser(vue);
    const nodes = parser.findImgElementInTemplate();
    assert.equal(nodes.length, 2);
  });

  it("", () => {
    const vue = `
	<template>
	<div v-for="a in [1,2]"><img src="test" :height="aa" :width="100" :key="a" /></div>
	</template>
`;
    const parser = createParser(vue);
    const nodes = parser.findImgElementInTemplate();
    assert.equal(nodes.length, 0);
  });

  it("", () => {
    const vue = `
	<template>
	<Component><img src="test"  :width="100" a  /></Component>
	</template>
`;
    const parser = createParser(vue);
    const nodes = parser.findImgElementInTemplate();
    assert.equal(nodes.length, 1);
  });

  it("", () => {
    const vue = `
	<template>
	<Component><template><img src="test"  :width="100"  /></template></Component>
	</template>
`;
    const parser = createParser(vue);
    const nodes = parser.findImgElementInTemplate();
    assert.equal(nodes.length, 1);
  });

  it("", () => {
    const vue = `
	<template>
	<img 
  src="test" 
  :width="100"

    />
	</template>
`;
    const parser = createParser(vue);
    const nodes = parser.findImgElementInTemplate();
    assert.equal(nodes.length, 1);
  });
  it("", () => {
    const vue = `
	<template>
	<img 
  src="test" 
  width = "100"
    height = "100"
    />
	</template>
`;
    const parser = createParser(vue);
    const nodes = parser.findImgElementInTemplate();
    assert.equal(nodes.length, 0);
  });
});
