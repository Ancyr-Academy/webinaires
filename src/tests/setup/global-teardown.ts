import { stopDocker } from './docker-manager';

const teardown = async () => {
  await stopDocker();
};

export default teardown;
