// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as path from "path";
import { usageDataObject, ESLintExitCode, PrettierExitCode } from "./defaults";

const esLintPath = require.resolve("eslint");
const prettierPath = require.resolve("prettier");
const esLintDir = path.parse(esLintPath).dir;
const esLintFilePath = path.resolve(esLintDir, "../bin/eslint.js");
const prettierFilePath = path.resolve(prettierPath, "../bin-prettier.js");
const esLintConfigPath = path.resolve(__dirname, "../config/.eslintrc.json");

function execCommand(command: string) {
  const execSync = require("child_process").execSync;
  const child = execSync(command, { stdio: "inherit" });
}

function normalizeFilePath(filePath: string) : string {
  return filePath.replace(/ /g, '\\ '); // Converting space to '\\'
}

function getEsLintBaseCommand(): string {
  const eslintBaseCommand: string = `node ${esLintFilePath} -c ${esLintConfigPath} --resolve-plugins-relative-to ${__dirname}`;
  return eslintBaseCommand;
}

export function getLintCheckCommand(files: string): string {
  const eslintCommand: string = `${getEsLintBaseCommand()} ${normalizeFilePath(files)}`;
  return eslintCommand;
}

export function performLintCheck(files: string) {
  try {
    const command = getLintCheckCommand(files);
    execCommand(command);
    usageDataObject.sendUsageDataSuccessEvent("performLintCheck", { exitCode: ESLintExitCode.NoLintErrors });
  } catch (err) {
    if (err.status && err.status == ESLintExitCode.HasLintError) {
      usageDataObject.sendUsageDataSuccessEvent("performLintCheck", { exitCode: ESLintExitCode.HasLintError });
    } else {
      usageDataObject.sendUsageDataException("performLintCheck", err);
    }
    throw err;
  }
}

export function getLintFixCommand(files: string): string {
  const eslintCommand: string = `${getEsLintBaseCommand()} --fix ${normalizeFilePath(files)}`;
  return eslintCommand;
}

export function performLintFix(files: string) {
  try {
    const command = getLintFixCommand(files);
    execCommand(command);
    usageDataObject.sendUsageDataSuccessEvent("performLintFix", { exitCode: ESLintExitCode.NoLintErrors });
  } catch (err) {
    if (err.status && err.status == ESLintExitCode.HasLintError) {
      usageDataObject.sendUsageDataSuccessEvent("performLintFix", { exitCode: ESLintExitCode.HasLintError });
    } else {
      usageDataObject.sendUsageDataException("performLintFix", err);
    }
    throw err;
  }
}

export function getPrettierCommand(files: string): string {
  const prettierFixCommand: string = `node ${prettierFilePath} --parser typescript --write ${normalizeFilePath(files)}`;
  return prettierFixCommand;
}

export function makeFilesPrettier(files: string) {
  try {
    const command = getPrettierCommand(files);
    execCommand(command);
    usageDataObject.sendUsageDataSuccessEvent("makeFilesPrettier", { exitCode: PrettierExitCode.NoFormattingProblems });
  } catch (err) {
    if (err.status && err.status == PrettierExitCode.HasFormattingProblem) {
      usageDataObject.sendUsageDataSuccessEvent("makeFilesPrettier", {
        exitCode: PrettierExitCode.HasFormattingProblem
      });
    } else {
      usageDataObject.sendUsageDataException("makeFilesPrettier", err);
    }
    throw err;
  }
}
