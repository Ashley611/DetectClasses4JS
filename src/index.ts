import cli from "./cli";
import {usingCore} from "./core"
import TemplateWork from "./core/main/TemplateWork";

//解析输入的参数和设置的cli.option
let args = cli.parse(process.argv);
const opts = cli.opts();

//usingCore(opts.input)
let templateWork = new TemplateWork();

templateWork.workflow(args.args);
//templateWork.workflow(["javascript","F:\\test\\call_test","null","call_test"]);