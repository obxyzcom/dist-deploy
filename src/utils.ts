import { NodeSSH } from 'node-ssh';
import { readFile } from 'node:fs/promises';

interface AuthConfig {
  host: string;
  user: string;
  pass: string;
  key?: string;
}

interface DeployArgs {
  local_auth_file: string;
  remote_work_dir: string;
  remote_dist_dir: string;
  local_dist_dir: string;
  zip_file_name: string;
}

let ssh: NodeSSH;

async function distDeploy(argObj: DeployArgs): Promise<void> {
  const jsonRes = await getJSON<AuthConfig>(argObj.local_auth_file);
  const authConf = jsonRes?.status === 'ok' ? jsonRes.result : null;
  if (!authConf) {
    return;
  }

  ssh = new NodeSSH();
  try {
    await ssh.connect({
      host: authConf.host,
      username: authConf.user,
      password: authConf.pass,
      // privateKeyPath: authConf.key
    });

    console.log('ssh connected');

    const listStartStatus = await listDir(argObj.remote_dist_dir);
    console.log('listDir.start.status', listStartStatus);

    await putFile(
      `${argObj.local_dist_dir}${argObj.zip_file_name}`,
      `${argObj.remote_work_dir}${argObj.zip_file_name}`,
    );
    console.log('putFile.status', listStartStatus);

    await delFile(argObj.remote_dist_dir, argObj.remote_work_dir);
    console.log('delFile.status', listStartStatus);

    const unzipStatus = await unzipFile(
      `${argObj.remote_work_dir}${argObj.zip_file_name}`,
      argObj.remote_dist_dir,
      argObj.remote_work_dir,
    );
    console.log('unzipFile.status', unzipStatus);

    const listEndStatus = await listDir(argObj.remote_dist_dir);
    console.log('listDir.end.status', listEndStatus);
  } finally {
    ssh.dispose();
  }
}

async function listDir(dir: string) {
  const res = await ssh.execCommand('ls -l', { cwd: dir });
  return handleRes(res, 'listDir');
}

async function putFile(localFile: string, remoteFile: string) {
  try {
    await ssh.putFile(localFile, remoteFile);
    return { status: 'ok', des: 'putFile' };
  } catch (err) {
    return { status: 'err', des: 'putFile', msg: (err as Error).message };
  }
}

async function delFile(remoteDist: string, remoteDir: string) {
  const res = await ssh.execCommand(`rm -rf ${remoteDist}`, { cwd: `${remoteDir}` });
  return handleRes(res, 'delFile');
}

async function unzipFile(remoteFile: string, remoteDist: string, remoteDir: string) {
  const res = await ssh.execCommand(`unzip ${remoteFile} -d ${remoteDist}`, { cwd: `${remoteDir}` });
  return handleRes(res, 'unzipFile');
}

function handleRes(result: { stdout: string; stderr: string }, type: string) {
  if (result.stderr) {
    console.log('STDERR: ' + result.stderr);
    return { status: 'err', des: type };
  } else {
    console.log('STDOUT: ' + result.stdout);
    return { status: 'ok', des: type };
  }
}

async function getJSON<T>(path: string): Promise<{ desc: string; status: 'ok' | 'err'; result?: T; msg?: string }> {
  try {
    const str = await readFile(path, { encoding: 'utf8' });
    return { desc: 'getJSON', status: 'ok', result: JSON.parse(str) as T };
  } catch (err) {
    console.log('getJSON.err', (err as Error).message);
    return { desc: 'getJSON', status: 'err', msg: (err as Error).message.split(',')[0] };
  }
}

export { distDeploy };
