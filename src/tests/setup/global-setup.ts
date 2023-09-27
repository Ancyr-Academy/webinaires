import { startDocker } from './docker-manager';

const setup = async () => {
  await startDocker();
};

export default setup;
