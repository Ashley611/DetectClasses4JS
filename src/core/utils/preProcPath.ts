import path from "path";
import {promises as fs} from "fs"

export const getAbsPathAndTest
  = async (iPath: string) => {
  iPath = path.normalize(iPath)
  if (!path.isAbsolute(iPath)) {
    //iPath = path.join(__dirname, iPath)
    iPath = path.join(__filename, iPath)
    // console.log(__filename)
    // console.log("-------------------")
  }
  try {
    const singleFile = await fs.readFile(iPath)
  } catch (e) {
    console.log(e.code)
  }
}
