import { getMultilineInput, getInput, getBooleanInput } from "@actions/core";
import { bongo } from "./src/bongo.js";
import { download, META_NAME, XML_NAME } from "./src/download.js";
import fs from "fs";
import path from "path";

main();

async function main() {
  const artifactList = getMultilineInput("artifact").flatMap((artifact) =>
    artifact.split(",")
  );
  console.log(artifactList);
  const { xml, meta } = await download({
    artifactList,
  });
  const dir = process.cwd();
  fs.writeFileSync(path.resolve(dir, XML_NAME), xml);
  fs.writeFileSync(path.resolve(dir, META_NAME), meta);
  const sdk = getInput("sdk_name");
  const id = getInput("report_id");
  const sandbox = getBooleanInput("sandbox");
  bongo({ dir, sdk, id, sandbox });
}
