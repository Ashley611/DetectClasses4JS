import path from "path";
import fs from "fs/promises";
import {getAbsPathAndTest} from "./utils/preProcPath";

export const usingCore = (iPath: string) => {
  getAbsPathAndTest(iPath)
};
