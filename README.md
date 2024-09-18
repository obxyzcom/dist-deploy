# dist-deploy

## Deploy Local Front-End Files to a Remote Server

### Requirements:

Permissions: Access permissions for the remote server.
Local Package: Path to the locally packaged front-end files.
Remote Package: Path to the remote server for the package file.
Web Directory: Directory on the remote server where the website's files are hosted.

### Actions:

1. Connect to the Remote Server
   Establish a connection to the remote server using appropriate credentials.

2. Check Previous Deployment
   Verify the status and files of the previous deployment to ensure that any necessary cleanup can be performed.

3. Upload Local Package Files
   Transfer the locally packaged front-end files to the specified path on the remote server.

4. Delete Previous Deployment Files
   Remove outdated files from the remote server that are no longer needed.

5. Unzip the Uploaded Package
   Extract the contents of the uploaded package file into the designated directory.

6. Verify Current Deployment
   Ensure that the current deployment is correctly installed and functioning as expected.

## how to run

```bash
pnpm install @obxyz/dist-deploy
```

```js
import { distDeploy } from '@obxyz/dist-deploy';

// Need to be replaced with the actual path and file name
distDeploy({
  local_auth_file: '/demopath1/demoauthfile.json',
  remote_work_dir: '/demopath2/',
  remote_dist_dir: '/demopath3/',
  local_dist_dir: '/demopath4/',
  zip_file_name: 'demozipfile.zip',
});
```

- The auth file should look like:

```json
{
  "host": "10.10.10.10",
  "user": "username",
  "pass": "password"
}
```
