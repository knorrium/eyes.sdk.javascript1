import { execSync } from "child_process";
import { relative, resolve } from "path";
import { XML_NAME, META_NAME } from "./download.js";

export function bongo({ dir, sdk, id, sandbox }) {
  const pathToInputFiles = relative(process.cwd(), dir);
  const options = { stdio: "inherit" };
  // @ts-ignore
  execSync(`npm install -g @applitools/bongo`, options);
  // @ts-ignore
  execSync(`ls`, options);
  // @ts-ignore
  execSync(`cat coverage-test-report.xml`, options);
  let command = `npx bongo report --verbose `;
  command += `--reportId ${id} `;
  command += `--resultPath ${resolve(pathToInputFiles, XML_NAME)} `;
  command += `--metaPath ${resolve(pathToInputFiles, META_NAME)} `;
  command += `--name ${sdk} `;
  if (sandbox) command += `--sandbox`;
  // @ts-ignore
  execSync(command, options);
}
