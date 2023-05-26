import * as convert from "xml-js";
import { create } from "@actions/artifact";
import fs from "fs";
import path from "path";
export const XML_NAME = "coverage-test-report.xml";
export const META_NAME = "coverage-tests-metadata.json";
export async function download({ artifactList }) {
  const resultXMLJSObject = {
    _declaration: {
      _attributes: {
        version: "1.0",
        encoding: "UTF-8",
      },
    },
    testsuites: {
      testsuite: [],
    },
  };
  const combinedMetaObject = {};
  for (const artifact of artifactList) {
    const client = create();
    const result = await client.downloadArtifact(artifact, "./");
    console.log(result);
    const content = fs.readFileSync(
      path.resolve(process.cwd(), XML_NAME),
      "utf-8"
    );
    const js = convert.xml2js(content, {
      ignoreComment: true,
      alwaysChildren: true,
      compact: true,
    });
    console.log("XML file js representation log:");
    console.log(js);
    // @ts-ignore
    resultXMLJSObject.testsuites.testsuite.push(js.testsuites.testsuite);
    const metaContent = fs.readFileSync(
      path.resolve(process.cwd(), META_NAME),
      "utf-8"
    );
    const metaData = JSON.parse(metaContent);
    for (const testName in metaData) {
      if (combinedMetaObject[testName]) {
        if (!metaData[testName].skipEmit) {
          combinedMetaObject[testName].skipEmit = false;
          if (!metaData[testName].skip)
            combinedMetaObject[testName].skip = false;
        }
      } else {
        combinedMetaObject[testName] = metaData[testName];
      }
    }
  }
  return {
    xml: convert.js2xml(resultXMLJSObject, {
      compact: true,
      spaces: 4,
    }),
    meta: JSON.stringify(combinedMetaObject, null, 2),
  };
}
