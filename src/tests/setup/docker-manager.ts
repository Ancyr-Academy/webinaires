import * as path from 'path';
import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
} from 'testcontainers';

let instance: StartedDockerComposeEnvironment | null = null;

export const startDocker = async () => {
  // TODO
  const composeFilePath = path.resolve(__dirname);
  const compileFile = 'docker-compose.yml';

  instance = await new DockerComposeEnvironment(
    composeFilePath,
    compileFile,
  ).up();
};

export const stopDocker = async () => {
  // TODO
  if (!instance) {
    return;
  }

  try {
    await instance.down();
    instance = null;
  } catch (e) {
    console.error('Failed to stop docker : ', e);
  }
};

export const getDockerEnvironment = (): StartedDockerComposeEnvironment => {
  if (!instance) {
    throw new Error('Instance is not available');
  }

  return instance;
};
