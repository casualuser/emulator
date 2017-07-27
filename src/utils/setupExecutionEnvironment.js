import path from 'path';
import childProcess from 'child_process';
import validateRuntime from './validateRuntime';
import getRuntimeScriptName from './getRuntimeScriptName';
import getRuntimeExecName from './getRuntimeExecName';
import getFunctionCodeDirectoryPath from './getFunctionCodeDirectoryPath';
import runMiddlewares from './runMiddlewares';

const runtimesDir = path.join(__dirname, '..', 'runtimes');

async function setupExecutionEnvironment(serviceName, functionName, functionConfig) {
  const runtime = functionConfig.runtime;
  validateRuntime(runtime);

  const script = getRuntimeScriptName(runtime);
  const exec = getRuntimeExecName(runtime);

  const pathToScript = path.join(runtimesDir, script);
  const pathToFunctionCode = getFunctionCodeDirectoryPath(serviceName, functionName);

  const preLoadPayload = { serviceName, functionName, functionConfig };
  const preLoadResult = await runMiddlewares('preLoad', preLoadPayload);

  const childProc = childProcess.spawn(exec, [
    `${pathToScript}`,
    '--functionFilePath', path.join(pathToFunctionCode, preLoadResult.functionFileName),
    '--functionName', preLoadResult.functionName,
  ]);

  // TODO postLoadResult = await runMiddlewares('postLoad', postLoadPayload);

  return {
    stdin: childProc.stdin,
    stdout: childProc.stdout,
    stderr: childProc.stderr,
  };
}

export default setupExecutionEnvironment;
