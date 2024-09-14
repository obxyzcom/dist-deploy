const { NodeSSH } = require('node-ssh');
const { readFile } = require('node:fs/promises');

let ssh;
// distDeploy({
//   local_auth_file:'xxx.json',
//   remote_work_dir: '/home/xxx/',
//   remote_dist_dir: '/home/xxx/dist',
//   local_dist_dir: '/project/xxx/dist/',
//   zip_file_name: 'xxx.zip'
// });
async function distDeploy(argObj) {
  const jsonRes = await getJSON(argObj.local_auth_file);
  const authConf = jsonRes?.status == 'ok' ? jsonRes.result : null;
  if (!authConf) {
    return;
  }
  ssh = new NodeSSH();
  // prettier-ignore
  ssh.connect({
    host: authConf.host,
    username: authConf.user,
    password: authConf.pass,
    // privateKeyPath: authConf.key
  }).then(() => {
    console.log('ssh connected');
    whoAmI(`${argObj.remote_work_dir}`).then((status)=>{
      console.log('whoAmI.status',status)
    })
    listDir(`${argObj.remote_dist_dir}`).then((status)=>{
      console.log('listDir.start.status',status)
    })
    return;
    // upload, clean, unpack, list
    putFile(`${argObj.local_dist_dir}${argObj.zip_file_name}`,`${argObj.remote_work_dir}${argObj.zip_file_name}`).then(status=>{
      console.log('putFile.status',status)
      delFile(`${argObj.remote_dist_dir}`,`${argObj.remote_work_dir}`).then(status=>{
        console.log('delFile.status',status)
        unzipFile(`${argObj.remote_work_dir}${argObj.zip_file_name}`,`${argObj.remote_dist_dir}`,`${argObj.remote_work_dir}`).then(status=>{
          console.log('unzipFile.status',status)
          listDir(`${argObj.remote_dist_dir}`).then((status)=>{
            console.log('listDir.end.status',status)
            ssh.dispose();
          })
        })
      })
    })
    // ssh.dispose();
  })
}

function whoAmI(dir){
  return ssh.execCommand('who', { cwd: dir }).then((res) => handleRes(res,'whoAmI'));
}
function listDir(dir) {
  return ssh.execCommand('ls -l', { cwd: dir }).then((res) => handleRes(res,'listDir'));
}
function putFile(localFile, remoteFile) {
  return ssh.putFile(localFile, remoteFile).then(
    () => {
      return { status: 'ok', des: 'putFile' };
    },
    (err) => {
      return { status: 'err', des: 'putFile', msg: err.message };
    },
  );
}
function delFile(remoteDist,remoteDir) {
  return ssh.execCommand(`rm -rf ${remoteDist}`, { cwd: `${remoteDir}` }).then((res) => handleRes(res,'delFile'));
}
function unzipFile(remoteFile,remoteDist,remoteDir) {
  return ssh.execCommand(`unzip ${remoteFile} -d ${remoteDist}`, { cwd: `${remoteDir}` }).then((res) => handleRes(res,'unzipFile'));
}

/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
function handleRes(result,type) {
  if (result.stderr) {
    console.log('STDERR: ' + result.stderr);
    return { status: 'err', des: type };
  } else {
    console.log('STDOUT: ' + result.stdout);
    return { status: 'ok', des: type };;
  }
}
async function getJSON(path) {
  try {
    const str = await readFile(path, { encoding: 'utf8' });
    return { desc: 'getJSON', status: 'ok', result: JSON.parse(str) };
  } catch (err) {
    console.log('getJSON.err', err.message);
    return { desc: 'getJSON', status: 'err', msg: err.message.split(',')[0] };
  }
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
module.exports={
  distDeploy
}