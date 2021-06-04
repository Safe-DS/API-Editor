import PythonModule from "./PythonModule";
import PythonClass from "./PythonClass";
import PythonFunction from "./PythonFunction";
import PythonReturnType from "./PythonReturnType";
import PythonPackage from "./PythonPackage";
import PythonParameter from "./PythonParameter";

export default class PythonPackageBuilder {

    // @ts-ignore
    static make(packageJson) {

        let ms: PythonModule[] = [];
        // @ts-ignore
        packageJson.modules.forEach(m => {

            let cs: PythonClass[] = [];
            // @ts-ignore
            m.classes.forEach(c => {
                cs.push(new PythonClass(c.name, c.decorators, [], c.docstring || "", c.methods));
            });

            let fs: PythonFunction[] = [];
            // @ts-ignore
            m.functions.forEach(f => {

                let ps: PythonParameter[] = [];
                // @ts-ignore
                f.parameters.forEach(p => {
                    ps.push(new PythonParameter(p.name, p.type, p.hasDefault, p.defaultValue, p.limitation, p.ignored, p.docstring));
                });

                fs.push(new PythonFunction(f.name, f.decorators, ps, f.hasReturnType, new PythonReturnType(), f.docstring))
            });

            ms.push(new PythonModule(m.name, m.imports, cs, fs))
        });

        return new PythonPackage(packageJson.name, ms);
    }
}