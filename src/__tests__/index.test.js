import fs from 'fs-extra';
import { join, resolve } from 'path';
import { dir as createTempDir, file as createTempFile } from 'temporarily';
import del from 'del';
import execa from 'execa';
import archive from 'ls-archive';
import { name as thisPackageName } from '../../package.json';

const DEFAULT_PKG_JSON = {
  name: 'test-pkg',
  private: true,
  version: '0.0.0-develop',
  scripts: {
    build: 'pack build'
  },
  '@pika/pack': {
    'pipeline': [
      [
        '@pika/plugin-standard-pkg'
      ],
      [
        '@pika/plugin-build-node',
        {
          'minNodeVersion': '8'
        }
      ],
      [
        thisPackageName
      ]
    ]
  },
  'devDependencies': {
    '@pika/pack': '^0.3.1',
    '@pika/plugin-build-node': '^0.3.10',
    '@pika/plugin-standard-pkg': '^0.3.10',
    [thisPackageName]: resolve(__dirname, '../../pkg')
  }
};

describe('@ryaninvents/plugin-bundle-dependencies', () => {
  let createdDirs = [];

  async function initRepo ({ packageJson: pkg = DEFAULT_PKG_JSON, packageManager = 'npm', stdio } = {}) {
    const { filepath: workingDir } = createTempDir(
      { name: 'test-repo-{wwwwdddd}' },
      [createTempDir({ name: 'src' }, [
        createTempFile({ name: 'index.js', data: 'console.log("Hello world");' })
      ])]
    );
    let packageJson = pkg;
    if (typeof packageJson === 'function') {
      packageJson = packageJson(workingDir);
    }
    await fs.writeFile(join(workingDir, 'package.json'), JSON.stringify(packageJson, null, 2));
    await execa('npm', ['install'], {
      cwd: workingDir,
      env: { NODE_ENV: 'development' }
    });
    createdDirs.push(workingDir);
    return { workingDir };
  }

  afterEach(async () => {
    await del(createdDirs, { force: true });
    createdDirs = [];
  });

  it('should create a zip file with contents of dist-node', async () => {
    const { workingDir } = await initRepo({
      packageJson: {
        ...DEFAULT_PKG_JSON,
        dependencies: {
          // Use a couple of packages known to basically be one-liners
          // in order to test quickly
          'is-sorted': 'latest',
          'map-obj': 'latest'
        }
      },
      stdio: 'inherit'
    });
    await execa('npm', ['run', 'build'], {
      env: { NODE_ENV: 'production' },
      cwd: workingDir
    });
    expect(async () => fs.access(`${workingDir}/pkg/package.json`, fs.constants.F_OK))
      .not.toThrow();
    expect(async () => fs.access(`${workingDir}/pkg/dist-node.zip`, fs.constants.F_OK))
      .not.toThrow();
    const archiveEntries = await new Promise((resolve, reject) => {
      archive.list(`${workingDir}/pkg/dist-node.zip`, (err, results) => {
        if (err) return reject(err);
        return resolve(results.map(file => file.getPath()).sort());
      });
    });
    expect(archiveEntries).toMatchSnapshot();
  }, 60e3);

  it('should honor "preserve" option', async () => {
    const { workingDir } = await initRepo({
      packageJson: {
        ...DEFAULT_PKG_JSON,
        '@pika/pack': {
          'pipeline': [
            [
              '@pika/plugin-standard-pkg'
            ],
            [
              '@pika/plugin-build-node',
              {
                'minNodeVersion': '8'
              }
            ],
            [
              thisPackageName,
              { preserve: true }
            ]
          ]
        },
        dependencies: {
          // Use a couple of packages known to basically be one-liners
          // in order to test quickly
          'is-sorted': 'latest',
          'map-obj': 'latest'
        }
      },
      stdio: 'inherit'
    });
    await execa('npm', ['run', 'build'], {
      env: { NODE_ENV: 'production' },
      cwd: workingDir
    });
    expect(async () => fs.access(`${workingDir}/pkg/package.json`, fs.constants.F_OK))
      .not.toThrow();
    expect(async () => fs.access(`${workingDir}/pkg/dist-node.zip`, fs.constants.F_OK))
      .not.toThrow();
    const archiveEntries = await new Promise((resolve, reject) => {
      archive.list(`${workingDir}/pkg/dist-node.zip`, (err, results) => {
        if (err) return reject(err);
        return resolve(results.map(file => file.getPath()).sort());
      });
    });
    expect(archiveEntries).toMatchSnapshot();
  }, 60e3);

  it('should honor "directory" and "bundleName" options', async () => {
    const { workingDir } = await initRepo({
      packageJson: {
        ...DEFAULT_PKG_JSON,
        '@pika/pack': {
          'pipeline': [
            [
              '@pika/plugin-standard-pkg'
            ],
            [
              '@pika/plugin-build-node',
              {
                'minNodeVersion': '8'
              }
            ],
            [
              thisPackageName,
              { directory: 'dist-src', bundleName: 'src' }
            ]
          ]
        },
        dependencies: {
          // Use a couple of packages known to basically be one-liners
          // in order to test quickly
          'is-sorted': 'latest',
          'map-obj': 'latest'
        }
      },
      stdio: 'inherit'
    });
    await execa('npm', ['run', 'build'], {
      env: { NODE_ENV: 'production' },
      cwd: workingDir
    });
    expect(async () => fs.access(`${workingDir}/pkg/package.json`, fs.constants.F_OK))
      .not.toThrow();
    expect(async () => fs.access(`${workingDir}/pkg/dist-src.zip`, fs.constants.F_OK))
      .not.toThrow();
    const archiveEntries = await new Promise((resolve, reject) => {
      archive.list(`${workingDir}/pkg/dist-src.zip`, (err, results) => {
        if (err) return reject(err);
        return resolve(results.map(file => file.getPath()).sort());
      });
    });
    expect(archiveEntries).toMatchSnapshot();
  }, 60e3);
});
