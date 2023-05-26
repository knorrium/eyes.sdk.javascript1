import { execSync } from "child_process";
import { relative } from "path";

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
  if (pathToInputFiles) {
    command += `--resultPath ${pathToInputFiles} `;
    command += `--metaPath ${pathToInputFiles} `;
  }
  command += `--name ${sdk} `;
  if (sandbox) command += `--sandbox`;
  // @ts-ignore
  execSync(command, options);
}
